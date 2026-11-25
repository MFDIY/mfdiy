import type { DocumentOutcome } from './DocumentStore.js';

import { MAX_DOCUMENT_NAME_LENGTH } from '@mfdiy/schema';

export type FailedOutcome = Exclude<DocumentOutcome, { status: 'ok' }>;

export const failureText: Record<FailedOutcome['status'], string> = {
  disconnected: 'No connection to the bridge. Try again once it’s back.',
  failed: 'The bridge couldn’t write the file. Check the disk of the PC it runs on.',
  full: 'The library is full. Delete a profile first.',
  invalid: 'The bridge didn’t accept this. Reload the page and try again.',
  'not-found': 'This profile has been deleted on another device.',
  stale: 'This profile was changed on another device. Check it and try again.',
  timeout: 'The bridge didn’t answer. Try again.'
};

const SUFFIX = ' copy';

export function copyName(name: string): string {
  return `${name.slice(0, MAX_DOCUMENT_NAME_LENGTH - SUFFIX.length)}${SUFFIX}`;
}
