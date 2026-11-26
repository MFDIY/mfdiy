import { createContext } from 'react';

/**
 * How dialogs open. `modal` is the real thing: on top of the page, which goes inert behind it.
 * `inline` draws the dialog in place, for showing several on one page, such as Storybook's
 * documentation pages, where a modal would block the page and its controls.
 */
export const DialogPresentationContext = createContext<'inline' | 'modal'>('modal');
