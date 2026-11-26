import type { TestProjectInlineConfiguration } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { join } from 'node:path';

/**
 * Vitest projects for a package with a Storybook (0021):
 *
 * - `unit`: `*.test.ts(x)` files, in Node.
 * - `storybook`: every story as a test in Chromium. It renders, runs its `play` function and a11y
 *   checks, and is compared with its screenshot (see `storybook.setup.ts`).
 *
 * Use as `test: { projects: storybookPackageProjects(import.meta.dirname) }` in `vite.config.ts`.
 */
export function storybookPackageProjects(packageDir: string): TestProjectInlineConfiguration[] {
  return [
    {
      extends: true,
      test: {
        name: 'unit',
        include: ['src/**/*.test.{ts,tsx}'],
        // Vitest keys its module cache on each file alone, but a .css.ts is evaluated with what it
        // imports, so a change to the styles' values would leave tests running on stale ones.
        fsModuleCache: false
      }
    },
    {
      extends: true,
      plugins: [storybookTest({ configDir: join(packageDir, '.storybook') })],
      // Found late otherwise, so Vite reloads the page mid-run on a cold cache and tests fail.
      optimizeDeps: {
        include: [
          '@vanilla-extract/sprinkles/createRuntimeSprinkles',
          '@vanilla-extract/sprinkles/createUtils',
          '@base-ui/react/autocomplete',
          '@base-ui/react/drawer',
          '@base-ui/react/field',
          '@base-ui/react/menu',
          '@base-ui/react/number-field',
          '@base-ui/react/radio',
          '@base-ui/react/radio-group',
          '@base-ui/react/select',
          '@base-ui/react/switch',
          '@base-ui/react/tabs',
          '@base-ui/react/tooltip',
          'sonner'
        ]
      },
      test: {
        name: 'storybook',
        fsModuleCache: false,
        setupFiles: [join(import.meta.dirname, 'storybook.setup.ts')],
        browser: {
          enabled: true,
          headless: true,
          // Motion that depends on timing, like a placeholder typing itself, would never screenshot the same.
          provider: playwright({ contextOptions: { reducedMotion: 'reduce' } }),
          instances: [{ browser: 'chromium' }],
          expect: {
            toMatchScreenshot: {
              comparatorName: 'pixelmatch',
              // Baselines are made on the same machine, so every pixel must match exactly.
              comparatorOptions: { threshold: 0 }
            }
          }
        }
      }
    }
  ];
}
