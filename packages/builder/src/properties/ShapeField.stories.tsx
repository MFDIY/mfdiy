import type { Meta, StoryObj } from '@storybook/react-vite';

import { DEFAULT_SHAPE } from '@mfdiy/schema';
import { useState, type ComponentProps } from 'react';
import { expect, within } from 'storybook/test';

import { ShapeField } from './ShapeField.js';

/** ShapeField is controlled; in a story, something has to hold the shape, like a page would. */
function EditableShapeField({ value: initialValue, onChange, ...restProps }: ComponentProps<typeof ShapeField>) {
  const [value, setValue] = useState(initialValue);

  return (
    <ShapeField
      {...restProps}
      onChange={next => {
        setValue(next);
        onChange(next);
      }}
      value={value}
    />
  );
}

const meta = {
  title: 'Builder/ShapeField',
  component: ShapeField,
  args: { focus: false, onChange: () => undefined, value: DEFAULT_SHAPE },
  render: args => <EditableShapeField key={JSON.stringify(args.value)} {...args} />
} satisfies Meta<typeof ShapeField>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A new profile's shape: 16:10, close to most tablets (0006). */
export const Default: Story = {};

/** A shape typed in pixels is kept as typed; only its ratio counts. */
export const InPixels: Story = { args: { value: { width: 1920, height: 1080 } } };

/** Something that isn't a ratio yet says how to write one, and the last good shape stays. */
export const Unreadable: Story = {
  tags: ['!dev'],
  play: async ({ canvasElement, userEvent }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Shape' });

    await userEvent.clear(field);
    await userEvent.type(field, '16 by 10');
    await expect(within(canvasElement).getByText('Write it as width:height, like 16:10.')).toBeVisible();
  }
};

/** Picking a common screen fills it in. */
export const PickingAPreset: Story = {
  tags: ['!dev'],
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Phone' }));
    await expect(within(canvasElement).getByRole('textbox', { name: 'Shape' })).toHaveValue('9:19.5');
  }
};
