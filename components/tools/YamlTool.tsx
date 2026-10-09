import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as yaml from 'js-yaml';
import { 
  IconYaml, 
  IconJson, 
  IconCheck, 
  IconX, 
  IconEraser, 
  IconDiff, 
  IconSparkles
} from '../Icons';
import { ToolComponentProps, Lang } from '../../types';
import { MAX_HIGHLIGHT_SIZE, escapeHtml } from './shared/highlight';
import CopyButton from './shared/CopyButton';
import CodeEditor, { EditorShell } from './shared/CodeEditor';

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
  errorLine?: number | null;
  errorCol?: number | null;
  placeholder?: string;
  lang?: Lang;
  readOnly?: boolean;
  /** Which highlight.js grammar to colour the value with. */
  language?: 'yaml' | 'json';
}

declare const hljs: any;

/**
 * Colours the text with highlight.js — a page global, whose stylesheet is
 * linked from index.html. Highlighting runs per line so the error-line marker
 * can wrap exactly one line without having to cut through hljs's spans.
 */
function highlightCode(text: string, language: 'yaml' | 'json', errorLine?: number | null): string {
  if (!text) return '';
  if (text.length > MAX_HIGHLIGHT_SIZE || typeof hljs === 'undefined') return escapeHtml(text);

  return text
    .split('\n')
    .map((line, index) => {
      const html = line ? hljs.highlight(line, { language, ignoreIllegals: true }).value : '';
      if (errorLine != null && index === errorLine - 1) {
        return `<span class="bg-red-500/20 text-red-200 border-l-2 border-red-500 pl-1 -ml-1 inline-block w-full">${html || '&nbsp;'}</span>`;
      }
      return html;
    })
    .join('\n');
}

/** The JSON editor's shell is the shared default; this is YAML's. */
const YAML_SHELL: EditorShell = {
  className: 'relative w-full h-full bg-slate-900 rounded-xl border border-slate-700/80 overflow-hidden flex flex-col font-mono text-xs md:text-sm',
  padding: '14px',
  caretColor: '#38bdf8',
  placeholderColor: '#64748b',
  overflowY: 'auto',
  focusRingClass: 'outline-none focus:ring-1 focus:ring-primary-500/40',
  focusRingErrorClass: 'outline-none focus:ring-1 focus:ring-red-500/40',
};

