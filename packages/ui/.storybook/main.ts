import type { StorybookConfig } from '@storybook/react-vite';

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
  addons: ['@storybook/addon-links', '@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  docs: {
    defaultName: 'Documentation'
  },
  framework: {
    name: '@storybook/react-vite',
    options: {
      strictMode: true
    }
  }
} satisfies StorybookConfig;
