/**
 * Perceived lightness (OKLCH `L`, 0–1) of a hex colour; alpha is ignored. Used to keep the steps of
 * a scale clearly distinct (0022), and later by the theme editor to warn about steps that are too
 * close or clip to white or black.
 */
export function oklchLightness(hex: string): number {
  const digits = hex.replace('#', '');
  const full = digits.length <= 4 ? [...digits.slice(0, 3)].map(digit => digit + digit).join('') : digits.slice(0, 6);
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map(index => {
    const channel = Number.parseInt(full.slice(index, index + 2), 16) / 255;

    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
}
