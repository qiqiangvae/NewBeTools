
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { IconCopy, IconCheck, IconX, IconSearch, IconJson, IconType, IconPanelLeft, IconEraser, IconSparkles, IconDiff } from '../Icons';
import { ToolComponentProps } from '../../types';

declare const jsonpath: any;

// Performance Threshold: 50KB
const MAX_HIGHLIGHT_SIZE = 50000;

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error: boolean;
  placeholder?: string;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, error, placeholder }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const highlighted = useMemo(() => {
    if (!value) return '';
    
    // Performance Guard: Don't highlight massive strings
    if (value.length > MAX_HIGHLIGHT_SIZE) {
        return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    const safeHtml = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return safeHtml.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'text-amber-400';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'text-sky-400 font-semibold' : 'text-emerald-400';
        } else if (/true|false/.test(match)) {
          cls = 'text-violet-400 font-semibold';
        } else if (/null/.test(match)) {
          cls = 'text-slate-500 italic';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  }, [value]);

  const sharedStyles: React.CSSProperties = {
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '20px',
    padding: '16px',
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    boxSizing: 'border-box',
    tabSize: 2,
    border: 'none',
    outline: 'none',
  };

  return (
    <div className="relative w-full h-full bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <style>{`
        .editor-stack { display: grid; grid-template-columns: 1fr; grid-template-rows: 1fr; width: 100%; height: 100%; }
        .editor-stack textarea, .editor-stack pre { grid-area: 1 / 1 / 2 / 2; width: 100% !important; height: 100% !important; overflow-y: scroll !important; }
        .editor-stack textarea { background: transparent !important; color: transparent !important; -webkit-text-fill-color: transparent !important; caret-color: white !important; z-index: 2; }
        .editor-stack pre { z-index: 1; pointer-events: none; user-select: none; }
      `}</style>
      <div className="editor-stack">
        <pre ref={preRef} style={sharedStyles} className="m-0 text-slate-200" dangerouslySetInnerHTML={{ __html: highlighted + (value.endsWith('\n') ? ' ' : '') }} />
        <textarea ref={textareaRef} value={value} onChange={(e) => onChange(e.target.value)} onScroll={handleScroll} spellCheck="false" placeholder={placeholder} style={sharedStyles} className={`resize-none ${error ? 'focus:ring-2 focus:ring-red-500/20' : 'focus:ring-2 focus:ring-primary-500/20'}`} />
      </div>
      {value.length > MAX_HIGHLIGHT_SIZE && (
        <div className="absolute top-2 right-10 z-30 bg-yellow-900/80 text-yellow-200 text-[10px] px-2 py-1 rounded border border-yellow-700/50">
            Performance Mode (Highlighting Disabled)
        </div>
      )}
    </div>
  );
};

// Tree view components... (rest of JsonNode remains same)
interface JsonNodeProps { name?: string; value: any; isLast: boolean; }
const JsonNode: React.FC<JsonNodeProps> = ({ name, value, isLast }) => {
  const [collapsed, setCollapsed] = useState(false);
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const isEmpty = isObject && Object.keys(value).length === 0;
  if (!isObject) {
    const color = typeof value === 'string' ? 'text-green-400' : typeof value === 'number' ? 'text-blue-400' : typeof value === 'boolean' ? 'text-purple-400' : 'text-slate-400';
    return (<div className="hover:bg-slate-800/50 px-1 rounded font-mono text-sm leading-6 ml-4">{name && <span className="text-primary-300">"{name}"<span className="text-slate-500">: </span></span>}<span className={color}>{JSON.stringify(value)}</span>{!isLast && <span className="text-slate-500">,</span>}</div>);
  }
  const keys = Object.keys(value);
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';
  if (isEmpty) return (<div className="hover:bg-slate-800/50 px-1 rounded font-mono text-sm leading-6 ml-4">{name && <span className="text-primary-300">"{name}"<span className="text-slate-500">: </span></span>}<span className="text-slate-500">{openBracket}{closeBracket}</span>{!isLast && <span className="text-slate-500">,</span>}</div>);
  return (
    <div className="group font-mono text-sm leading-6">
       <div className="hover:bg-slate-800/50 px-1 rounded flex items-start">
         <button onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }} className="w-4 h-6 flex items-center justify-center text-slate-500 hover:text-slate-300 mr-0.5 select-none shrink-0"><span className="text-[9px] transform transition-transform duration-200" style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▼</span></button>
         <div className="flex-1 min-w-0">{name && <span className="text-primary-300">"{name}"<span className="text-slate-500">: </span></span>}<span className="text-slate-500">{openBracket}</span>
            {collapsed ? (<><button onClick={() => setCollapsed(false)} className="text-slate-600 text-[10px] px-1.5 hover:text-slate-400 bg-slate-700/50 rounded mx-1">...</button><span className="text-slate-500">{closeBracket}</span>{!isLast && <span className="text-slate-500">,</span>}</>) : (<><div className="pl-3 border-l border-slate-700/50 ml-1.5 my-0.5">{keys.map((key, idx) => (<JsonNode key={key} name={isArray ? undefined : key} value={value[key]} isLast={idx === keys.length - 1} />))}</div><div className="ml-4"><span className="text-slate-500">{closeBracket}</span>{!isLast && <span className="text-slate-500">,</span>}</div></>)}
         </div>
       </div>
    </div>
  );
};

const JsonFormatter: React.FC<ToolComponentProps> = ({ lang, state, onStateChange }) => {
  const [input, setInput] = useState(state?.input || '');
  const [viewMode, setViewMode] = useState<'text' | 'tree' | 'split'>(state?.viewMode || 'split');
  const [showJsonPath, setShowJsonPath] = useState(state?.showJsonPath || false);
  const [pathQuery, setPathQuery] = useState(state?.pathQuery || '$.');
  const [error, setError] = useState<string | null>(null);
  const [errorVisible, setErrorVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pathResult, setPathResult] = useState('');

  useEffect(() => {
    onStateChange?.({ input, viewMode, showJsonPath, pathQuery });
  }, [input, viewMode, showJsonPath, pathQuery, onStateChange]);

  const t = {
    title: lang === 'zh' ? 'JSON 编辑器' : 'JSON Editor',
    textMode: lang === 'zh' ? '文本' : 'Text',
    treeMode: lang === 'zh' ? '树形' : 'Tree',
    splitMode: lang === 'zh' ? '对照' : 'Split',
    path: lang === 'zh' ? '路径' : 'Path',
    esc: lang === 'zh' ? '转义' : 'Esc',
    unesc: lang === 'zh' ? '去转义' : 'UnEsc',
    rmNewline: lang === 'zh' ? '去除 \\n' : 'Del \\n',
    fix: lang === 'zh' ? '自动修复' : 'Auto Fix',
    format: lang === 'zh' ? '格式化' : 'Format',
    minify: lang === 'zh' ? '压缩' : 'Minify',
    copy: lang === 'zh' ? '复制' : 'Copy',
    copied: lang === 'zh' ? '已复制' : 'Copied',
    inputTitle: lang === 'zh' ? '输入 JSON' : 'Input JSON',
    treeTitle: lang === 'zh' ? '树形视图' : 'Tree Viewer',
    pathTitle: lang === 'zh' ? 'JSONPath 表达式' : 'JSONPath Expression',
    resultTitle: lang === 'zh' ? '提取结果' : 'Extraction Result',
    readonly: lang === 'zh' ? '只读' : 'ReadOnly',
    placeholder: lang === 'zh' ? '在此粘贴或输入 JSON...' : 'Paste or type JSON here...',
    empty: lang === 'zh' ? '无效的 JSON' : 'Invalid JSON',
    noMatch: lang === 'zh' ? '无匹配' : 'No match',
  };

  useEffect(() => {
    if (!input.trim()) { setError(null); return; }
    try { JSON.parse(input); setError(null); } catch (e: any) { setError(e.message); }
  }, [input]);

  useEffect(() => {
    if (!input.trim() || !pathQuery.trim() || error || typeof jsonpath === 'undefined') { setPathResult(''); return; }
    const timer = setTimeout(() => {
        try {
            const jsonData = JSON.parse(input);
            const result = jsonpath.query(jsonData, pathQuery);
            setPathResult(result.length === 0 ? t.noMatch : JSON.stringify(result, null, 2));
        } catch { setPathResult(''); }
    }, 400); // Debounce JSONPath query
    return () => clearTimeout(timer);
  }, [input, pathQuery, error, t.noMatch]);

  const formatJson = () => { try { setInput(JSON.stringify(JSON.parse(input), null, 2)); } catch (e: any) { setError(e.message); setErrorVisible(true); } };
  const minifyJson = () => { try { setInput(JSON.stringify(JSON.parse(input))); } catch (e: any) { setError(e.message); setErrorVisible(true); } };
  const escapeJson = () => { setInput(JSON.stringify(input)); };
  const unescapeJson = () => { try { setInput(input.startsWith('"') ? JSON.parse(input) : input.replace(/\\"/g, '"').replace(/\\\\/g, '\\')); } catch { } };
  const fixJson = () => { let fixed = input.replace(/\\'/g, "'").replace(/\bNone\b/g, 'null').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/,\s*([\]}])/g, '$1'); try { setInput(JSON.stringify(JSON.parse(fixed), null, 2)); } catch { setInput(fixed); } };
  const handleCopy = (text: string) => { if (!text) return; navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const parsedJson = useMemo(() => { if (!input.trim() || input.length > MAX_HIGHLIGHT_SIZE * 2) return null; try { return JSON.parse(input); } catch { return null; } }, [input]);

  return (
    <div className="flex flex-col gap-4 h-full min-h-[500px]">
      <div className="flex flex-wrap items-center justify-between gap-3 p-1">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2"><IconJson className="w-5 h-5 text-primary-400" /><h2 className="text-lg font-bold text-slate-100">{t.title}</h2></div>
          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 shadow-sm">
              <button onClick={() => setViewMode('text')} title={t.textMode} className={`px-2.5 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${viewMode === 'text' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}><IconType className="w-3.5 h-3.5" /></button>
              <button onClick={() => setViewMode('tree')} title={t.treeMode} className={`px-2.5 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${viewMode === 'tree' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}><IconPanelLeft className="w-3.5 h-3.5" /></button>
              <button onClick={() => setViewMode('split')} title={t.splitMode} className={`px-2.5 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${viewMode === 'split' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}><IconDiff className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
            <button onClick={formatJson} className="px-4 py-1.5 text-xs font-bold bg-primary-600 hover:bg-primary-500 rounded text-white transition-colors shadow-md">{t.format}</button>
            <button onClick={() => setShowJsonPath(!showJsonPath)} className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${showJsonPath ? 'bg-primary-900/30 border-primary-500/50 text-primary-300' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>{t.path}</button>
            <div className="flex gap-1">
                 <button onClick={escapeJson} className="px-2 py-1.5 text-xs font-medium bg-slate-800 rounded border border-slate-700 text-slate-300">{t.esc}</button>
                 <button onClick={unescapeJson} className="px-2 py-1.5 text-xs font-medium bg-slate-800 rounded border border-slate-700 text-slate-300">{t.unesc}</button>
                 <button onClick={fixJson} className="px-2 py-1.5 text-xs font-medium bg-indigo-900/30 text-indigo-300 rounded border border-indigo-900/50">{t.fix}</button>
            </div>
            <button onClick={minifyJson} className="px-3 py-1.5 text-xs font-medium bg-slate-800 rounded border border-slate-700 text-slate-300">{t.minify}</button>
        </div>
      </div>
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        <div className={`flex-1 flex flex-col gap-3 min-w-0 h-full ${viewMode === 'split' ? 'lg:flex-row' : ''}`}>
            {(viewMode === 'text' || viewMode === 'split') && (
                <div className="flex-1 flex flex-col gap-1.5 min-w-0 h-full relative">
                    <div className="flex justify-between items-center px-1 h-6 shrink-0"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.inputTitle}</span><button onClick={() => handleCopy(input)} className="text-xs flex items-center gap-1 text-slate-500 hover:text-primary-400 transition-colors">{copied ? <IconCheck className="w-3 h-3"/> : <IconCopy className="w-3 h-3"/>} {t.copy}</button></div>
                    <div className="flex-1 min-h-0"><JsonEditor value={input} onChange={setInput} error={!!error} placeholder={t.placeholder} /></div>
                    {error && errorVisible && <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-md"><div className="bg-red-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3"><IconX className="w-5 h-5 shrink-0" /><span className="flex-1 truncate font-mono text-xs">{error}</span></div></div>}
                </div>
            )}
            {(viewMode === 'tree' || viewMode === 'split') && (
                <div className="flex-1 flex flex-col gap-1.5 min-w-0 h-full">
                    <div className="flex justify-between items-center px-1 h-6 shrink-0"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.treeTitle}</span></div>
                    <div className="flex-1 h-full overflow-hidden bg-slate-800 rounded-xl border border-slate-700">
                        <div className="w-full h-full overflow-auto p-4">{parsedJson ? <JsonNode value={parsedJson} isLast={true} /> : <div className="text-slate-500 italic text-sm">{input.length > MAX_HIGHLIGHT_SIZE * 2 ? 'Large JSON: Tree view disabled' : (input.trim() ? t.empty : 'No Data')}</div>}</div>
                    </div>
                </div>
            )}
        </div>
        {showJsonPath && (
            <div className="flex-1 md:flex-[0.6] flex flex-col gap-3 min-w-0 animate-in fade-in slide-in-from-right-4">
                <div className="flex flex-col gap-1.5 shrink-0"><div className="flex items-center gap-2 px-1 h-6"><IconSearch className="w-3 h-3 text-slate-400" /><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.pathTitle}</span></div><input type="text" value={pathQuery} onChange={(e) => setPathQuery(e.target.value)} placeholder="$.store.book[*]" className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 font-mono text-sm focus:ring-2 focus:ring-primary-500 outline-none" /></div>
                <div className="flex-1 flex flex-col gap-1.5 min-h-0"><div className="flex justify-between items-center px-1 h-6"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.resultTitle}</span></div><div className="flex-1 relative bg-slate-900 rounded-xl border border-slate-800 overflow-hidden"><textarea readOnly value={pathResult} className={`absolute inset-0 w-full h-full bg-transparent p-4 font-mono text-xs sm:text-sm resize-none outline-none ${pathResult === t.noMatch ? 'text-slate-500 italic' : 'text-green-400'}`} placeholder="Results..." /></div></div>
            </div>
        )}
      </div>
    </div>
  );
};

export default JsonFormatter;
