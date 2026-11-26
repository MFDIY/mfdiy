import type { StorybookConfig } from '@storybook/react-vite';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export default {
  stories: ['../src/**/*.stories.@(ts|tsx)'],

  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {
      strictMode: true
    }
  },

  addons: ['@storybook/addon-vitest']
} satisfies StorybookConfig;

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
