import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, screen, userEvent } from 'storybook/test';

import { Button } from '../Button/Button.js';

import { ToastProvider, useToast } from './Toast.js';

type ToastDemoProps = {
  /** What the toast says. */
  message: string;
};

/** Toasts are shown from code with `useToast`, so the story is a button that shows one. */
function ToastDemo({ message }: ToastDemoProps) {
  const toast = useToast();

  return <Button onClick={() => toast.show(message)}>Show toast</Button>;
}

const meta = {
  title: 'Components / Toast',
  component: ToastDemo,
  argTypes: {
    message: { control: { type: 'text' } }
  },
  args: {
    message: 'Tap a cell, or drag a widget onto the page.'
  },
  decorators: [
    Story => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    )
  ]
} satisfies Meta<typeof ToastDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Press the button. Put `ToastProvider` once around the app, and call `useToast().show(message)`. */
export const Default = {} satisfies Story;

/** Shown at the bottom of the screen. */
export const Shown = {
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Show toast' }));

    const toast = await screen.findByText('Tap a cell, or drag a widget onto the page.');

    await Promise.all(
      toast
        .closest('[role]')
        ?.getAnimations({ subtree: true })
        .map(animation => animation.finished) ?? []
    );
  }
} satisfies Story;

/** Showing the same message again keeps one toast rather than stacking them. */
export const NoDuplicates = {
  tags: ['!dev', '!visual'],
  play: async () => {
    const button = screen.getByRole('button', { name: 'Show toast' });

    await userEvent.click(button);
    await userEvent.click(button);
    await expect(await screen.findAllByText('Tap a cell, or drag a widget onto the page.')).toHaveLength(1);
  }
} satisfies Story;
