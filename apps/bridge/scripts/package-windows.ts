/**
 * Builds the Windows download (0003, 0020): one zip with a portable Node.js, the bridge bundled
 * into a single file, the built app and a launcher. Runs on any OS, so it can be built in CI.
 *
 * Expects the app to be built (`npm run build`); `npm run package:windows` at the root does both.
 */
import { build } from 'esbuild';
import { unzipSync, zipSync, type Zippable } from 'fflate';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Pinned so every build of a commit ships the same Node; bump it on purpose. */
const NODE_VERSION = '24.22.3';
const NODE_DIST = `https://nodejs.org/dist/v${NODE_VERSION}`;
const NODE_ZIP = `node-v${NODE_VERSION}-win-x64.zip`;

/** The folder the zip extracts to. Keeping it the same keeps the firewall rule for node.exe. */
const FOLDER = 'MFDIY';
const ZIP_NAME = 'MFDIY-windows-x64.zip';

const bridgeRoot = fileURLToPath(new URL('..', import.meta.url));
const repoRoot = join(bridgeRoot, '..', '..');
const appBuild = join(repoRoot, 'apps', 'app', 'build', 'client');
const cacheDirectory = join(repoRoot, 'node_modules', '.cache', 'mfdiy-windows');
const outputDirectory = join(repoRoot, 'dist');

const crlf = (text: string) => text.replace(/\r?\n/g, '\r\n');
const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const encode = (text: string) => new TextEncoder().encode(text);

async function download(url: string): Promise<Uint8Array> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not download ${url}: ${response.status} ${response.statusText}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

/** Node's official Windows zip, checked against the release's SHASUMS256.txt, cached between builds. */
async function nodeForWindows(): Promise<{ exe: Uint8Array; license: Uint8Array }> {
  const sums = new TextDecoder().decode(await download(`${NODE_DIST}/SHASUMS256.txt`));
  const expected = sums
    .split('\n')
    .map(line => line.trim().split(/\s+/))
    .find(([, file]) => file === NODE_ZIP)?.[0];

  if (!expected) {
    throw new Error(`${NODE_ZIP} is not listed in ${NODE_DIST}/SHASUMS256.txt`);
  }

  const cached = join(cacheDirectory, NODE_ZIP);
  let zip: Uint8Array | undefined = existsSync(cached) ? new Uint8Array(await readFile(cached)) : undefined;

  if (!zip || sha256(zip) !== expected) {
    console.log(`Downloading ${NODE_DIST}/${NODE_ZIP}`);
    zip = await download(`${NODE_DIST}/${NODE_ZIP}`);

    const actual = sha256(zip);

    if (actual !== expected) {
      throw new Error(`${NODE_ZIP} has SHA-256 ${actual}, but SHASUMS256.txt says ${expected}`);
    }

    await mkdir(cacheDirectory, { recursive: true });
    await writeFile(cached, zip);
  }

  const prefix = `node-v${NODE_VERSION}-win-x64/`;
  const files = unzipSync(zip, {
    filter: file => file.name === `${prefix}node.exe` || file.name === `${prefix}LICENSE`
  });
  const exe = files[`${prefix}node.exe`];
  const license = files[`${prefix}LICENSE`];

  if (!exe || !license) {
    throw new Error(`${NODE_ZIP} has no node.exe or LICENSE`);
  }

  return { exe, license };
}

function describeBuild(): string {
  const date = new Date().toISOString().slice(0, 10);

  try {
    const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim();

    return `build ${commit}, ${date}`;
  } catch {
    return `build of ${date}`;
  }
}

/** The bridge and everything it imports in one ES module, plus the licences of what it bundles. */
async function bundleBridge(buildName: string): Promise<{ code: Uint8Array; notices: string }> {
  const result = await build({
    entryPoints: [join(bridgeRoot, 'src', 'main.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node24',
    write: false,
    outfile: 'bridge.mjs',
    metafile: true,
    absWorkingDir: repoRoot,
    // CommonJS dependencies (ws, qrcode, sirv) call require(), which ES modules don't have.
    banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
    define: { 'process.env.MFDIY_BUILD': JSON.stringify(buildName) },
    // Optional native speed-ups of ws; it works without them.
    external: ['bufferutil', 'utf-8-validate'],
    logLevel: 'warning'
  });

  const [output] = result.outputFiles;

  if (!output) {
    throw new Error('esbuild produced no bridge.mjs');
  }

  return { code: output.contents, notices: await thirdPartyNotices(Object.keys(result.metafile.inputs)) };
}

async function thirdPartyNotices(inputs: string[]): Promise<string> {
  const packageDirectories = new Set<string>();

  for (const input of inputs) {
    const parts = input.split('/');
    const index = parts.lastIndexOf('node_modules');

    if (index >= 0) {
      const length = parts[index + 1]?.startsWith('@') ? 3 : 2;

      packageDirectories.add(join(repoRoot, ...parts.slice(0, index + length)));
    }
  }

  const sections: string[] = [];

  for (const directory of [...packageDirectories].sort()) {
    const manifest = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8')) as {
      license?: string;
      name: string;
      version: string;
    };
    const licenseFile = (await readdir(directory)).find(file => /^(licen[cs]e|copying)/i.test(file));
    const text = licenseFile ? await readFile(join(directory, licenseFile), 'utf8') : `License: ${manifest.license}`;

    sections.push(`${manifest.name} ${manifest.version}\n${'-'.repeat(40)}\n\n${text.trim()}\n`);
  }

  return `The bridge (bridge.mjs) includes the following packages.\n\n${sections.join('\n\n')}`;
}

async function appFiles(): Promise<Zippable> {
  if (!existsSync(join(appBuild, 'index.html'))) {
    throw new Error(`The app isn't built: ${appBuild} has no index.html. Run \`npm run build\` first.`);
  }

  const files: Zippable = {};

  for (const entry of await readdir(appBuild, { recursive: true, withFileTypes: true })) {
    if (entry.isFile()) {
      const path = join(entry.parentPath, entry.name);

      files[relative(appBuild, path).split(sep).join('/')] = new Uint8Array(await readFile(path));
    }
  }

  return files;
}

const buildName = describeBuild();
const [node, bridge, app] = await Promise.all([nodeForWindows(), bundleBridge(buildName), appFiles()]);
const windows = join(bridgeRoot, 'windows');
const readme = await readFile(join(windows, 'README.txt'), 'utf8');

const files: Zippable = {
  'MFDIY.cmd': encode(crlf(await readFile(join(windows, 'MFDIY.cmd'), 'utf8'))),
  'README.txt': encode(crlf(`${readme.trimEnd()}\n\nMFDIY ${buildName}, Node.js ${NODE_VERSION}\n`)),
  'LICENSE.txt': encode(crlf(await readFile(join(repoRoot, 'LICENSE'), 'utf8'))),
  node: { 'node.exe': node.exe, 'LICENSE.txt': encode(crlf(new TextDecoder().decode(node.license))) },
  bridge: { 'bridge.mjs': bridge.code, 'THIRD-PARTY-NOTICES.txt': encode(crlf(bridge.notices)) },
  app
};

const zip = zipSync({ [FOLDER]: files }, { level: 9, mtime: new Date() });
const target = join(outputDirectory, ZIP_NAME);

await mkdir(dirname(target), { recursive: true });
await writeFile(target, zip);

console.log(`${relative(repoRoot, target)}: ${(zip.length / 1024 / 1024).toFixed(1)} MB, ${buildName}`);
