import type { StorybookConfig } from '@storybook/react-vite';

export default {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  framework: {
    name: '@storybook/react-vite',
    options: {
      strictMode: true
    }
  }
} satisfies StorybookConfig;
