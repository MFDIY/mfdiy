import { Box, type BoxProps } from '@mfdiy/ui/components';

type FrameProps<T extends 'button' | 'div'> = BoxProps<T> & { tagName?: T | undefined };

/**
 * The visible element of every primitive, inside a cell that fills its grid area. The cell is a size
 * container, so primitives scale with it rather than with the viewport (0001). Container query units
 * on an element resolve against its *ancestor* container, so anything sized in `cqmin` (padding,
 * borders) must live on the frame, never on the cell. A frame clips its content at its border, so
 * nothing sticks out of a widget.
 */
export function Frame<T extends 'button' | 'div' = 'div'>(props: FrameProps<T>) {
  return (
    <Box containerType='size' height='full' minHeight='none' minWidth='none' width='full'>
      <Box overflow='hidden' {...(props as BoxProps<T>)} height='full' position='relative' width='full' />
    </Box>
  );
}
