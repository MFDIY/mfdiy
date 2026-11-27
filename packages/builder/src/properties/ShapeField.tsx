import type { Shape } from '@mfdiy/schema';

import { formatShape, parseShape } from '@mfdiy/schema';
import { Box, Button, Inline, Stack, TextField } from '@mfdiy/ui/components';
import { useState } from 'react';

/** Common screens, to pick without typing. */
export const shapePresets = [
  { label: '16:10', shape: { width: 16, height: 10 } },
  { label: '4:3', shape: { width: 4, height: 3 } },
  { label: '16:9', shape: { width: 16, height: 9 } },
  { label: 'Phone', shape: { width: 9, height: 19.5 } }
] as const satisfies readonly { label: string; shape: Shape }[];

export type ShapeFieldProps = {
  /** Focuses the field when shown, e.g. in a dialog asking only for this. */
  focus?: boolean | undefined;
  /** Fires with each shape that can be read, as it's typed or picked. */
  onChange: (shape: Shape) => void;
  value: Shape;
};

/**
 * A profile's shape (0006): typed as a ratio (16:10, 1920 × 1080), picked from common screens, or
 * taken from the screen it's on, such as the tablet that will show it.
 */
export function ShapeField({ focus = false, onChange, value }: ShapeFieldProps) {
  /** The text as typed, while it's being typed; it may not be a shape yet. */
  const [draft, setDraft] = useState<string | null>(null);
  const unreadable = draft !== null && parseShape(draft) === null;

  function pick(shape: Shape) {
    setDraft(null);
    onChange(shape);
  }

  return (
    <Stack spacing='3x'>
      <Box onBlur={() => setDraft(null)}>
        <TextField
          description='Width to height, like 16:10 or 1920 × 1080. Only the ratio counts.'
          error={unreadable ? 'Write it as width:height, like 16:10.' : undefined}
          focus={focus}
          label='Shape'
          onChange={text => {
            const shape = parseShape(text);

            setDraft(text);

            if (shape) {
              onChange(shape);
            }
          }}
          value={draft ?? formatShape(value)}
        />
      </Box>
      <Inline spacing='2x'>
        {shapePresets.map(preset => (
          <Button key={preset.label} onClick={() => pick(preset.shape)}>
            {preset.label}
          </Button>
        ))}
        <Button icon='fit_screen' onClick={() => pick({ width: window.screen.width, height: window.screen.height })}>
          Use this screen
        </Button>
      </Inline>
    </Stack>
  );
}
