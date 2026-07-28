import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as yaml from 'js-yaml';
import { 
  IconYaml, 
  IconJson, 
  IconCopy, 
  IconCheck, 
  IconX, 
  IconEraser, 
  IconDiff, 
  IconType,
  IconSparkles,
  IconCode
} from '../Icons';
import { ToolComponentProps, Lang } from '../../types';

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
  errorLine?: number | null;
  errorCol?: number | null;
  placeholder?: string;
  lang?: Lang;
  readOnly?: boolean;
}

const YamlEditor: React.FC<YamlEditorProps> = ({
  value,
  onChange,
  errorLine,
  errorCol,
  placeholder,
  lang = 'zh',
  readOnly = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        const val = textarea.value;
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        if (val.substring(lineStart, lineStart + 2) === '  ') {
          const newValue = val.substring(0, lineStart) + val.substring(lineStart + 2);
          onChange(newValue);
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = Math.max(lineStart, start - 2);
              textareaRef.current.selectionEnd = Math.max(lineStart, end - 2);
            }
          }, 0);
        }
      } else {
        if (start === end) {
          const newValue = value.substring(0, start) + '  ' + value.substring(end);
          onChange(newValue);
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
            }
          }, 0);
        } else {
          const lines = value.substring(start, end).split('\n');
          const indented = lines.map(line => '  ' + line).join('\n');
          const newValue = value.substring(0, start) + indented + value.substring(end);
          onChange(newValue);
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = start;
              textareaRef.current.selectionEnd = start + indented.length;
            }
          }, 0);
        }
      }
    }
  };

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
    <div className="relative w-full h-full bg-slate-900 rounded-xl border border-slate-700/80 overflow-hidden flex flex-col font-mono text-xs md:text-sm">
      <textarea
        ref={textareaRef}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck="false"
        placeholder={placeholder}
        className={`w-full h-full p-3.5 bg-transparent text-slate-200 resize-none outline-none leading-relaxed transition-all ${
          errorLine ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/40' : 'focus:ring-1 focus:ring-primary-500/40'
        }`}
      />
      {errorLine != null && (
        <button
          type="button"
          onClick={jumpToLine}
          className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 text-xs bg-red-900/90 hover:bg-red-800 text-red-200 rounded-md border border-red-700/60 shadow-lg backdrop-blur transition-all cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
          <span>
            {lang === 'zh'
              ? `错误行 ${errorLine}${errorCol != null ? ` : 列 ${errorCol}` : ''}`
              : `Line ${errorLine}${errorCol != null ? ` : Col ${errorCol}` : ''}`}
          </span>
        </button>
      )}
    </div>
  );
};

