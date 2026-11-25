import { useEffect, useRef, type CSSProperties, type PropsWithChildren } from 'react';

import { Box } from '../Box/Box.js';

type ModalProps = PropsWithChildren<{
  className: string;
  /** Fires when the user dismisses it: Escape, or a press outside it. */
  onClose: () => void;
  style?: CSSProperties | undefined;
  titleId: string;
}>;

/** The native modal element behind dialogs and popovers, open for as long as it's rendered. */
export function Modal({ children, className, onClose, style, titleId }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  // Only `showModal` makes a dialog modal; there is no attribute for it.
  useEffect(() => {
    if (ref.current && !ref.current.open) {
      ref.current.showModal();
    }
  }, []);

  return (
    <Box
      aria-labelledby={titleId}
      backgroundColor='elevation.floating'
      borderRadius='2x'
      borderStyle='hidden'
      boxShadow='elevation.floating'
      className={className}
      color='body'
      onClose={onClose}
      // The contents cover the modal, so a press on the modal itself is on its backdrop.
      onPointerDown={event => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      overflowX='hidden'
      overflowY='auto'
      overscrollBehavior='none'
      padding='none'
      ref={ref}
      style={style}
      tagName='dialog'
    >
      {children}
    </Box>
  );
}
