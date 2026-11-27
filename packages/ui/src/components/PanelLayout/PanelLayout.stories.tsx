import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState, type ComponentProps, type ReactNode } from 'react';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { Button } from '../Button/Button.js';
import { Inline } from '../Inline/Inline.js';
import { Placeholder } from '../Placeholder/Placeholder.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';

import { PanelLayout, usePanelForm, type PanelSide } from './PanelLayout.js';

/** Says which form the panels are in, from inside the layout. */
function FormName() {
  return (
    <Text color='text.dim' variant='label'>
      {usePanelForm()}
    </Text>
  );
}

/** The page decides which sheet is open; buttons in the main content open them, as tapping a cell would. */
function Demo({ end, start }: Pick<ComponentProps<typeof PanelLayout>, 'end' | 'start'>) {
  const [openSheet, setOpenSheet] = useState<PanelSide | null>(null);

  return (
    <PanelLayout end={end} onSheetClose={() => setOpenSheet(null)} openSheet={openSheet} start={start}>
      <Stack spacing='3x'>
        <FormName />
        <Inline spacing='3x'>
          <Button onClick={() => setOpenSheet('start')}>Open library</Button>
          <Button onClick={() => setOpenSheet('end')}>Open properties</Button>
        </Inline>
        <Placeholder height='320px' />
      </Stack>
    </PanelLayout>
  );
}

function Container({ children, width }: { children: ReactNode; width: string }) {
  return (
    <div
      data-resizable
      style={{
        height: '480px',
        maxWidth: '100vw',
        minWidth: '320px',
        outline: '1px dashed #9996',
        overflow: 'hidden',
        resize: 'horizontal',
        width
      }}
    >
      {children}
    </div>
  );
}

const meta = {
  title: 'Components / PanelLayout',
  component: PanelLayout,
  argTypes: {
    children: { control: false },
    end: { control: false },
    onSheetClose: { control: false },
    openSheet: { control: false },
    start: { control: false }
  },
  args: {
    children: undefined,
    end: {
      content: <Placeholder />,
      title: 'Properties'
    },
    onSheetClose: () => undefined,
    openSheet: null,
    start: {
      content: <Placeholder />,
      title: 'Add a widget'
    }
  },
  render: args => <Demo end={args.end} start={args.start} />,
  decorators: [
    Story => (
      <Container width='1160px'>
        <Story />
      </Container>
    )
  ]
} satisfies Meta<typeof PanelLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** With a mouse and room for them, both panels dock as sidebars. Drag the corner to narrow it. */
export const Default = {} satisfies Story;

/** Without room, both become sheets; the buttons open them, one at a time. */
export const Sheets = {
  decorators: [
    Story => (
      <Container width='480px'>
        <Story />
      </Container>
    )
  ]
} satisfies Story;

export const SidebarsWhenThereIsRoom = {
  tags: ['!dev', '!visual'],
  play: async () => {
    await expect(screen.getAllByRole('complementary')).toHaveLength(2);
    await expect(screen.getByText('sidebars')).toBeInTheDocument();
  }
} satisfies Story;

/** As sheets, opening one panel's sheet closes the other's. */
export const OneSheetAtATime = {
  ...Sheets,
  tags: ['!dev', '!visual'],
  play: async () => {
    await expect(screen.getByText('sheets')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Open library' }));
    await expect(await screen.findByRole('dialog', { name: 'Add a widget' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Open properties' }));
    await expect(await screen.findByRole('dialog', { name: 'Properties' })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Add a widget' })).not.toBeInTheDocument());
  }
} satisfies Story;
