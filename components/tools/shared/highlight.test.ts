import { afterEach, describe, expect, test } from 'bun:test';
import { MAX_HIGHLIGHT_SIZE, escapeHtml, highlightLang } from './highlight';

/** highlight.js is a page global here, so the tests stand one in. */
const stubHljs = (highlight: (text: string, options: any) => { value: string } = (text) => ({
  value: `<b>${text}</b>`,
})) => {
  (globalThis as any).hljs = { highlight };
};

afterEach(() => {
  delete (globalThis as any).hljs;
});

describe('escapeHtml', () => {
  test('neutralises the three characters that could break out of the <pre>', () => {
    expect(escapeHtml('<a href="x">A & B</a>')).toBe('&lt;a href="x"&gt;A &amp; B&lt;/a&gt;');
  });
});

describe('highlightLang', () => {
  test('hands the text to hljs when a grammar exists', () => {
    stubHljs();
    expect(highlightLang('a: 1', 'yaml')).toBe('<b>a: 1</b>');
  });

  test('escapes instead of highlighting when the format has no grammar', () => {
    stubHljs();
    expect(highlightLang('<a,b>', null)).toBe('&lt;a,b&gt;');
  });

  test('skips hljs entirely above the size cap, so a huge document cannot freeze the editor', () => {
    let called = false;
    stubHljs((text) => {
      called = true;
      return { value: text };
    });
    const huge = 'x'.repeat(MAX_HIGHLIGHT_SIZE + 1);
    expect(highlightLang(huge, 'json')).toBe(huge);
    expect(called).toBe(false);
  });

  test('survives a grammar hljs does not know, and a missing hljs', () => {
    stubHljs(() => {
      throw new Error('unknown language');
    });
    expect(highlightLang('<a>', 'nope')).toBe('&lt;a&gt;');

    delete (globalThis as any).hljs;
    expect(highlightLang('<a>', 'json')).toBe('&lt;a&gt;');
  });

  test('renders empty text as empty, whatever the format', () => {
    stubHljs();
    expect(highlightLang('', 'json')).toBe('');
    expect(highlightLang('', null)).toBe('');
  });
});