const YamlEditor: React.FC<YamlEditorProps> = ({
  value,
  onChange,
  errorLine,
  errorCol,
  placeholder,
  lang = 'zh',
  readOnly = false,
  language = 'yaml'
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const highlighted = useMemo(() => {
    return highlightCode(value, language, errorLine);
  }, [value, language, errorLine]);

  const jumpToLine = () => {
    if (errorLine == null || !textareaRef.current) return;
    const lines = value.split('\n');
    let pos = 0;
    for (let i = 0; i < errorLine - 1 && i < lines.length; i++) {
      pos += lines[i].length + 1;
    }
    if (errorCol != null) {
      pos += Math.max(0, errorCol - 1);
    }
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(pos, pos + 1);
  };

  return (
    <CodeEditor
      shell={YAML_SHELL}
      value={value}
      onChange={onChange}
      highlighted={highlighted}
      placeholder={placeholder}
      readOnly={readOnly}
      hasError={!!errorLine}
      textareaRef={textareaRef}
      footer={
        errorLine != null && (
          <button
            type="button"
            onClick={jumpToLine}
            className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 px-2.5 py-1 text-xs bg-red-900/90 hover:bg-red-800 text-red-200 rounded-md border border-red-700/60 shadow-lg backdrop-blur transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
            <span>
              {lang === 'zh'
                ? `错误行 ${errorLine}${errorCol != null ? ` : 列 ${errorCol}` : ''}`
                : `Line ${errorLine}${errorCol != null ? ` : Col ${errorCol}` : ''}`}
            </span>
          </button>
        )
      }
    />
  );
};

const DEFAULT_YAML = `server:
  host: "0.0.0.0"
  port: 8080
  debug: true

database:
  driver: postgres
  url: "postgres://user:secret@localhost:5432/dbname"
  pool:
    max_connections: 20

features:
  - analytics
  - user_auth`;

const YamlTool: React.FC<ToolComponentProps> = ({
  lang = 'zh',
  state,
  onStateChange,
  onNavigateToTool
}) => {
  const [yamlInput, setYamlInput] = useState<string>(state?.yamlInput ?? DEFAULT_YAML);
  const [indent, setIndent] = useState<number>(state?.indent ?? 2);
  const [sortKeys, setSortKeys] = useState<boolean>(state?.sortKeys ?? false);
  const [viewMode, setViewMode] = useState<'split' | 'yaml-only'>(
    state?.viewMode === 'yaml-only' ? 'yaml-only' : 'split'
  );
  
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Sync state upward
  useEffect(() => {
    onStateChange?.({ yamlInput, indent, sortKeys, viewMode });
  }, [yamlInput, indent, sortKeys, viewMode, onStateChange]);

  // Update yamlInput when state.yamlInput changes externally (e.g. from JSON tool)
  useEffect(() => {
    if (state?.yamlInput !== undefined) {
      setYamlInput(state.yamlInput);
    }
  }, [state?.yamlInput]);

  // Parse YAML to JS Object or error
  const parsedData = useMemo(() => {
    if (!yamlInput.trim()) {
      return { obj: null, error: null, line: null, col: null };
    }
    try {
      const obj = yaml.load(yamlInput);
      return { obj, error: null, line: null, col: null };
    } catch (err: any) {
      let line: number | null = null;
      let col: number | null = null;
      if (err?.mark) {
        line = err.mark.line + 1; // 1-indexed
        col = err.mark.column + 1;
      }
      return { obj: null, error: err?.message || 'Invalid YAML format', line, col };
    }
  }, [yamlInput]);

  // Convert parsed object to formatted JSON
  const jsonOutput = useMemo(() => {
    if (parsedData.error || parsedData.obj === undefined || parsedData.obj === null) {
      return '';
    }
    try {
      return JSON.stringify(parsedData.obj, null, indent);
    } catch {
      return '';
    }
  }, [parsedData, indent]);

  // Toast auto-clear (0.5s for errors, 3s for success)
  useEffect(() => {
    if (statusMsg) {
      const duration = statusMsg.isError ? 500 : 3000;
      const timer = setTimeout(() => setStatusMsg(null), duration);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  // Actions
  const handleFormatYaml = () => {
    if (!yamlInput.trim()) return;
    try {
      const obj = yaml.load(yamlInput);
      if (obj === undefined || obj === null) return;
      const formatted = yaml.dump(obj, {
        indent,
        sortKeys,
        noRefs: true,
        lineWidth: -1
      });
      setYamlInput(formatted);
      setStatusMsg({
        text: lang === 'zh' ? 'YAML 格式化成功' : 'YAML Formatted successfully',
        isError: false
      });
    } catch (err: any) {
      setStatusMsg({
        text: err?.message || (lang === 'zh' ? 'YAML 格式错误' : 'Invalid YAML'),
        isError: true
      });
    }
  };

  const handleMinifyYaml = () => {
    if (!yamlInput.trim()) return;
    try {
      const obj = yaml.load(yamlInput);
      if (obj === undefined || obj === null) return;
      // Convert to minified JSON style flow
      const minified = JSON.stringify(obj);
      setYamlInput(minified);
      setStatusMsg({
        text: lang === 'zh' ? '已压缩为单行流格式' : 'Minified into compact flow format',
        isError: false
      });
    } catch (err: any) {
      setStatusMsg({
        text: err?.message || (lang === 'zh' ? '压缩失败' : 'Minify failed'),
        isError: true
      });
    }
  };

  const handleClear = () => {
    setYamlInput('');
  };

  const handleDownload = (filename: string, text: string) => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendToJsonFormatter = () => {
    if (jsonOutput && onNavigateToTool) {
      onNavigateToTool('json-fmt', { input: jsonOutput });
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const lines = yamlInput ? yamlInput.split('\n').length : 0;
    const chars = yamlInput.length;
    const bytes = new Blob([yamlInput]).size;
    let keysCount = 0;
    if (parsedData.obj && typeof parsedData.obj === 'object') {
      const countKeys = (item: any): number => {
        if (!item || typeof item !== 'object') return 0;
        let c = 0;
        if (Array.isArray(item)) {
          item.forEach(i => { c += countKeys(i); });
        } else {
          const keys = Object.keys(item);
          c += keys.length;
          keys.forEach(k => { c += countKeys(item[k]); });
        }
        return c;
      };
      keysCount = countKeys(parsedData.obj);
    }
    return { lines, chars, bytes, keysCount };
  }, [yamlInput, parsedData.obj]);

  const t = {
    title: lang === 'zh' ? 'YAML 工具' : 'YAML Tool',
    subtitle: lang === 'zh' ? 'YAML 格式化（含键名高亮）、语法校验与 JSON 转换' : 'Format YAML with key highlighting, validate and convert to JSON',
    format: lang === 'zh' ? '格式化 YAML' : 'Format YAML',
    minify: lang === 'zh' ? '压缩' : 'Minify',
    clear: lang === 'zh' ? '清空' : 'Clear',
    copyYaml: lang === 'zh' ? '复制 YAML' : 'Copy YAML',
    copyJson: lang === 'zh' ? '复制 JSON' : 'Copy JSON',
    downloadYaml: lang === 'zh' ? '下载 YAML' : 'Download YAML',
    downloadJson: lang === 'zh' ? '下载 JSON' : 'Download JSON',
    sendToJsonFmt: lang === 'zh' ? '发送至 JSON 工具' : 'Send to JSON Tool',
    indent: lang === 'zh' ? '缩进: ' : 'Indent: ',
    sortKeys: lang === 'zh' ? '键名排序' : 'Sort Keys',
    yamlInput: lang === 'zh' ? 'YAML 输入' : 'YAML Input',
    jsonOutput: lang === 'zh' ? '转换后的 JSON' : 'Converted JSON Output',
    placeholder: lang === 'zh' ? '在此粘贴或输入 YAML 内容...' : 'Paste or enter YAML content here...',
    validYaml: lang === 'zh' ? '语法正确' : 'Valid YAML Syntax',
    invalidYaml: lang === 'zh' ? '语法错误' : 'Invalid YAML Syntax',
    lines: lang === 'zh' ? '行数' : 'Lines',
    chars: lang === 'zh' ? '字符' : 'Chars',
    bytes: lang === 'zh' ? '字节' : 'Bytes',
    keys: lang === 'zh' ? '节点数' : 'Keys',
    modeSplit: lang === 'zh' ? '对照模式' : 'Split View',
    modeYaml: lang === 'zh' ? '仅 YAML' : 'YAML Only',
  };

  return (
    <div className="flex flex-col gap-4 h-full min-h-[500px]">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <IconYaml className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{t.title}</h2>
              <p className="text-[11px] text-slate-400 hidden sm:block">{t.subtitle}</p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 shadow-sm ml-2">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${
                viewMode === 'split' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t.modeSplit}
            >
              <IconDiff className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.modeSplit}</span>
            </button>
            <button
              onClick={() => setViewMode('yaml-only')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${
                viewMode === 'yaml-only' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t.modeYaml}
            >
              <IconYaml className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.modeYaml}</span>
            </button>
          </div>

          {/* Validation Status Indicator */}
          {yamlInput.trim() && (
            parsedData.error ? (
              <span className="flex items-center gap-1 text-[11px] text-red-400 bg-red-900/30 px-2 py-1 rounded border border-red-800/50">
                <IconX className="w-3 h-3 shrink-0" />
                <span>{t.invalidYaml}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded border border-emerald-800/50">
                <IconCheck className="w-3 h-3 shrink-0" />
                <span>{t.validYaml}</span>
              </span>
            )
          )}
        </div>

        {/* Formatting Controls & Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Indent option */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300">
            <span>{t.indent}</span>
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200 outline-none focus:border-primary-500"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </div>

          {/* Sort keys toggle */}
          <button
            onClick={() => setSortKeys(!sortKeys)}
            className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
              sortKeys
                ? 'bg-primary-900/40 border-primary-500/50 text-primary-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.sortKeys}
          </button>

          {/* Action buttons */}
          <button
            onClick={handleFormatYaml}
            className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors shadow-md flex items-center gap-1.5"
          >
            <IconSparkles className="w-3.5 h-3.5" />
            <span>{t.format}</span>
          </button>

          <button
            onClick={handleMinifyYaml}
            className="px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            {t.minify}
          </button>

          <button
            onClick={handleClear}
            className="px-2 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 rounded border border-slate-700 transition-colors"
            title={t.clear}
          >
            <IconEraser className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Editor Panels */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        {/* Left / YAML Panel */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0 h-full relative">
          <div className="flex justify-between items-center px-1 h-6 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <IconYaml className="w-3.5 h-3.5 text-emerald-400" />
              {t.yamlInput}
            </span>
            <div className="flex items-center gap-2">
              <CopyButton
                text={yamlInput}
                title={t.copyYaml}
                label={t.copyYaml}
                className="text-xs text-slate-400 hover:text-primary-400"
                iconClassName="w-3 h-3"
              />
              <button
                onClick={() => handleDownload('config.yaml', yamlInput)}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                {t.downloadYaml}
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <YamlEditor
              value={yamlInput}
              onChange={setYamlInput}
              errorLine={parsedData.line}
              errorCol={parsedData.col}
              placeholder={t.placeholder}
              lang={lang}
            />
          </div>
        </div>

        {/* Right / JSON Panel (Split View Only) */}
        {viewMode === 'split' && (
          <div className="flex-1 flex flex-col gap-1.5 min-w-0 h-full">
            <div className="flex justify-between items-center px-1 h-6 shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <IconJson className="w-3.5 h-3.5 text-sky-400" />
                {t.jsonOutput}
              </span>
              <div className="flex items-center gap-2">
                <CopyButton
                  text={jsonOutput}
                  title={t.copyJson}
                  label={t.copyJson}
                  disabled={!jsonOutput}
                  className="text-xs text-slate-400 hover:text-sky-400 disabled:opacity-40"
                  iconClassName="w-3 h-3"
                />
                <button
                  onClick={() => handleDownload('converted.json', jsonOutput)}
                  disabled={!jsonOutput}
                  className="text-[11px] text-slate-500 hover:text-slate-300 disabled:opacity-40 transition-colors"
                >
                  {t.downloadJson}
                </button>
                {onNavigateToTool && (
                  <button
                    onClick={handleSendToJsonFormatter}
                    disabled={!jsonOutput}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-medium disabled:opacity-40 transition-colors"
                  >
                    {t.sendToJsonFmt} →
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <YamlEditor
                value={jsonOutput}
                onChange={() => {}}
                readOnly={true}
                language="json"
                placeholder={parsedData.error ? parsedData.error : (lang === 'zh' ? '在此显示 JSON 转换结果...' : 'JSON output will appear here...')}
                lang={lang}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Banner Notification */}
      {parsedData.error && (
        <div className="bg-red-950/80 border border-red-800/80 rounded-xl p-3 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 shrink-0">
          <IconX className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <div className="flex-1 font-mono break-all leading-relaxed">
            <div className="font-bold mb-0.5">{lang === 'zh' ? 'YAML 解析错误:' : 'YAML Parse Error:'}</div>
            <div>{parsedData.error}</div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {statusMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 border animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            statusMsg.isError
              ? 'bg-red-900/90 text-red-100 border-red-700/80'
              : 'bg-emerald-900/90 text-emerald-100 border-emerald-700/80'
          }`}
        >
          {statusMsg.isError ? <IconX className="w-4 h-4" /> : <IconCheck className="w-4 h-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Statistics Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-4">
          <span>{t.lines}: <strong className="text-slate-300 font-mono">{stats.lines}</strong></span>
          <span>{t.chars}: <strong className="text-slate-300 font-mono">{stats.chars}</strong></span>
          <span>{t.bytes}: <strong className="text-slate-300 font-mono">{stats.bytes} B</strong></span>
          <span>{t.keys}: <strong className="text-slate-300 font-mono">{stats.keysCount}</strong></span>
        </div>
        <div className="italic">
          {lang === 'zh' ? '支持 YAML 格式化、语法校验及 JSON 实时转换' : 'Supports YAML formatting, validation and real-time JSON conversion'}
        </div>
      </div>
    </div>
  );
};

export default YamlTool;
