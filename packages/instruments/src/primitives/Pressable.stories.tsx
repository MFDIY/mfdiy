import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { toCssVariableName, type TokenName } from '@mfdiy/schema';
import { Box } from '@mfdiy/ui/components';
import { expect, fn, within } from 'storybook/test';

import { applyTokens } from '../theme/applyTokens.js';
import { token } from '../theme/token.js';

import { Bar } from './Bar.js';
import { Comparison } from './Comparison.js';
import { CornerBox } from './CornerBox.js';
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

const anchors = ['line', 'text.dim', 'text', 'accent', 'secondary.8'] as const satisfies readonly TokenName[];

const looks: { color: TokenName; gap: string; name: string; width: string }[] = anchors.flatMap(color => [
  { color, gap: '3px', name: `${color}, 1 px`, width: '1px' },
  { color, gap: '3px', name: `${color}, 2 px`, width: '2px' }
]);

/** The look's thickness and air, and its corners in another token's colour, as a theme falling back to it would. */
function lookVariables(look: (typeof looks)[number]) {
  return {
    ...applyTokens({ 'corner.gap': look.gap, 'corner.width': look.width }),
    [`--${toCssVariableName('press.cue')}`]: token(look.color)
  };
}

function press(look: (typeof looks)[number], content: ReactNode, props: Partial<PressableProps> = {}) {
  return (
    <Box cssVariables={lookVariables(look)} height='full'>
      <Pressable onPress={() => undefined} {...props}>
        {content}
      </Pressable>
    </Box>
  );
}

function still(look: (typeof looks)[number], content: ReactNode) {
  return (
    <Box cssVariables={lookVariables(look)} height='full'>
      <CornerBox>{content}</CornerBox>
    </Box>
  );
}

/**
 * Temporary: which colour the corners of a pressable widget fall back to, at 1 and 2 px with 3 px
 * of air, one per row. A theme can always set `press.cue` itself. Every widget keeps a corner box,
 * so a light without an action (last but two) lines up with the rest (0018).
 */
export const CompareCues: Story = {
  tags: ['!autodocs'],
  parameters: { mfdFrame: false },
  render: (_args, context) => (
    <Comparison
      cell={{ height: 68, width: 120 }}
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
      cell={{ height: 68, width: 150 }}
      columns={states.map(state => state.name)}
      rows={looks.map(look => ({
        name: look.name,
        cells: states.map(state => press(look, <Label text='Gear' />, state.props))
      }))}
      themeName={String(context.globals['theme'] ?? '')}
    />
  )
};
