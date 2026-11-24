import type { Config } from '@react-router/dev/config';

/** SPA mode: the bridge serves the built files on the LAN (see docs/decisions/0003 and 0004). */
export default {
  appDirectory: 'src',
  ssr: false
} satisfies Config;
