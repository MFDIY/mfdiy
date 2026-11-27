import type { FocusEvent, ReactNode } from 'react';

import { Box, Button, Field, Stack, Text } from '@mfdiy/ui/components';
import { useRef, useState } from 'react';

/** Merges what's typed into one undo step per visit to a field (0023). */
export type Merge = (field: string) => string;

/**
 * Typing in a field is one undo step, ended by leaving it. Wrap each field in `Typing`, and pass
 * `merge(field)` with its changes. `base` is what the page looked like when typing started, for
 * fields whose effect is computed from it, like a grid size, which must not be computed from each
 * keystroke on the way ("1" on the way to "12").
 */
export function useTyping<T>(scope: string, current: T) {
  const [visit, setVisit] = useState(0);
  const baseRef = useRef<T | null>(null);

  return {
    base: () => (baseRef.current ??= current),
    merge: ((field: string) => `${scope} ${field} ${visit}`) satisfies Merge,
    onBlur: (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        baseRef.current = null;
        setVisit(count => count + 1);
      }
    }
  };
}

type TypingProps = {
  children: ReactNode;
  onBlur: (event: FocusEvent<HTMLElement>) => void;
};

/** The bounds of one field's visit; see `useTyping`. */
export function Typing({ children, onBlur }: TypingProps) {
  return <Box onBlur={onBlur}>{children}</Box>;
}

type OpensRowProps = {
  description?: string | undefined;
  /** Shown in the row while nothing is chosen, e.g. "Not connected". */
  empty: string;
  label: string;
  onOpen: () => void;
  /** What's chosen, or undefined for nothing yet. */
  value: string | undefined;
};

/** A field whose choice is made in a side task that replaces the panel (0008, 0023). */
export function OpensRow({ description, empty, label, onOpen, value }: OpensRowProps) {
  return (
    <Field description={description} label={label}>
      <Button
        aria-label={`${label}: ${value ?? empty}`}
        icon='chevron_right'
        iconPosition='trailing'
        justifyContent='flex-start'
        onClick={onOpen}
        width='full'
      >
        {value ?? empty}
      </Button>
    </Field>
  );
}

/** A titled group of fields. */
export function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Stack spacing='4x'>
      <Text color='text' tagName='h3' variant='label'>
        {title}
      </Text>
      {children}
    </Stack>
  );
}
