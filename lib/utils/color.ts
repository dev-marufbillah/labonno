/**
 * Colour helpers for the theme.
 *
 * The brand accent is stored as a hex string in the admin (Appearance → accent
 * colour) because that is what `<input type="color">` speaks, but the Tailwind
 * token consumes an HSL triplet (`--accent: "36 27% 54%"`) so that opacity
 * modifiers such as `bg-gold/20` keep working.
 */

const FALLBACK = "36 27% 54%";

export function hexToHslTriplet(input?: string | null, fallback = FALLBACK): string {
  if (!input) return fallback;
  const hex = input.trim().replace(/^#/, "");

  const expanded =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return fallback;

  const r = parseInt(expanded.slice(0, 2), 16) / 255;
  const g = parseInt(expanded.slice(2, 4), 16) / 255;
  const b = parseInt(expanded.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;

  let hue = 0;
  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }

  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  return `${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}
