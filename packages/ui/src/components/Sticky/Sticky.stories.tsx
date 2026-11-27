import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, waitFor } from 'storybook/test';

import { Box } from '../Box/Box.js';
import { Placeholder } from '../Placeholder/Placeholder.js';
import { ScrollContainer } from '../ScrollContainer/ScrollContainer.js';
import { Stack } from '../Stack/Stack.js';
import { Text } from '../Text/Text.js';

import { Sticky, stickyEdges } from './Sticky.js';

const meta = {
  title: 'Components / Sticky',
  component: Sticky,
  argTypes: {
    children: { control: false },
    edge: { control: { type: 'select' }, options: stickyEdges }
  },
  args: {
    children: <Text variant='body'>Stays in view</Text>,
    edge: undefined
  },
  render: args => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '240px', width: '280px' }}>
      <ScrollContainer>
        <Box backgroundColor='surface'>
          {args.edge === 'bottom' ? null : <Sticky {...args} />}
          <Stack spacing='3x'>
            {Array.from({ length: 6 }, (_, index) => (
              <Placeholder height={60} key={index} />
            ))}
          </Stack>
          {args.edge === 'bottom' ? <Sticky {...args} /> : null}
        </Box>
      </ScrollContainer>
    </div>
  )
} satisfies Meta<typeof Sticky>;

export default meta;
type Story = StoryObj<typeof meta>;

/** At the top of a scroll area that hasn't scrolled: nothing is under it, so no hairline. */
export const Default = {} satisfies Story;

/** Scrolled: content runs under it, and a hairline under it says so, instead of the container's own. */
export const ContentUnderneath = {
  play: async ({ canvasElement }) => {
    const scroller = [...canvasElement.querySelectorAll<HTMLElement>('*')].find(
      element => getComputedStyle(element).overflowY === 'auto'
    );

    scroller?.scrollTo({ top: 120 });

    await waitFor(() =>
      expect(canvasElement.querySelector('[data-sticky] [data-scroll-edge="bottom"]')).toHaveStyle({ opacity: '1' })
    );
  }
} satisfies Story;

/** At the bottom, e.g. actions under a long list: the hairline is above it while there's more below. */
export const AtTheBottom = { args: { edge: 'bottom' } } satisfies Story;
