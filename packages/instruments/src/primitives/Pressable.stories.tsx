import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Box } from '@mfdiy/ui/components';
import { expect, fn, within } from 'storybook/test';

import { applyTokens } from '../theme/applyTokens.js';

import { Bar } from './Bar.js';
import { Comparison } from './Comparison.js';
import { CornerBox } from './CornerBox.js';
import { Label } from './Label.js';
import { Light } from './Light.js';
import { Pressable, cues, pressStatuses, type Cue, type PressableProps } from './Pressable.js';
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

const looks: { cue: Cue; gap: string; name: string; width: string }[] = [
  { cue: 'corners', gap: '0', name: 'corners, 1 px', width: '1px' },
  { cue: 'corners', gap: '0', name: 'corners, 2 px', width: '2px' },
  { cue: 'corners', gap: '0', name: 'corners, 3 px', width: '3px' },
  { cue: 'corners', gap: '3px', name: 'corners, 1 px, 3 px air', width: '1px' },
  { cue: 'corners', gap: '3px', name: 'corners, 2 px, 3 px air', width: '2px' },
  { cue: 'frame-inked', gap: '0', name: 'frame-inked, 2 px box', width: '2px' }
];

function press(look: (typeof looks)[number], content: ReactNode, props: Partial<PressableProps> = {}) {
  return (
    <Box cssVariables={applyTokens({ 'corner.gap': look.gap, 'corner.width': look.width })} height='full'>
      <Pressable cue={look.cue} onPress={() => undefined} {...props}>
        {content}
      </Pressable>
    </Box>
  );
}

function still(look: (typeof looks)[number], content: ReactNode) {
  return (
    <Box cssVariables={applyTokens({ 'corner.gap': look.gap, 'corner.width': look.width })} height='full'>
      <CornerBox>{content}</CornerBox>
    </Box>
  );
}

/**
 * Temporary: how a widget shows it can be pressed, one look per row. Every widget keeps a corner
 * box around it, pressable or not, so a light without an action (last but two) lines up with the
 * rest. On a touch screen nothing can be found by pointing at it (0018).
 */
export const CompareCues: Story = {
  tags: ['!autodocs'],
  parameters: { mfdFrame: false },
  render: (_args, context) => (
    <Comparison
      cell={{ height: 88, width: 120 }}
      columns={[...widgets.slice(0, 5).map(widget => widget.name), 'Light, no action', 'Readout', 'Bar']}
      rows={looks.map(look => ({
        name: look.name,
        cells: [
          ...widgets.slice(0, 5).map(widget => press(look, widget.content, { current: widget.current })),
          still(look, <Light label='ESP' state='on' />),
          ...widgets.slice(5).map(widget => press(look, widget.content))
        ]
      }))}
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
 * running around the corner box, after a moment so quick answers don't flash; with reduced motion,
 * as in these screenshots, it's a still ring.
 */
export const CompareStates: Story = {
  tags: ['!autodocs'],
  parameters: { mfdFrame: false },
  render: (_args, context) => (
    <Comparison
      columns={states.map(state => state.name)}
      rows={looks.map(look => ({
        name: look.name,
        cells: states.map(state => press(look, <Label text='Gear' />, state.props))
      }))}
      themeName={String(context.globals['theme'] ?? '')}
    />
  )
};
