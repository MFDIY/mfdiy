import type { Meta, StoryObj } from '@storybook/react-vite';

import { formatNumber } from '../widgets/format.js';

import { Readout, readoutStates } from './Readout.js';
import { mfdFrame } from './mfdFrame.js';

const meta = {
  title: 'Primitives / Readout',
  component: Readout,
  decorators: [mfdFrame],
  argTypes: {
    label: { control: { type: 'text' } },
    rolling: { control: { type: 'boolean' } },
    state: { control: 'select', options: readoutStates },
    unit: { control: { type: 'text' } },
    value: { control: false }
  },
  args: {
    label: 'Readout',
    rolling: false,
    state: undefined,
    unit: undefined,
    value: '—'
  }
} satisfies Meta<typeof Readout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A value as text, with no value yet. */
export const Default = {} satisfies Story;

/** Numbers are right-aligned, with their unit after them, so the last digit never moves (0022). */
export const WithUnit = {
  args: { label: 'SCM speed', unit: 'm/s', value: formatNumber(212, { locale: 'en' }) }
} satisfies Story;

/** Padded to four digits: the leading zeros are dimmer than the digits that count (0022). */
export const LeadingZeros = {
  args: { label: 'SCM speed', unit: 'm/s', value: formatNumber(212, { digits: 4, locale: 'en' }) }
} satisfies Story;

export const Negative = {
  args: { label: 'G-force', unit: 'G', value: formatNumber(-1.5, { decimals: 1, digits: 2, locale: 'en' }) }
} satisfies Story;

/** Text is left-aligned. */
export const Text = { args: { label: 'Master mode', value: 'SCM' } } satisfies Story;

export const Critical = {
  args: { label: 'Hull', state: 'critical', unit: '%', value: formatNumber(9, { digits: 3, locale: 'en' }) }
} satisfies Story;
