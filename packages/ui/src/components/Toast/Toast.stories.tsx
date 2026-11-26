import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { Button } from '../Button/Button.js';
import { Inline } from '../Inline/Inline.js';

import { ToastProvider, useToast, type ToastOptions } from './Toast.js';

type ToastDemoProps = ToastOptions & {
  /** What the toast says. */
  title: string;
};

/** Toasts are shown from code with `useToast`, so the story is a button that shows one. */
function ToastDemo({ title, ...options }: ToastDemoProps) {
  const toast = useToast();

  return (
    <Inline spacing='3x'>
      <Button onClick={() => toast.show(title, options)}>Show toast</Button>
      <Button onClick={() => toast.show('Saved', { description: 'Displays keep showing the saved version.' })}>
        Show another
      </Button>
    </Inline>
  );
}

/** Waits until toasts from an earlier story have gone: the provider dismisses them as a story starts. */
async function cleared() {
  await waitFor(() => expect(document.querySelector('[data-sonner-toast]')).toBeNull(), { timeout: 3000 });
}

/** Waits until every toast is in place and nothing moves any more. */
async function settled() {
  await waitFor(
    () => {
      expect(document.querySelector('[data-sonner-toast]')).not.toBeNull();
      expect(document.querySelector('[data-sonner-toast][data-mounted="false"]')).toBeNull();
      expect(document.getAnimations().filter(animation => animation.playState === 'running')).toHaveLength(0);
    },
    { timeout: 3000 }
  );
}

const meta = {
  title: 'Components / Toast',
  component: ToastDemo,
  argTypes: {
    autoDismiss: { control: { type: 'boolean' } },
    description: { control: { type: 'text' } },
    dismissible: { control: { type: 'boolean' } },
    id: { control: false },
    title: { control: { type: 'text' } }
  },
  args: {
    autoDismiss: true,
    description: undefined,
    dismissible: false,
    id: undefined,
    title: 'Tap a cell, or drag a widget onto the page.'
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

/** Press the button. Put `ToastProvider` once around the app, and call `useToast().show(title, options)`. */
export const Default = {} satisfies Story;

export const Shown = {
  play: async () => {
    await cleared();
    await userEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    await settled();
  }
} satisfies Story;

/** With a close button, staying until it's used. */
export const Dismissible = {
  args: { autoDismiss: false, dismissible: true },
  play: async () => {
    await cleared();
    await userEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    await settled();
  }
} satisfies Story;

/** Different toasts stack, newest in front; hover to spread them out. */
export const Stacked = {
  // Sonner's stacking motion depends on timing, so this checks the stack rather than a screenshot.
  tags: ['!visual'],
  play: async () => {
    await cleared();
    await userEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    await userEvent.click(screen.getByRole('button', { name: 'Show another' }));
    await settled();

    const toasts = [...document.querySelectorAll('[data-sonner-toast]:not([data-removed="true"])')];

    await expect(toasts).toHaveLength(2);
    await expect(toasts.find(toast => toast.getAttribute('data-front') === 'true')).toHaveTextContent('Saved');
  }
} satisfies Story;

/** Showing the same toast again keeps one rather than stacking them. */
export const NoDuplicates = {
  tags: ['!dev', '!visual'],
  play: async () => {
    await cleared();

    const button = screen.getByRole('button', { name: 'Show toast' });

    await userEvent.click(button);
    await userEvent.click(button);

    // Only toasts on screen count, not ones from earlier stories still sliding away.
    await waitFor(() =>
      expect(
        screen
          .queryAllByText('Tap a cell, or drag a widget onto the page.')
          .filter(text => text.closest('[data-sonner-toast]')?.getAttribute('data-removed') !== 'true')
      ).toHaveLength(1)
    );
  }
} satisfies Story;

export const DismissCloses = {
  tags: ['!dev', '!visual'],
  args: { autoDismiss: false, dismissible: true },
  play: async () => {
    await cleared();
    await userEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Dismiss' }));
    // Closing means sonner lets it go: every toast with this text is leaving or gone.
    await waitFor(() =>
      expect(
        screen
          .queryAllByText('Tap a cell, or drag a widget onto the page.')
          .every(text => text.closest('[data-sonner-toast]')?.getAttribute('data-removed') === 'true')
      ).toBe(true)
    );
  }
} satisfies Story;

/** Every toast is as wide as the others, however short its text. */
export const SameWidth = {
  tags: ['!dev', '!visual'],
  play: async () => {
    await cleared();
    await userEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    await userEvent.click(screen.getByRole('button', { name: 'Show another' }));
    await settled();

    // Layout widths: in a collapsed stack, sonner scales the toasts behind the newest down a little.
    const widths = [...document.querySelectorAll<HTMLElement>('[data-sonner-toast]:not([data-removed="true"])')].map(
      toast => toast.offsetWidth
    );

    await expect(widths).toHaveLength(2);
    await expect(widths[0]).toBe(widths[1]);
  }
} satisfies Story;