// Preset Samples
const SAMPLES = {
  docker: `version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    environment:
      NODE_ENV: production
    restart: always
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  redis_data:`,

  k8s: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-app
  labels:
    app: sample
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sample
  template:
    metadata:
      labels:
        app: sample
    spec:
      containers:
        - name: app
          image: myregistry/sample:v1.0.0
          ports:
            - containerPort: 3000
          resources:
            limits:
              cpu: "500m"
              memory: "512Mi"`,

  openapi: `openapi: 3.0.0
info:
  title: Sample User API
  version: 1.0.0
  description: Simple REST API for managing users
paths:
  /users:
    get:
      summary: List all users
      responses:
        '200':
          description: A JSON array of user objects
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                    name:
                      type: string`,

  simple: `server:
  host: "0.0.0.0"
  port: 8080
  debug: true

database:
  driver: postgres
  url: "postgres://user:secret@localhost:5432/dbname"
  pool:
    max_connections: 20
    idle_timeout: "30s"

features:
  - analytics
  - rate_limiting
  - user_auth`
};

const YamlTool: React.FC<ToolComponentProps> = ({
  lang = 'zh',
  state,
  onStateChange,
  onNavigateToTool
}) => {
  const [yamlInput, setYamlInput] = useState<string>(state?.yamlInput ?? SAMPLES.simple);
  const [indent, setIndent] = useState<number>(state?.indent ?? 2);
  const [sortKeys, setSortKeys] = useState<boolean>(state?.sortKeys ?? false);
  const [viewMode, setViewMode] = useState<'split' | 'yaml-only' | 'json-only'>(state?.viewMode ?? 'split');
  
  const [copied, setCopied] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Sync state upward
  useEffect(() => {
    onStateChange?.({ yamlInput, indent, sortKeys, viewMode });
  }, [yamlInput, indent, sortKeys, viewMode, onStateChange]);

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

  // Toast auto-clear
  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => setStatusMsg(null), 3000);
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

  const handleJsonToYaml = () => {
    if (!yamlInput.trim()) return;
    try {
      const parsedJson = JSON.parse(yamlInput);
      const dumped = yaml.dump(parsedJson, {
        indent,
        sortKeys,
        noRefs: true,
        lineWidth: -1
      });
      setYamlInput(dumped);
      setStatusMsg({
        text: lang === 'zh' ? '已将 JSON 转换为 YAML' : 'Converted JSON to YAML',
        isError: false
      });
    } catch (err: any) {
      setStatusMsg({
        text: lang === 'zh' ? '输入不是有效的 JSON' : 'Input is not valid JSON',
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

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    subtitle: lang === 'zh' ? '格式化、校验、JSON 互转与美化' : 'Format, validate, convert & prettify YAML',
    format: lang === 'zh' ? '格式化 YAML' : 'Format YAML',
    jsonToYaml: lang === 'zh' ? 'JSON 转 YAML' : 'JSON to YAML',
    minify: lang === 'zh' ? '压缩' : 'Minify',
    clear: lang === 'zh' ? '清空' : 'Clear',
    copyYaml: lang === 'zh' ? '复制 YAML' : 'Copy YAML',
    copyJson: lang === 'zh' ? '复制 JSON' : 'Copy JSON',
    downloadYaml: lang === 'zh' ? '下载 YAML' : 'Download YAML',
    downloadJson: lang === 'zh' ? '下载 JSON' : 'Download JSON',
    sendToJsonFmt: lang === 'zh' ? '发送至 JSON 工具' : 'Send to JSON Tool',
    indent: lang === 'zh' ? '缩进: ' : 'Indent: ',
    sortKeys: lang === 'zh' ? '键名排序' : 'Sort Keys',
    samples: lang === 'zh' ? '预设示例:' : 'Presets:',
    yamlInput: lang === 'zh' ? 'YAML / JSON 输入' : 'YAML / JSON Input',
    jsonOutput: lang === 'zh' ? '转换后的 JSON' : 'Converted JSON Output',
    placeholder: lang === 'zh' ? '在此粘贴或输入 YAML 或 JSON 内容...' : 'Paste or enter YAML or JSON content here...',
    validYaml: lang === 'zh' ? '语法正确' : 'Valid YAML Syntax',
    invalidYaml: lang === 'zh' ? '语法错误' : 'Invalid YAML Syntax',
    lines: lang === 'zh' ? '行数' : 'Lines',
    chars: lang === 'zh' ? '字符' : 'Chars',
    bytes: lang === 'zh' ? '字节' : 'Bytes',
    keys: lang === 'zh' ? '节点数' : 'Keys',
    modeSplit: lang === 'zh' ? '对照模式' : 'Split View',
    modeYaml: lang === 'zh' ? '仅 YAML' : 'YAML Only',
    modeJson: lang === 'zh' ? '仅 JSON' : 'JSON Only',
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
            <button
              onClick={() => setViewMode('json-only')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${
                viewMode === 'json-only' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t.modeJson}
            >
              <IconJson className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.modeJson}</span>
            </button>
          </div>
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
            onClick={handleJsonToYaml}
            className="px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
            title="Convert JSON string to YAML"
          >
            {t.jsonToYaml}
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

      {/* Preset Templates Bar */}
      <div className="flex flex-wrap items-center gap-2 px-1 text-xs">
        <span className="text-slate-400 font-medium">{t.samples}</span>
        <button
          onClick={() => setYamlInput(SAMPLES.simple)}
          className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-primary-900/40 text-slate-300 hover:text-primary-300 border border-slate-700/60 transition-all text-[11px]"
        >
          Config
        </button>
        <button
          onClick={() => setYamlInput(SAMPLES.docker)}
          className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-primary-900/40 text-slate-300 hover:text-primary-300 border border-slate-700/60 transition-all text-[11px]"
        >
          Docker Compose
        </button>
        <button
          onClick={() => setYamlInput(SAMPLES.k8s)}
          className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-primary-900/40 text-slate-300 hover:text-primary-300 border border-slate-700/60 transition-all text-[11px]"
        >
          Kubernetes
        </button>
        <button
          onClick={() => setYamlInput(SAMPLES.openapi)}
          className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-primary-900/40 text-slate-300 hover:text-primary-300 border border-slate-700/60 transition-all text-[11px]"
        >
          OpenAPI
        </button>

        {/* Validation Status Indicator */}
        <div className="ml-auto flex items-center gap-2">
          {yamlInput.trim() && (
            parsedData.error ? (
              <span className="flex items-center gap-1 text-[11px] text-red-400 bg-red-900/30 px-2 py-0.5 rounded border border-red-800/50">
                <IconX className="w-3 h-3 shrink-0" />
                <span>{t.invalidYaml}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-800/50">
                <IconCheck className="w-3 h-3 shrink-0" />
                <span>{t.validYaml}</span>
              </span>
            )
          )}
        </div>
      </div>

      {/* Main Editor Panels */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        {/* Left / YAML Panel */}
        {(viewMode === 'split' || viewMode === 'yaml-only') && (
          <div className="flex-1 flex flex-col gap-1.5 min-w-0 h-full relative">
            <div className="flex justify-between items-center px-1 h-6 shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <IconYaml className="w-3.5 h-3.5 text-emerald-400" />
                {t.yamlInput}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(yamlInput)}
                  className="text-xs flex items-center gap-1 text-slate-400 hover:text-primary-400 transition-colors"
                >
                  {copied ? <IconCheck className="w-3 h-3 text-emerald-400" /> : <IconCopy className="w-3 h-3" />}
                  <span>{t.copyYaml}</span>
                </button>
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
        )}

        {/* Right / JSON Panel */}
        {(viewMode === 'split' || viewMode === 'json-only') && (
          <div className="flex-1 flex flex-col gap-1.5 min-w-0 h-full">
            <div className="flex justify-between items-center px-1 h-6 shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <IconJson className="w-3.5 h-3.5 text-sky-400" />
                {t.jsonOutput}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(jsonOutput)}
                  disabled={!jsonOutput}
                  className="text-xs flex items-center gap-1 text-slate-400 hover:text-sky-400 disabled:opacity-40 transition-colors"
                >
                  <IconCopy className="w-3 h-3" />
                  <span>{t.copyJson}</span>
                </button>
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
          {lang === 'zh' ? '支持 YAML ↔ JSON 双向转换及格式美化' : 'Supports YAML ↔ JSON bi-directional conversion and formatting'}
        </div>
      </div>
    </div>
  );
};

export default YamlTool;
