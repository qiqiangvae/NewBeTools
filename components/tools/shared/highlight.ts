/** Above this length the editors skip syntax highlighting to stay responsive. */
export const MAX_HIGHLIGHT_SIZE = 500000;

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
