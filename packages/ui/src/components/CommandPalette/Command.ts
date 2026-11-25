import type { ReactNode } from 'react';

export type Command = {
  description?: string | undefined;
  /** What kind of thing it is, shown beside the label. */
  entity?: string | undefined;
  id: string;
  label: string;
  /** Shown in front of the text. Decorative: it can't be pressed. */
  preview?: ReactNode;
  /** Keeps the palette open after selecting, e.g. to show another list. */
  staysOpen?: boolean | undefined;
  onSelect: () => void;
};
