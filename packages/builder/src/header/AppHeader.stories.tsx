import type { Meta, StoryObj } from '@storybook/react-vite';

import { amberCrt, pageToken } from '@mfdiy/instruments';
import { Box } from '@mfdiy/ui/components';
import { expect, fn, userEvent, within } from 'storybook/test';

import { AppHeader } from './AppHeader.js';

const phone = { viewport: { value: 'mobile2', isRotated: false } };

const accents = {
  Phosphor: pageToken('accent', undefined, undefined),
  'Amber CRT': pageToken('accent', amberCrt.tokens, undefined)
};

const meta = {
  title: 'Builder/AppHeader',
  component: AppHeader,
  argTypes: {
    accent: { control: { type: 'select' }, options: [undefined, ...Object.values(accents)] }
  },
  args: {
    accent: undefined,
    onEdit: undefined,
    onFullscreen: undefined,
    onHome: undefined
  },
  render: args => (
    <Box backgroundColor='surface' borderBottomColor='line' borderBottomStyle='solid' borderBottomWidth='hairline'>
      <AppHeader {...args} />
    </Box>
  )
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As on the home page: only the logomark, which is already home. */
export const Default = {} satisfies Story;

/** On a profile: the logomark leads home, in the accent of the page shown; Edit and Fullscreen on the right. */
export const Profile = {
  args: { accent: accents.Phosphor, onEdit: fn(), onFullscreen: fn(), onHome: fn() }
} satisfies Story;

export const ProfileAmber = {
  args: { accent: accents['Amber CRT'], onEdit: fn(), onFullscreen: fn(), onHome: fn() }
} satisfies Story;

/** Where the browser can't go fullscreen (Safari on an iPhone), there's no button for it. */
export const WithoutFullscreen = {
  args: { accent: accents.Phosphor, onEdit: fn(), onHome: fn() },
  globals: phone
} satisfies Story;

export const Phone = {
  args: { accent: accents.Phosphor, onEdit: fn(), onFullscreen: fn(), onHome: fn() },
  globals: phone
} satisfies Story;

/** Each control does one thing. */
export const Pressing = {
  args: { onEdit: fn(), onFullscreen: fn(), onHome: fn() },
  tags: ['!dev', '!visual'],
  play: async ({ args, canvasElement }) => {
    const header = within(canvasElement);

    await userEvent.click(header.getByRole('button', { name: 'All profiles' }));
    await expect(args.onHome).toHaveBeenCalledOnce();
    await userEvent.click(header.getByRole('button', { name: 'Edit' }));
    await expect(args.onEdit).toHaveBeenCalledOnce();
    await userEvent.click(header.getByRole('button', { name: 'Fullscreen' }));
    await expect(args.onFullscreen).toHaveBeenCalledOnce();
  }
} satisfies Story;
