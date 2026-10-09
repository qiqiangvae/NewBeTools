import React, { useRef } from 'react';

/** The look of one editor instance; the app needs exactly two of these. */
export interface EditorShell {
  className: string;
  padding: string;
  caretColor: string;
  /** Emitted as a ::placeholder rule; omit it to leave the browser default. */
  placeholderColor?: string;
  overflowY: 'scroll' | 'auto';
  focusRingClass: string;
  focusRingErrorClass: string;
}

const JSON_SHELL: EditorShell = {
  className: 'relative w-full h-full bg-slate-800 rounded-xl border border-slate-700 overflow-hidden',
  padding: '16px',
  caretColor: 'white',
  placeholderColor: '#64748b',
  overflowY: 'scroll',
  focusRingClass: 'focus:ring-2 focus:ring-primary-500/20',
  focusRingErrorClass: 'focus:ring-2 focus:ring-red-500/20',
};

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Already-highlighted HTML for the overlay <pre>. */
  highlighted: string;
  placeholder?: string;
  readOnly?: boolean;
  /** Swaps the focus ring for the error one. */
  hasError?: boolean;
  /** Caller-owned overlay UI: error banner, jump button, perf notice... */
  footer?: React.ReactNode;
  /** Caller-held ref, e.g. to select an error position. */
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  /** Defaults to the JSON editor's shell. */
  shell?: EditorShell;
}

/**
 * Shell shared by the textarea code editors: a transparent textarea stacked on a
 * highlighted <pre> overlay, with scroll sync and Tab/Shift-Tab indent handling.
 * Callers own the highlighting and any error UI (passed through `footer`).
 */
const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  highlighted,
  placeholder,
  readOnly = false,
  hasError = false,
  footer,
  textareaRef,
  shell = JSON_SHELL,
}) => {
  const ownTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textarea = textareaRef ?? ownTextareaRef;
  const preRef = useRef<HTMLPreElement>(null);

  const handleScroll = () => {
    if (textarea.current && preRef.current) {
      preRef.current.scrollTop = textarea.current.scrollTop;
      preRef.current.scrollLeft = textarea.current.scrollLeft;
    }
  };

  /** Restores the caret once React has re-rendered the controlled value. */
  const restoreSelection = (selStart: number, selEnd = selStart) => setTimeout(() => {
    if (textarea.current) {
      textarea.current.selectionStart = selStart;
      textarea.current.selectionEnd = selEnd;
    }
  }, 0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly || e.key !== 'Tab') return;
    e.preventDefault();
    const el = textarea.current;
    if (!el) return;

    const { selectionStart: start, selectionEnd: end } = el;

    if (e.shiftKey) {
      const val = el.value;
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      if (val.substring(lineStart, lineStart + 2) !== '  ') return;
      onChange(val.substring(0, lineStart) + val.substring(lineStart + 2));
      restoreSelection(Math.max(lineStart, start - 2), Math.max(lineStart, end - 2));
    } else if (start === end) {
      onChange(value.substring(0, start) + '  ' + value.substring(end));
      restoreSelection(start + 2);
    } else {
      const indented = value.substring(start, end).split('\n').map(line => '  ' + line).join('\n');
      onChange(value.substring(0, start) + indented + value.substring(end));
      restoreSelection(start, start + indented.length);
    }
  };

  const sharedStyles: React.CSSProperties = {
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '20px',
    padding: shell.padding,
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    boxSizing: 'border-box',
    tabSize: 2,
    border: 'none',
    outline: 'none',
  };

  const placeholderRule = shell.placeholderColor
    ? `.code-editor-stack textarea::placeholder { color: ${shell.placeholderColor} !important; -webkit-text-fill-color: ${shell.placeholderColor} !important; }`
    : '';

  return (
    <div className={shell.className}>
      <style>{`
        .code-editor-stack { display: grid; grid-template-columns: 1fr; grid-template-rows: 1fr; width: 100%; height: 100%; }
        .code-editor-stack textarea, .code-editor-stack pre { grid-area: 1 / 1 / 2 / 2; width: 100% !important; height: 100% !important; overflow-y: ${shell.overflowY} !important; }
        .code-editor-stack textarea { background: transparent !important; color: transparent !important; -webkit-text-fill-color: transparent !important; caret-color: ${shell.caretColor} !important; z-index: 2; }
        ${placeholderRule}
        .code-editor-stack pre { z-index: 1; pointer-events: none; user-select: none; }
      `}</style>
      <div className="code-editor-stack">
        <pre ref={preRef} style={sharedStyles} className="m-0 text-slate-200" dangerouslySetInnerHTML={{ __html: highlighted + (value.endsWith('\n') ? ' ' : '') }} />
        <textarea ref={textarea} value={value} readOnly={readOnly} onChange={(e) => onChange(e.target.value)} onKeyDown={handleKeyDown} onScroll={handleScroll} spellCheck="false" placeholder={placeholder} style={sharedStyles} className={`resize-none ${hasError ? shell.focusRingErrorClass : shell.focusRingClass}`} />
      </div>
      {footer}
    </div>
  );
};

export default CodeEditor;
