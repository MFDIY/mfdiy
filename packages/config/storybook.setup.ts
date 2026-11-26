import { afterEach, expect } from 'vitest';
import { page } from 'vitest/browser';

/**
 * Compares every story with its baseline screenshot after it has rendered and played (0021).
 * Stories, or whole files, opt out with the `!visual` tag; previews add `visual` to all.
 */
afterEach(async context => {
  const story = (context as { story?: { tags: readonly string[] } }).story;

  if (story?.tags.includes('visual') && context.task.result?.state !== 'fail') {
    // Bundled fonts swap in when loaded; a screenshot taken before that would show the fallback.
    await document.fonts.ready;
    await expect(page.elementLocator(document.body)).toMatchScreenshot();
  }
});
