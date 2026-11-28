import type { Meta, StoryObj } from '@storybook/react-vite';

import { amberCrt, pageToken } from '@mfdiy/instruments';
import { Box } from '@mfdiy/ui/components';
import { expect, fn, userEvent, within } from 'storybook/test';

import { AppHeader, keepAwakeMethods } from './AppHeader.js';

const phone = { viewport: { value: 'mobile2', isRotated: false } };

const accents = {
  Phosphor: pageToken('accent', undefined, undefined),
  'Amber CRT': pageToken('accent', amberCrt.tokens, undefined)
};

const meta = {
  title: 'Builder/AppHeader',
  component: AppHeader,
  argTypes: {
    accent: { control: { type: 'select' }, options: [undefined, ...Object.values(accents)] },
    keepAwake: { control: { type: 'select' }, options: [undefined, ...keepAwakeMethods] }
  },
  args: {
    accent: undefined,
    keepAwake: undefined,
    onConnect: undefined,
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

/** On the home page, with the way to connect a phone or tablet (0004). */
export const Home = {
  args: { onConnect: fn() }
} satisfies Story;

/** On a profile: the logomark leads home, in the accent of the page shown; Edit and Fullscreen on the right. */
export const Profile = {
  args: { accent: accents.Phosphor, onEdit: fn(), onFullscreen: fn(), onHome: fn() }
} satisfies Story;

export const ProfileAmber = {
  args: { accent: accents['Amber CRT'], onEdit: fn(), onFullscreen: fn(), onHome: fn() }
} satisfies Story;

/** Once engaged, how the screen is kept on, with a hint behind it (0005). */
export const KeptAwake = {
  args: { accent: accents.Phosphor, keepAwake: 'video', onEdit: fn(), onFullscreen: fn(), onHome: fn() }
} satisfies Story;

/** Where the browser refused, a warning, whose hint points to the device's settings. */
export const ScreenMayTurnOff = {
  args: { accent: accents.Phosphor, keepAwake: 'unavailable', onEdit: fn(), onFullscreen: fn(), onHome: fn() },
  globals: phone,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Screen may turn off' }));
    await expect(await within(canvasElement.ownerDocument.body).findByText(/won’t keep the screen on/)).toBeVisible();
  }
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
  args: { onConnect: fn(), onEdit: fn(), onFullscreen: fn(), onHome: fn() },
  tags: ['!dev', '!visual'],
  play: async ({ args, canvasElement }) => {
    const header = within(canvasElement);

    await userEvent.click(header.getByRole('button', { name: 'All profiles' }));
    await expect(args.onHome).toHaveBeenCalledOnce();
    await userEvent.click(header.getByRole('button', { name: 'Connect a device' }));
    await expect(args.onConnect).toHaveBeenCalledOnce();
    await userEvent.click(header.getByRole('button', { name: 'Edit' }));
    await expect(args.onEdit).toHaveBeenCalledOnce();
    await userEvent.click(header.getByRole('button', { name: 'Fullscreen' }));
    await expect(args.onFullscreen).toHaveBeenCalledOnce();
  }
} satisfies Story;
