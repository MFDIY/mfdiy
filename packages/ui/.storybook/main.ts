import type { StorybookConfig } from '@storybook/react-vite';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export default {
  // this is required due to Vite not setting process.env but storybook expecting it
  // https://github.com/storybookjs/storybook/issues/18920
  async viteFinal(inlineConfig) {
    const { mergeConfig } = await import('vite');
    return mergeConfig(inlineConfig, {
      define: { 'process.env': {} }
    });
  },
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-themes'),
    getAbsolutePath('@storybook/addon-vitest')
  ],
  docs: {
    defaultName: 'Documentation'
  },
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {
      strictMode: true
    }
  }
} satisfies StorybookConfig;

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
