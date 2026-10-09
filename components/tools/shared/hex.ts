/** Byte <-> hex conversions shared by the codec tools. */

/** Joins bytes as hex pairs, optionally separated and upper-cased. */
export const toHex = (bytes: ArrayLike<number>, sep = '', upper = false): string => {
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(sep);
  return upper ? hex.toUpperCase() : hex;
};

/**
 * Parses hex text into bytes, tolerating spaces, commas and `0x` prefixes.
 * Returns null when the input is not even-length hex.
 */
export const fromHex = (text: string): Uint8Array | null => {
  const clean = text.replace(/[\s,]/g, '').replace(/0x/gi, '');
  if (clean.length % 2 !== 0 || /[^0-9a-f]/i.test(clean)) return null;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
};

export const textToHex = (text: string, sep = '', upper = false): string =>
  toHex(new TextEncoder().encode(text), sep, upper);

/** Returns '' for unparseable hex, so callers can render their own message. */
export const hexToText = (hex: string): string => {
  const bytes = fromHex(hex);
  return bytes ? new TextDecoder().decode(bytes) : '';
};
