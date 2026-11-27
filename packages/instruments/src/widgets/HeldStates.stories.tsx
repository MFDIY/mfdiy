import type { SignalState } from '@mfdiy/schema';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { useHeldStates } from './useHeldStates.js';

/** Shows the held state of one input, with buttons to move its live state. */
function Demo({ holdSeconds }: { holdSeconds: number }) {
  const [state, setState] = useState<SignalState>('normal');
  const held = useHeldStates({ value: state }, { value: holdSeconds });

  return (
    <div>
      <p>Live: {state}</p>
      <p>Shown: {held['value']}</p>
      {(['normal', 'warning', 'critical'] as const).map(next => (
        <button key={next} onClick={() => setState(next)} type='button'>
          {next}
        </button>
      ))}
    </div>
  );
}

const meta = {
  title: 'Widgets / Held states',
  tags: ['!autodocs', '!dev', '!visual'],
  args: { holdSeconds: 0.4 },
  render: args => <Demo {...args} />
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A state rises at once, and falls back only once the value has stayed back for the hold. */
export const RisesAtOnceFallsAfterTheHold: Story = {
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'critical' }));
    await expect(screen.getByText('Shown: critical')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'normal' }));
    await expect(screen.getByText('Shown: critical')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Shown: normal')).toBeInTheDocument(), { timeout: 2000 });
  }
};

/** A dip shorter than the hold doesn't clear it: the warning stays, without flickering. */
export const AShortDipDoesNotClear: Story = {
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'warning' }));
    await userEvent.click(screen.getByRole('button', { name: 'normal' }));
    await userEvent.click(screen.getByRole('button', { name: 'warning' }));
    await new Promise(resolve => setTimeout(resolve, 600));
    await expect(screen.getByText('Shown: warning')).toBeInTheDocument();
  }
};

/** Without a hold, the state follows the value straight away. */
export const NoHold: Story = {
  args: { holdSeconds: 0 },
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'warning' }));
    await userEvent.click(screen.getByRole('button', { name: 'normal' }));
    await expect(screen.getByText('Shown: normal')).toBeInTheDocument();
  }
};
