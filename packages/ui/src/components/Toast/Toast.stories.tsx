import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { Button } from '../Button/Button.js';
import { Inline } from '../Inline/Inline.js';

import { ToastProvider, useToast, type ToastOptions } from './Toast.js';

type ToastDemoProps = ToastOptions & {
  /** What the toast says. */
  title: string;
  /** The story showing the toasts: their ids start with it, so no story updates another's toast. */
  storyId?: string | undefined;
};

/** Toasts are shown from code with `useToast`, so the story is a button that shows one. */
function ToastDemo({ storyId = 'toast', title, ...options }: ToastDemoProps) {
  const toast = useToast();

  return (
    <Inline spacing='3x'>
      <Button onClick={() => toast.show(title, { ...options, id: options.id ?? storyId })}>Show toast</Button>
      <Button
        onClick={() =>
          toast.show('Saved', { description: 'MFDs keep showing the saved version.', id: `${storyId} another` })
        }
      >
        Show another
      </Button>
    </Inline>
  );
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
    action: { control: false },
    autoDismiss: { control: { type: 'boolean' } },
    description: { control: { type: 'text' } },
    dismissible: { control: { type: 'boolean' } },
    id: { control: false },
    storyId: { table: { disable: true } },
    title: { control: { type: 'text' } }
  },
  args: {
    action: undefined,
    autoDismiss: true,
    description: undefined,
    dismissible: false,
    id: undefined,
    title: 'Tap a cell, or drag a widget onto the page.'
  },
  render: (args, { id }) => <ToastDemo {...args} storyId={id} />,
  decorators: [
    (Story, { id }) => (
      <ToastProvider key={id}>
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
    await userEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    await settled();
  }
} satisfies Story;

/** With a close button, staying until it's used. */
export const Dismissible = {
  args: { autoDismiss: false, dismissible: true },
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    await settled();
  }
} satisfies Story;

/** With an action beside the text, such as Undo after deleting something. Pressing it closes the toast. */
export const WithAction = {
  args: { action: { label: 'Undo', onClick: () => undefined }, title: '“Page 2” deleted' },
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    await settled();
  }
} satisfies Story;

export const ActionCloses = {
  tags: ['!dev', '!visual'],
  args: { action: { label: 'Undo', onClick: () => undefined }, autoDismiss: false, title: '“Page 2” deleted' },
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }));
    await waitFor(() =>
      expect(
        screen
          .queryAllByText('“Page 2” deleted')
          .every(text => text.closest('[data-sonner-toast]')?.getAttribute('data-removed') === 'true')
      ).toBe(true)
    );
  }
} satisfies Story;

/** Different toasts stack, newest in front; hover to spread them out. */
export const Stacked = {
  // Sonner's stacking motion depends on timing, so this checks the stack rather than a screenshot.
  tags: ['!visual'],
  play: async () => {
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

/** Swipes the newest toast sideways, as a finger would. */
async function swipe() {
  const toast = document.querySelector<HTMLElement>('[data-sonner-toast]:not([data-removed="true"])');

  if (!toast) {
    throw new Error('No toast to swipe');
  }

  const { left, top, height } = toast.getBoundingClientRect();
  const at = (x: number) => ({ clientX: left + 40 + x, clientY: top + height / 2 });

  await userEvent.pointer([
    { keys: '[MouseLeft>]', target: toast, coords: at(0) },
    { target: toast, coords: at(30) },
    { target: toast, coords: at(90) },
    { target: toast, coords: at(150) },
    { keys: '[/MouseLeft]', target: toast, coords: at(150) }
  ]);
}

/** A dismissible toast can be swiped away, down or to either side. */
export const SwipeDismisses = {
  tags: ['!dev', '!visual'],
  args: { autoDismiss: false, dismissible: true },
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    await settled();
    await swipe();
    await waitFor(() => expect(document.querySelector('[data-sonner-toast]:not([data-removed="true"])')).toBeNull(), {
      timeout: 3000
    });
  }
} satisfies Story;

/** One that isn't dismissible stays put. */
export const SwipeIgnoredUnlessDismissible = {
  tags: ['!dev', '!visual'],
  args: { autoDismiss: false },
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    await settled();
    await swipe();
    await settled();
    await expect(document.querySelector('[data-sonner-toast]:not([data-removed="true"])')).not.toBeNull();
  }
} satisfies Story;
