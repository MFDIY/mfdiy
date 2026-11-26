/**
 * Which tabs don't fit and go into the overflow menu, by index. Tabs are shown in order while they
 * fit; if they don't all fit, room is kept for the menu's button too. The active tab is always shown,
 * replacing tabs from the end when it wouldn't fit otherwise.
 */
export function hiddenTabs(widths: readonly number[], active: number, room: number, moreWidth: number): Set<number> {
  const total = widths.reduce((sum, width) => sum + width, 0);

  if (total <= room) {
    return new Set();
  }

  const space = room - moreWidth;
  const shown: number[] = [];
  let used = 0;

  for (const [index, width] of widths.entries()) {
    if (used + width > space) {
      break;
    }

    shown.push(index);
    used += width;
  }

  const activeWidth = widths[active];

  if (activeWidth !== undefined && !shown.includes(active)) {
    while (shown.length > 0 && used + activeWidth > space) {
      used -= widths[shown.pop() ?? 0] ?? 0;
    }

    shown.push(active);
  }

  return new Set([...widths.keys()].filter(index => !shown.includes(index)));
}
