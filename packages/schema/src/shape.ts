import { MAX_GRID_SIZE, type Grid, type Shape } from './document.js';

/** Cells along a new page's longer side: about a fingertip each on a tablet (0006). */
const SEED_CELLS = 24;

/** A screen's shape as a single number, for layout. */
export function shapeRatio({ height, width }: Shape): number {
  return width / height;
}

/** As people write it: `16:10`, `1920:1080`. */
export function formatShape({ height, width }: Shape): string {
  return `${round(width)}:${round(height)}`;
}

/**
 * Reads a shape typed in any of the usual ways: `16:10`, `16/10`, `1920x1080`, `1920 × 1080`.
 * Returns null for anything else, or a shape of nothing.
 */
export function parseShape(text: string): Shape | null {
  const match = /^\s*(\d+(?:[.,]\d+)?)\s*[:/x×]\s*(\d+(?:[.,]\d+)?)\s*$/i.exec(text);

  if (!match?.[1] || !match[2]) {
    return null;
  }

  const width = Number(match[1].replace(',', '.'));
  const height = Number(match[2].replace(',', '.'));

  return width > 0 && height > 0 && width <= 100_000 && height <= 100_000 ? { height, width } : null;
}

/**
 * A grid whose cells are as close to square as whole cells allow in this shape: 24 along the longer
 * side. New pages start with it; a page may change its grid after that (0006).
 */
export function seedGrid(shape: Shape): Grid {
  const ratio = shapeRatio(shape);
  const short = Math.min(Math.max(Math.round(SEED_CELLS / Math.max(ratio, 1 / ratio)), 1), MAX_GRID_SIZE);

  return ratio >= 1 ? { columns: SEED_CELLS, rows: short } : { columns: short, rows: SEED_CELLS };
}

function round(value: number): string {
  return String(Math.round(value * 100) / 100);
}
