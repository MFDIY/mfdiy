import type { MouseEvent, PointerEvent } from 'react';

/**
 * Event handlers that fire the instant an element is touched, not when it's released (0010). Each
 * pointer fires on its own, so several buttons can be pressed at once.
 */
export function pressHandlers(onPress: () => void, disabled = false) {
  return {
    onPointerDown(event: PointerEvent) {
      // Unlike `click`, `pointerdown` can still be delivered to a disabled button.
      if (event.button === 0 && !disabled) {
        onPress();
      }
    },
    /** Enter, Space and assistive technology click without a pointer, which have no click count. */
    onClick(event: MouseEvent) {
      if (event.detail === 0 && !disabled) {
        onPress();
      }
    }
  };
}
