import { Box, Text } from '@mfdiy/ui/components';

type DragLabelProps = {
  label: string;
  /** Where the pointer is, in pixels from the top left of the window. */
  x: number;
  y: number;
};

/** What's being dragged from the library, following the pointer. */
export function DragLabel({ label, x, y }: DragLabelProps) {
  return (
    <Box
      backgroundColor='surface.raised'
      borderColor='line.strong'
      borderStyle='solid'
      borderWidth='hairline'
      paddingBlock='2x'
      paddingInline='3x'
      pointerEvents='none'
      position='fixed'
      // The pointer's position changes all the time: it can't be a style prop.
      style={{ left: x + 12, top: y + 12 }}
      zIndex='3'
    >
      <Text variant='body'>{label}</Text>
    </Box>
  );
}
