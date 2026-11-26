import type { Meta, StoryObj } from '@storybook/react-vite';

import { createArgTypeFromConditionalStyleProp } from '../../../.storybook/createArgTypeFromConditionalStyleProp.js';
import { stylePropArgTypes } from '../../../.storybook/stylePropArgTypes.js';

import { Text, supportedStyleProps, tagNames, variants } from './Text.js';

const textStylePropArgTypes = {
  ...Object.fromEntries(
    Object.entries(stylePropArgTypes).filter(([property]) =>
      supportedStyleProps.includes(property as (typeof supportedStyleProps)[number])
    )
  ),

  /* Map our "renamed" style props. */
  align: stylePropArgTypes['textAlign']
};

const meta = {
  title: 'Components / Text',
  component: Text,
  argTypes: {
    children: {
      description: 'The rendered text.',
      control: {
        type: 'text'
      },
      table: {
        type: {
          summary: 'ReactNode'
        }
      }
    },
    tagName: {
      description: 'The semantic HTML element used to represent this `Text` component.',
      control: {
        type: 'select'
      },
      options: [undefined, ...tagNames],
      table: {
        defaultValue: { summary: "'span'" },
        type: {
          summary: tagNames.map(tagName => `'${tagName}'`).join(' | ')
        }
      }
    },
    truncate: {
      description: 'Truncates overflowing text with an ellipsis.',
      control: {
        type: 'boolean'
      },
      table: {
        type: {
          summary: 'boolean'
        }
      }
    },
    variant: createArgTypeFromConditionalStyleProp(variants, undefined),
    ...textStylePropArgTypes
  },
  args: {
    children: 'Lorem ipsum dolor sit amet.',
    truncate: false,
    whiteSpace: undefined
  }
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

/**
 * When nesting `<strong>` elements inside the `Text` component (or when passing an
 * `tagName="strong"` prop), they will be given the `'font-weight-bulky'` design token's font
 * weight.
 */
export const NestedStrongElement = {
  args: {
    children: (
      <span>
        I&apos;m plain text with a <strong>nested &lt;strong&gt; element</strong> inside a Text component.
      </span>
    ),
    truncate: false
  }
} satisfies Story;

/**
 * The `truncate` prop lets you prevent text from overflowing without clipping. Make sure the `Text`
 * component is wrapped in something that constrains its width, and pass the `truncate` prop to
 * truncate the contents with an ellipsis.
 */
export const Truncated = {
  decorators: [
    Story => (
      <div style={{ width: '200px', border: '2px dashed tomato' }}>
        <Story />
      </div>
    )
  ],
  args: {
    children: 'ReallyLudicrouslyLongStringOfText',
    truncate: true
  }
} satisfies Story;

/**
 * The `whiteSpace` prop lets you prevent text from wrapping to multiple lines, useful when using
 * multiple `Text` components for a single string. Make sure the `Text` component is wrapped in
 * something that constrains its width, and pass the `whiteSpace` prop to keep the contents to a
 * single line.
 */
export const WhiteSpace: Story = {
  render: args => (
    <div style={{ width: '500px', display: 'flex', gap: '4px', border: '2px dashed tomato' }}>
      <Text {...args}>We want all of this to be on a single line, with </Text>
      <Text
        // color='primary-accent'
        {...args}
      >
        the highlight
      </Text>
      <Text {...args}>and then more text </Text>
    </div>
  ),
  args: {
    whiteSpace: 'nowrap'
  }
};

export const InlinedVariants = {
  render: () => (
    <Text>
      Lorem ipsum dolor sit amet, <b>consectetur adipiscing</b> elit. Nam tempor ipsum ac{' '}
      <strong>pharetra semper</strong>. Cras aliquet <i>pharetra</i> diam nec <em>euismod</em>. Maecenas iaculis orci et
      velit ullamcorper pretium. Quisque sed sapien et erat pharetra aliquam ac eget tellus. Nunc lacus elit, porta eu
      nisi eget, varius tincidunt urna. {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a href='#'>Nam ac dapibus dolor.</a> Cras quis condimentum ligula. Ut ut mattis justo. Fusce eu dictum lacus, et
      fringilla enim. Proin non vehicula augue.
    </Text>
  )
} satisfies Story;

export const TextScale = {
  render: ({ children: _children, ...restProps }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {variants.map(variant => (
        <Text {...restProps} key={variant} variant={variant}>
          {variant}
        </Text>
      ))}
    </div>
  )
} satisfies Story;

export const Label = { args: { variant: 'label' } } satisfies Story;

export const Body = { args: { variant: 'body' } } satisfies Story;

export const Value = { args: { children: '212 m/s', variant: 'value' } } satisfies Story;

export const Heading = { args: { variant: 'heading' } } satisfies Story;
