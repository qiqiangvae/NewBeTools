/**
 * The repo's first unit test: the pure byte<->hex helpers, which shipped with no
 * coverage at all. Run with `bun test`, or as part of `bun run verify`.
 */
import { describe, expect, test } from 'bun:test';
import { fromHex, hexToText, textToHex, toHex } from './hex';

describe('toHex', () => {
  test('pads every byte to two digits and keeps the order', () => {
    expect(toHex(new Uint8Array([0, 15, 255]))).toBe('000fff');
  });

  test('applies the separator and upper case only when asked', () => {
    expect(toHex([0, 255], '-', true)).toBe('00-FF');
    expect(toHex([171])).toBe('ab');
  });
});

describe('fromHex', () => {
  test('tolerates spaces, commas and 0x prefixes', () => {
    expect(fromHex('0x48 65,6c')).toEqual(new Uint8Array([0x48, 0x65, 0x6c]));
  });

  test('returns null for odd length or non-hex input', () => {
    expect(fromHex('abc')).toBeNull();
    expect(fromHex('zz')).toBeNull();
  });
});

describe('text round trip', () => {
  test('survives non-ASCII text', () => {
    expect(hexToText(textToHex('héllo 中文'))).toBe('héllo 中文');
  });

  test('renders unparseable hex as an empty string for the caller to explain', () => {
    expect(hexToText('not hex')).toBe('');
  });
});
