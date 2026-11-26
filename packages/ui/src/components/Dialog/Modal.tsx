import { useContext, useEffect, useRef, type PropsWithChildren } from 'react';

import { Box } from '../Box/Box.js';

import { DialogPresentationContext } from './DialogPresentation.js';

type ModalProps = PropsWithChildren<{
  className: string;
  /** Lets Escape or a press outside close it. Otherwise only the modal's own actions can. */
  dismissible: boolean;
  /** Fires when the user dismisses it. */
  onClose: () => void;
  titleId: string;
}>;

/** Never a button, so Enter or Space right after opening can't trigger an action by accident. */
function focusStart(dialog: HTMLDialogElement) {
  const field = dialog.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea');

  (field ?? dialog).focus();
}

/** The native modal element behind dialogs, open for as long as it's rendered. */
export function Modal({ children, className, dismissible, onClose, titleId }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const inline = useContext(DialogPresentationContext) === 'inline';

  // Only `showModal` makes a dialog modal; there is no attribute for it.
  useEffect(() => {
    const dialog = ref.current;

    if (dialog && !dialog.open) {
      if (inline) {
        dialog.show();
      } else {
        dialog.showModal();
        focusStart(dialog);
      }
    }
  }, [inline]);

  return (
    <Box
      aria-labelledby={titleId}
      backgroundColor='surface'
      borderColor='line.strong'
      borderStyle='solid'
      borderWidth='hairline'
      className={className}
      color='text'
      onCancel={event => {
        // Escape. Always handled here, so the dialog only closes when its owner stops rendering it.
        event.preventDefault();

        if (dismissible) {
          onClose();
        }
      }}
      // The contents cover the modal, so a press on the modal itself is on its backdrop.
      onPointerDown={event => {
        if (dismissible && event.target === event.currentTarget) {
          onClose();
        }
      }}
      outlineStyle='none'
      overflow='hidden'
      overscrollBehavior='none'
      padding='none'
      position={inline ? 'static' : undefined}
      ref={ref}
      // A decision that must be made, rather than something to look at and close.
      role={dismissible ? 'dialog' : 'alertdialog'}
      tabIndex={-1}
      tagName='dialog'
    >
      {children}
    </Box>
  );
}
