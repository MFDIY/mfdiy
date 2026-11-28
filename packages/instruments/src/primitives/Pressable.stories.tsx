import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { useState } from 'react';
import { fn } from 'storybook/test';

import { Bar } from './Bar.js';
import { Comparison } from './Comparison.js';
import { CornerBox } from './CornerBox.js';
import { Label } from './Label.js';
import { Light } from './Light.js';
import { Pressable, pressStatuses, type PressableProps } from './Pressable.js';
import { Readout } from './Readout.js';
import { mfdFrame } from './mfdFrame.js';

const meta = {
  title: 'Primitives / Pressable',
  component: Pressable,
  decorators: [mfdFrame],
  argTypes: {
    children: { control: false },
    current: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    onPress: { control: false },
    status: { control: 'select', options: pressStatuses }
  },
  args: {
    children: <Label text='Lights' />,
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

const speed = { digits: '212', sign: '', value: 212, zeros: '0' };

/**
 * Every widget keeps a corner box, so one with an action lines up with one without (0018): the
 * first row has no actions.
 */
export const AllWidgets: Story = {
  tags: ['!autodocs'],
  parameters: { mfdFrame: false },
  render: (_args, context) => {
    const widgets = [
      <Label key='label' text='Lights' />,
      <Light key='off' label='Decpl' state='off' />,
      <Light key='on' label='Gear' state='on' />,
      <Light key='critical' label='Hull' state='critical' />,
      <Readout key='readout' label='SCM speed' unit='m/s' value={speed} />,
      <Bar displayValue='62%' key='bar' label='Shield front' state='normal' value={0.62} />
    ];

    return (
      <Comparison
        cell={{ height: 88, width: 136 }}
        columns={['Label', 'Light, off', 'Light, on', 'Light, critical', 'Readout', 'Bar']}
        rows={[
          { name: 'No action', cells: widgets.map(widget => <CornerBox key={widget.key}>{widget}</CornerBox>) },
          {
            name: 'With an action',
            cells: widgets.map(widget => (
              <Pressable key={widget.key} onPress={() => undefined}>
                {widget}
              </Pressable>
            ))
          }
        ]}
        themeName={String(context.globals['theme'] ?? '')}
      />
    );
  }
};

const states: { name: string; props: Partial<PressableProps> }[] = [
  { name: 'Idle', props: {} },
  { name: 'Waiting for the game', props: { status: 'pending' } },
  { name: 'Unavailable', props: { disabled: true } }
];

/**
 * The states that last: idle, waiting for the game (a light running around the corner box, shown
 * after a moment so quick answers don't flash; a still rim with reduced motion, as in these
 * screenshots), and an action that can't be used, whose corners dim. Accepted and refused only
 * pulse briefly: see Pressing.
 */
export const States: Story = {
  tags: ['!autodocs'],
  parameters: { mfdFrame: false },
  render: (_args, context) => (
    <Comparison
      columns={states.map(state => state.name)}
      rows={[
        {
          name: 'Label',
          cells: states.map(state => (
            <Pressable key={state.name} onPress={() => undefined} {...state.props}>
              <Label text='Lights' />
            </Pressable>
          ))
        },
        {
          name: 'Light, on',
          cells: states.map(state => (
            <Pressable key={state.name} onPress={() => undefined} {...state.props}>
              <Light label='Gear' state='on' />
            </Pressable>
          ))
        }
      ]}
      themeName={String(context.globals['theme'] ?? '')}
    />
  )
};

type Answer = 'accept' | 'quick' | 'refuse' | 'unavailable';

const answers = ['accept', 'refuse', 'quick', 'unavailable'] as const satisfies readonly Answer[];

/** A widget whose presses a pretend game answers after a while, as `answer` says. */
function Answering({ answer, children }: { answer: Answer; children: ReactNode }) {
  const [status, setStatus] = useState<PressableProps['status']>('idle');

  function press() {
    setStatus('pending');
    setTimeout(
      () => {
        setStatus(answer === 'refuse' ? 'failed' : 'ok');
        setTimeout(() => setStatus('idle'), 1200);
      },
      answer === 'quick' ? 40 : 1600
    );
  }

  return (
    <Pressable disabled={answer === 'unavailable'} onPress={press} status={status}>
      {children}
    </Pressable>
  );
}

/**
 * Press them: a pretend game accepts or refuses after a while, or answers at once, which shows no
 * waiting. The last one's action can't be used, so it's refused without being sent. Motion only
 * shows with reduced motion turned off.
 */
export const Pressing: Story = {
  tags: ['!autodocs', '!visual'],
  parameters: { mfdFrame: false },
  render: (_args, context) => (
    <Comparison
      cell={{ height: 120, width: 200 }}
      columns={['Accepted', 'Refused', 'Answered at once', 'Unavailable']}
      rows={[
        {
          name: 'Label',
          cells: answers.map(answer => (
            <Answering answer={answer} key={answer}>
              <Label text='Lights' />
            </Answering>
          ))
        },
        {
          name: 'Light, on',
          cells: answers.map(answer => (
            <Answering answer={answer} key={answer}>
              <Light label='Gear' state='on' />
            </Answering>
          ))
        }
      ]}
      themeName={String(context.globals['theme'] ?? '')}
    />
  )
};
