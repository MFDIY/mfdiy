import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

import { Box } from '@mfdiy/ui/components';
import { expect, fn, userEvent, within } from 'storybook/test';

import { applyTokens } from '../theme/applyTokens.js';
import { root } from '../theme/root.css.js';
import { builtInThemes } from '../theme/themes.js';

import { EngageScreen } from './EngageScreen.js';

/** Draws the screen at the size of a profile on a tablet, in the theme picked in the toolbar. */
const screenFrame: Decorator = (Story, context) => {
  const theme = builtInThemes.find(candidate => candidate.name === context.globals['theme']) ?? builtInThemes[0];

  return (
    <Box className={root} cssVariables={applyTokens(theme?.tokens)}>
      <div style={{ height: '375px', width: '600px' }}>
        <Story />
      </div>
    </Box>
  );
};

const meta = {
  title: 'Screens / EngageScreen',
  component: EngageScreen,
  decorators: [screenFrame],
  argTypes: {
    name: { control: { type: 'text' } },
    onEngage: { control: false }
  },
  args: {
    name: undefined,
    onEngage: undefined
  }
} satisfies Meta<typeof EngageScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

/** As on a profile opened directly: its name above the prompt. */
export const WithName = { args: { name: 'Hornet Mk II' } } satisfies Story;

export const AmberCrt = { args: { name: 'Hornet Mk II' }, globals: { theme: 'Amber CRT' } } satisfies Story;

/** A tap anywhere on it engages. */
export const Tapping = {
  args: { name: 'Hornet Mk II', onEngage: fn() },
  tags: ['!dev', '!visual'],
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Tap to engage/ }));
    await expect(args.onEngage).toHaveBeenCalledOnce();
  }
} satisfies Story;
