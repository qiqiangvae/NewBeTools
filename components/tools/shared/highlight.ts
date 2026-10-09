/** Above this length the editors skip syntax highlighting to stay responsive. */
export const MAX_HIGHLIGHT_SIZE = 500000;

declare const hljs: any;

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Highlights a whole document with a page-global grammar. Returns escaped text
 * when there is no grammar for the format (highlight.js ships none for CSV), the
 * document is huge, or hljs never loaded — callers render the result as-is.
 */
export function highlightLang(text: string, language: string | null): string {
  if (!text || !language) return escapeHtml(text);
  if (text.length > MAX_HIGHLIGHT_SIZE || typeof hljs === 'undefined') return escapeHtml(text);
  try {
    return hljs.highlight(text, { language, ignoreIllegals: true }).value;
  } catch {
    return escapeHtml(text);
  }
}
