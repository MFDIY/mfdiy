import { create } from 'qrcode';

import { Box } from '../Box/Box.js';

import * as styles from './QrCode.css.js';

/** The empty margin around the code that scanners need, in squares. */
const QUIET_ZONE = 4;

export type QrCodeProps = {
  /** Names the code for assistive technology, e.g. what scanning it opens. */
  label: string;
  /** What the code holds, usually an address. */
  value: string;
};

/**
 * A QR code (0004), as dark squares on light with its quiet zone, filling the width it's given.
 * Medium error correction, so a little glare on a monitor doesn't stop a phone reading it.
 */
export function QrCode({ label, value }: QrCodeProps) {
  const { modules } = create(value, { errorCorrectionLevel: 'M' });
  const size = modules.size + QUIET_ZONE * 2;
  let path = '';

  for (let row = 0; row < modules.size; row++) {
    for (let column = 0; column < modules.size; column++) {
      if (modules.get(row, column)) {
        path += `M${column + QUIET_ZONE} ${row + QUIET_ZONE}h1v1h-1z`;
      }
    }
  }

  return (
    <Box aria-label={label} className={styles.root} role='img' tagName='svg' viewBox={`0 0 ${size} ${size}`}>
      <Box d={path} fill='currentColor' tagName='path' />
    </Box>
  );
}
