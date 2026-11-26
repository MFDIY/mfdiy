import type { Command } from './Command.js';

import {
  FloatingFocusManager,
  FloatingList,
  FloatingOverlay,
  FloatingPortal,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
  useTransitionStatus
} from '@floating-ui/react';
import { clsx } from 'clsx';
import { useId, useRef, type FocusEvent, type KeyboardEvent } from 'react';

import { designSystem } from '../../styles/design-system.js';
import { Box } from '../Box/Box.js';
import { Button } from '../Button/Button.js';
import { ScrollContainer } from '../ScrollContainer/ScrollContainer.js';
import { Text } from '../Text/Text.js';
import { TextInput } from '../TextInput/TextInput.js';

import * as styles from './CommandPalette.css.js';
import { CommandPaletteOption } from './CommandPaletteOption.js';
import { TRANSITION_DURATION } from './config.js';

export type CommandPaletteProps = {
  /** The highlighted command. */
  activeIndex: number | null;
  commands: readonly Command[];
  /** Shown when there are no commands. */
  emptyText: string;
  /** Focuses the search field. Leave off when opened by touch, where it brings up a keyboard. */
  focusSearch: boolean;
  isOpen: boolean;
  /** Names the palette for assistive technology. */
  label: string;
  /** Fires when a command is highlighted by keyboard or mouse, and when a search starts or ends. */
  onActiveIndexChange: (index: number | null) => void;
  /** Shows a button to go back, also done by Backspace in an empty search field. */
  onBack?: (() => void) | undefined;
  onClose: () => void;
  /** Update `commands` and `query` in response. */
  onQueryChange: (query: string) => void;
  placeholder: string;
  query: string;
};

/**
 * A modal search interface, centred on the screen. Forked from Bonsai, where it's app-wide and opened
 * by a shortcut; here the parent opens it. Type to search, use arrow keys to navigate, Enter to
 * select, Escape or a press outside to close.
 */
export function CommandPalette({
  activeIndex,
  commands,
  emptyText,
  focusSearch,
  isOpen,
  label,
  onActiveIndexChange,
  onBack,
  onClose,
  onQueryChange,
  placeholder,
  query
}: CommandPaletteProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const elementsRef = useRef<(HTMLElement | null)[]>([]);

  const { context, refs } = useFloating({
    open: isOpen,
    onOpenChange: open => {
      if (!open) handleClose();
    }
  });

  const dismissProps = useDismiss(context);
  const roleProps = useRole(context, { role: 'dialog' });
  const listNavProps = useListNavigation(context, {
    activeIndex,
    listRef: elementsRef,
    loop: true,
    onNavigate: onActiveIndexChange,
    virtual: true
  });

  const { getFloatingProps, getItemProps } = useInteractions([dismissProps, listNavProps, roleProps]);

  const { isMounted, status } = useTransitionStatus(context, { duration: TRANSITION_DURATION });

  function handleClose() {
    onActiveIndexChange(null);
    onClose();
  }

  function handleBack() {
    onActiveIndexChange(null);
    onBack?.();
  }

  function handleQueryChange(next: string) {
    onActiveIndexChange(next.length > 0 ? 0 : null);
    onQueryChange(next);
  }

  function handleSelect(command: Command) {
    onActiveIndexChange(null);
    command.onSelect();

    if (!command.staysOpen) {
      onClose();
    }
  }

  /** Keeps the search field ready while rows are pressed. */
  function handleBlur(event: FocusEvent) {
    if (focusSearch && isOpen && !(event.relatedTarget instanceof HTMLButtonElement)) {
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    // Buttons handle their own.
    if (event.target instanceof HTMLButtonElement) {
      return;
    }

    const active = activeIndex === null ? undefined : commands[activeIndex];

    if (event.key === 'Enter' && active && !event.nativeEvent.isComposing) {
      event.preventDefault();
      handleSelect(active);
    } else if (event.key === 'Backspace' && query === '' && onBack) {
      event.preventDefault();
      handleBack();
    }
  }

  if (!isMounted) return null;

  const overlayClassNames = clsx(
    styles.transitionDuration,
    designSystem({
      alignItems: 'center',
      backdropFilter: status === 'open' ? 'blur' : 'none',
      backgroundColor: status === 'open' ? 'backdrop' : 'transparent',
      containerType: 'size',
      display: 'flex',
      justifyContent: 'center',
      overflow: 'hidden',
      // Presses during the closing animation are meant for what's underneath.
      pointerEvents: isOpen ? 'auto' : 'none',
      transitionProperty: 'overlay',
      transitionTimingFunction: 'ease-out',
      // Above everything on the canvas.
      zIndex: '3'
    })
  );

  const optionId = (index: number) => `${id}-${index}`;

  return (
    <FloatingPortal>
      <FloatingOverlay className={overlayClassNames}>
        {/* 0 is the first element that can be focused: the search field. */}
        <FloatingFocusManager context={context} initialFocus={focusSearch ? 0 : -1}>
          <Box
            {...getFloatingProps({ onKeyDown: handleKeyDown })}
            aria-label={label}
            backgroundColor='surface'
            borderColor='line.strong'
            borderStyle='solid'
            className={clsx(styles.container, styles.transitionDuration)}
            color='text'
            display='flex'
            flexDirection='column'
            height='full'
            opacity={status === 'open' ? '1' : '0'}
            outlineStyle='none'
            overflow='hidden'
            // eslint-disable-next-line react-hooks/refs -- floating-ui accesses setFloating in effects, not during render
            ref={refs.setFloating}
            tagName='div'
            transform={status === 'open' ? undefined : 'popover'}
            transitionProperty='opacity-and-transform'
            transitionTimingFunction='ease-out'
            width='full'
          >
            <Box alignItems='stretch' columnGap='1x' display='flex' flexDirection='row' flexWrap='nowrap' padding='3x'>
              {onBack ? (
                <Button aria-label='Back' onClick={handleBack} size='large' variant='quiet'>
                  ‹
                </Button>
              ) : null}
              <Box flexGrow='1' minWidth='none'>
                <TextInput
                  aria-activedescendant={activeIndex === null ? undefined : optionId(activeIndex)}
                  aria-autocomplete='list'
                  aria-controls={`${id}-list`}
                  aria-expanded
                  aria-label={label}
                  hideFocusRing
                  onBlur={handleBlur}
                  onChange={event => handleQueryChange(event.target.value)}
                  onClear={() => handleQueryChange('')}
                  placeholder={placeholder}
                  ref={inputRef}
                  role='combobox'
                  value={query}
                />
              </Box>
              <Box className={styles.closeButton} flexShrink='0'>
                <Button aria-label='Close' onClick={handleClose} size='large' variant='quiet'>
                  ✕
                </Button>
              </Box>
            </Box>
            <ScrollContainer>
              {commands.length === 0 ? (
                <Box padding='4x'>
                  <Text variant='body'>{emptyText}</Text>
                </Box>
              ) : null}
              <Box aria-label={label} id={`${id}-list`} role='listbox'>
                <FloatingList elementsRef={elementsRef}>
                  {commands.map((command, index) => (
                    <CommandPaletteOption
                      command={command}
                      getItemProps={getItemProps}
                      id={optionId(index)}
                      isActive={activeIndex === index}
                      itemRef={node => {
                        elementsRef.current[index] = node;
                      }}
                      key={command.id}
                      onSelect={() => handleSelect(command)}
                    />
                  ))}
                </FloatingList>
              </Box>
            </ScrollContainer>
          </Box>
        </FloatingFocusManager>
      </FloatingOverlay>
    </FloatingPortal>
  );
}
