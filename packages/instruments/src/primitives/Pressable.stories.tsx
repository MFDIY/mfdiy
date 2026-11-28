import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { expect, fn, within } from 'storybook/test';

import { Bar } from './Bar.js';
import { Comparison } from './Comparison.js';
import { Label } from './Label.js';
import { Light } from './Light.js';
import { Pressable, cues, pressStatuses, type PressableProps } from './Pressable.js';
import { Readout } from './Readout.js';
import { mfdFrame } from './mfdFrame.js';

const meta = {
  title: 'Primitives / Pressable',
  component: Pressable,
  decorators: [mfdFrame],
  argTypes: {
    children: { control: false },
    cue: { control: 'select', options: cues },
    current: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    onPress: { control: false },
    status: { control: 'select', options: pressStatuses }
  },
  args: {
    children: <Label text='Lights' />,
    cue: undefined,
    current: false,
    disabled: false,
    onPress: fn(),
    status: undefined
  }
} satisfies Meta<typeof Pressable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A label with an action: a button (0018). */
export const Default = {} satisfies Story;

/** A light with an action: a lit push-button, like in a cockpit. */
export const LitButton = {
  args: { children: <Light label='Gear' state='on' /> }
} satisfies Story;

export const PageShown = { args: { children: <Label text='Flight' />, current: true } } satisfies Story;

const speed = { digits: '212', sign: '', value: 212, zeros: '0' };

const widgets: { name: string; content: ReactNode; current?: boolean }[] = [
  { name: 'Label', content: <Label text='Lights' /> },
  { name: 'Label, page shown', content: <Label text='Flight' />, current: true },
  { name: 'Light, off', content: <Light label='Decpl' state='off' /> },
  { name: 'Light, on', content: <Light label='Gear' state='on' /> },
  { name: 'Light, critical', content: <Light label='Hull' state='critical' /> },
  { name: 'Readout', content: <Readout label='SCM speed' unit='m/s' value={speed} /> },
  { name: 'Bar', content: <Bar displayValue='62%' label='Shield front' state='normal' value={0.62} /> }
];

function press(cue: PressableProps['cue'], content: ReactNode, props: Partial<PressableProps> = {}) {
  return (
    <Pressable cue={cue} onPress={() => undefined} {...props}>
      {content}
    </Pressable>
  );
}

/**
 * Temporary: how a widget shows it can be pressed, one look per row, above the same widgets
 * without an action. On a touch screen nothing can be found by pointing at it (0018).
 */
export const CompareCues: Story = {
  tags: ['!autodocs'],
  parameters: { mfdFrame: false },
  render: (_args, context) => (
    <Comparison
      cell={{ height: 88, width: 136 }}
      columns={widgets.map(widget => widget.name)}
      rows={[
        {
          name: 'No action',
          cells: widgets.map(widget => (widget.current ? null : widget.content))
        },
        ...cues.map(cue => ({
          name: cue,
          cells: widgets.map(widget => press(cue, widget.content, { current: widget.current }))
        }))
      ]}
      themeName={String(context.globals['theme'] ?? '')}
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('button', { name: 'Flight' })[0]).toHaveAttribute(
      'aria-current',
      'page'
    );
  }
};

const states: { name: string; props: Partial<PressableProps> }[] = [
  { name: 'Idle', props: {} },
  { name: 'Page shown', props: { current: true } },
  { name: 'Waiting for the game', props: { status: 'pending' } },
  { name: 'Accepted', props: { status: 'ok' } },
  { name: 'Refused', props: { status: 'failed' } },
  { name: 'Unavailable', props: { disabled: true } }
];

/**
 * Temporary: what a press looks like while the game answers, for each look. Waiting shows a light
 * running around the edge, after a moment so quick answers don't flash; with reduced motion, as
 * in these screenshots, it's a still ring.
 */
export const CompareStates: Story = {
  tags: ['!autodocs'],
  parameters: { mfdFrame: false },
  render: (_args, context) => (
    <Comparison
      columns={states.map(state => state.name)}
      rows={cues.map(cue => ({
        name: cue,
        cells: states.map(state => press(cue, <Label text='Gear' />, state.props))
      }))}
      themeName={String(context.globals['theme'] ?? '')}
    />
  )
};
