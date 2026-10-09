import React, { useRef } from 'react';

/**
 * Shared shell of the textarea-based code editors: a transparent textarea
 * stacked on a highlighted <pre> overlay, with scroll sync and Tab/Shift-Tab
 * indent handling.
 *
 * The caller owns the highlighting and any error UI (passed through `footer`).
 * The shell props below default to the JSON editor's shell; other looks pass
 * their own values (see YAML_SHELL in YamlTool.tsx).
 */
export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Already-highlighted HTML rendered in the overlay <pre>. */
  highlighted: string;
  placeholder?: string;
  readOnly?: boolean;
  /** Drives the error focus ring instead of the normal one. */
  hasError?: boolean;
  /** Caller-owned overlay UI: error banner, jump button, perf notice... */
  footer?: React.ReactNode;
  /** Lets a caller reach the textarea, e.g. to select an error position. */
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  /** Classes of the root shell. */
  className?: string;
  /** Padding of the editor surface. */
  padding?: string;
  /** Caret colour of the textarea. */
  caretColor?: string;
  /** When set, a ::placeholder rule with this colour is emitted. */
  placeholderColor?: string;
  /** Overflow of the stacked textarea/pre layers. */
  overflowY?: 'scroll' | 'auto';
  /** Focus-ring classes of the textarea for a valid value. */
  focusRingClass?: string;
  /** Focus-ring classes of the textarea when `hasError`. */
  focusRingErrorClass?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  highlighted,
  placeholder,
  readOnly = false,
  hasError = false,
  footer,
  textareaRef,
  className = 'relative w-full h-full bg-slate-800 rounded-xl border border-slate-700 overflow-hidden',
  padding = '16px',
  caretColor = 'white',
  placeholderColor,
  overflowY = 'scroll',
  focusRingClass = 'focus:ring-2 focus:ring-primary-500/20',
  focusRingErrorClass = 'focus:ring-2 focus:ring-red-500/20',
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = textarea.current;
      if (!el) return;

      const start = el.selectionStart;
      const end = el.selectionEnd;

      if (e.shiftKey) {
        const val = el.value;
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        if (val.substring(lineStart, lineStart + 2) === '  ') {
          const newValue = val.substring(0, lineStart) + val.substring(lineStart + 2);
          onChange(newValue);
          setTimeout(() => {
            if (textarea.current) {
              textarea.current.selectionStart = Math.max(lineStart, start - 2);
              textarea.current.selectionEnd = Math.max(lineStart, end - 2);
            }
          }, 0);
        }
      } else {
        if (start === end) {
          const newValue = value.substring(0, start) + '  ' + value.substring(end);
          onChange(newValue);
          setTimeout(() => {
            if (textarea.current) {
              textarea.current.selectionStart = textarea.current.selectionEnd = start + 2;
            }
          }, 0);
        } else {
          const lines = value.substring(start, end).split('\n');
          const indented = lines.map(line => '  ' + line).join('\n');
          const newValue = value.substring(0, start) + indented + value.substring(end);
          onChange(newValue);
          setTimeout(() => {
            if (textarea.current) {
              textarea.current.selectionStart = start;
              textarea.current.selectionEnd = start + indented.length;
            }
          }, 0);
        }
      }
    }
  };

  const sharedStyles: React.CSSProperties = {
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '20px',
    padding,
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    boxSizing: 'border-box',
    tabSize: 2,
    border: 'none',
    outline: 'none',
  };

  const placeholderRule = placeholderColor
    ? `.code-editor-stack textarea::placeholder { color: ${placeholderColor} !important; -webkit-text-fill-color: ${placeholderColor} !important; }`
    : '';

  return (
    <div className={className}>
      <style>{`
        .code-editor-stack { display: grid; grid-template-columns: 1fr; grid-template-rows: 1fr; width: 100%; height: 100%; }
        .code-editor-stack textarea, .code-editor-stack pre { grid-area: 1 / 1 / 2 / 2; width: 100% !important; height: 100% !important; overflow-y: ${overflowY} !important; }
        .code-editor-stack textarea { background: transparent !important; color: transparent !important; -webkit-text-fill-color: transparent !important; caret-color: ${caretColor} !important; z-index: 2; }
        ${placeholderRule}
        .code-editor-stack pre { z-index: 1; pointer-events: none; user-select: none; }
      `}</style>
      <div className="code-editor-stack">
        <pre ref={preRef} style={sharedStyles} className="m-0 text-slate-200" dangerouslySetInnerHTML={{ __html: highlighted + (value.endsWith('\n') ? ' ' : '') }} />
        <textarea ref={textarea} value={value} readOnly={readOnly} onChange={(e) => onChange(e.target.value)} onKeyDown={handleKeyDown} onScroll={handleScroll} spellCheck="false" placeholder={placeholder} style={sharedStyles} className={`resize-none ${hasError ? focusRingErrorClass : focusRingClass}`} />
      </div>
      {footer}
    </div>
  );
};

export default CodeEditor;
