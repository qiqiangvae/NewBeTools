import React, { useState, useEffect, useMemo, useRef } from 'react';
import { IconCopy, IconCheck, IconX, IconSearch, IconJson, IconType, IconPanelLeft, IconEraser, IconSparkles, IconDiff } from '../Icons';
import { ToolComponentProps } from '../../types';

// Access global jsonpath object from CDN
declare const jsonpath: any;

// --- Helper Components ---

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error: boolean;
  placeholder?: string;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, error, placeholder }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // 同步滚动
  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const highlighted = useMemo(() => {
    if (!value) return '';
    // 转义 HTML
    const safeHtml = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // JSON 语法高亮逻辑
    return safeHtml.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'text-amber-400'; // 数字
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-sky-400 font-semibold'; // 键名
          } else {
            cls = 'text-emerald-400'; // 字符串
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-violet-400 font-semibold'; // 布尔
        } else if (/null/.test(match)) {
          cls = 'text-slate-500 italic'; // Null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  }, [value]);

  // 极致精确的共享样式
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
    letterSpacing: '0px',
    fontVariantLigatures: 'none',
    border: 'none',
    outline: 'none',
  };

  return (
    <div className="relative w-full h-full bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <style>{`
        .editor-stack {
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: 1fr;
          width: 100%;
          height: 100%;
        }
        
        .editor-stack textarea, 
        .editor-stack pre {
          grid-area: 1 / 1 / 2 / 2;
          width: 100% !important;
          height: 100% !important;
          overflow-y: scroll !important;
          scrollbar-gutter: stable;
        }

        .editor-stack textarea {
          background: transparent !important;
          color: transparent !important;
          -webkit-text-fill-color: transparent !important;
          caret-color: white !important;
          z-index: 2;
        }

        .editor-stack textarea::selection {
          background: rgba(59, 130, 246, 0.4) !important;
          -webkit-text-fill-color: transparent !important;
        }

        .editor-stack pre {
          z-index: 1;
          background: transparent !important;
          pointer-events: none;
          user-select: none;
        }

        .editor-stack textarea::-webkit-scrollbar,
        .editor-stack pre::-webkit-scrollbar {
          width: 8px;
        }
        .editor-stack textarea::-webkit-scrollbar-thumb,
        .editor-stack pre::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
      `}</style>

      <div className="editor-stack">
        <pre 
          ref={preRef}
          style={sharedStyles}
          className="m-0 text-slate-200"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: highlighted + (value.endsWith('\n') ? ' ' : '') }} 
        />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          spellCheck="false"
          placeholder={placeholder}
          style={sharedStyles}
          className={`resize-none ${error ? 'focus:ring-2 focus:ring-red-500/20' : 'focus:ring-2 focus:ring-primary-500/20'}`}
        />
      </div>
    </div>
  );
};

// --- Tree View Components ---

interface JsonNodeProps {
  name?: string;
  value: any;
  isLast: boolean;
}

const JsonNode: React.FC<JsonNodeProps> = ({ name, value, isLast }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const isEmpty = isObject && Object.keys(value).length === 0;

  if (!isObject) {
    const color = typeof value === 'string' ? 'text-green-400' 
                : typeof value === 'number' ? 'text-blue-400' 
                : typeof value === 'boolean' ? 'text-purple-400' 
                : 'text-slate-400';
    
    return (
      <div className="hover:bg-slate-800/50 px-1 rounded font-mono text-sm leading-6">
        {name && <span className="text-primary-300">"{name}"<span className="text-slate-500">: </span></span>}
        <span className={color}>{JSON.stringify(value)}</span>
        {!isLast && <span className="text-slate-500">,</span>}
      </div>
    );
  }

  const keys = Object.keys(value);
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';

  if (isEmpty) {
     return (
       <div className="hover:bg-slate-800/50 px-1 rounded font-mono text-sm leading-6">
         {name && <span className="text-primary-300">"{name}"<span className="text-slate-500">: </span></span>}
         <span className="text-slate-500">{openBracket}{closeBracket}</span>
         {!isLast && <span className="text-slate-500">,</span>}
       </div>
     );
  }

  return (
    <div className="group font-mono text-sm leading-6">
       <div className="hover:bg-slate-800/50 px-1 rounded flex items-start">
         <button 
            onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }} 
            className="w-4 h-6 flex items-center justify-center text-slate-500 hover:text-slate-300 mr-1 select-none shrink-0"
         >
            <span className="text-[10px] transform transition-transform duration-200" style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▼</span>
         </button>
         
         <div className="flex-1 min-w-0">
            {name && <span className="text-primary-300">"{name}"<span className="text-slate-500">: </span></span>}
            <span className="text-slate-500">{openBracket}</span>
            
            {collapsed ? (
                <>
                  <button onClick={() => setCollapsed(false)} className="text-slate-600 text-xs px-2 hover:text-slate-400 select-none bg-slate-800/50 rounded mx-1">...</button>
                  <span className="text-slate-500">{closeBracket}</span>
                  {!isLast && <span className="text-slate-500">,</span>}
                  <span className="text-slate-600 ml-2 text-xs italic">// {isArray ? `${keys.length} items` : `${keys.length} keys`}</span>
                </>
            ) : (
                <>
                   <div className="pl-4 border-l-2 border-slate-800 ml-1.5 my-0.5">
                        {keys.map((key, idx) => (
                            <JsonNode 
                                key={key} 
                                name={isArray ? undefined : key} 
                                value={value[key]} 
                                isLast={idx === keys.length - 1} 
                            />
                        ))}
                    </div>
                    <span className="text-slate-500">{closeBracket}</span>
                    {!isLast && <span className="text-slate-500">,</span>}
                </>
            )}
         </div>
       </div>
    </div>
  );
};

const JsonFormatter: React.FC<ToolComponentProps> = ({ lang }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorVisible, setErrorVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'text' | 'tree' | 'split'>('text');
  
  const [showJsonPath, setShowJsonPath] = useState(false);
  const [pathQuery, setPathQuery] = useState('$.');
  const [pathResult, setPathResult] = useState('');

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
    empty: lang === 'zh' ? '无效的 JSON - 请在文本模式修复错误。' : 'Invalid JSON - switch to Text mode to fix errors.',
    noMatch: lang === 'zh' ? '无匹配' : 'No match',
  };

  useEffect(() => {
    if (!input.trim()) {
      setError(null);
      setErrorVisible(false);
      return;
    }
    try {
      JSON.parse(input);
      setError(null);
      setErrorVisible(false);
    } catch (e: any) {
      setError(e.message);
      setErrorVisible(true);
    }
  }, [input]);

  useEffect(() => {
    if (errorVisible) {
        const timer = setTimeout(() => setErrorVisible(false), 3000);
        return () => clearTimeout(timer);
    }
  }, [errorVisible]);

  useEffect(() => {
    if (!input.trim() || !pathQuery.trim() || error || typeof jsonpath === 'undefined') {
        setPathResult('');
        return;
    }
    try {
        const jsonData = JSON.parse(input);
        const result = jsonpath.query(jsonData, pathQuery);
        setPathResult(result.length === 0 ? t.noMatch : JSON.stringify(result, null, 2));
    } catch {
        setPathResult('');
    }
  }, [input, pathQuery, error]);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
      setError(null);
      setErrorVisible(false);
    } catch (e: any) {
      setError(e.message);
      setErrorVisible(true);
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
      setError(null);
      setErrorVisible(false);
    } catch (e: any) {
      setError(e.message);
      setErrorVisible(true);
    }
  };

  const escapeJson = () => {
    setInput(JSON.stringify(input));
  };

  const unescapeJson = () => {
      try {
          if (input.startsWith('"') && input.endsWith('"')) {
              setInput(JSON.parse(input));
          } else {
              setInput(input.replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
          }
      } catch(e: any) {
          setError(e.message);
          setErrorVisible(true);
      }
  };
  
  const removeNewlines = () => {
    setInput(input.replace(/\\n/g, ''));
  };

  const fixJson = () => {
    let fixed = input.replace(/\\'/g, "'").replace(/\bNone\b/g, 'null').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/,\s*([\]}])/g, '$1');
    try {
        const parsed = JSON.parse(fixed);
        setInput(JSON.stringify(parsed, null, 2));
        setError(null);
        setErrorVisible(false);
    } catch {
        setInput(fixed);
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parsedJson = useMemo(() => {
      if (!input.trim()) return null;
      try { return JSON.parse(input); } catch { return null; }
  }, [input]);

  const showText = viewMode === 'text' || viewMode === 'split';
  const showTree = viewMode === 'tree' || viewMode === 'split';

  return (
    <div className="flex flex-col gap-4 h-full min-h-[500px]">
      <div className="flex flex-wrap items-center justify-between gap-3 p-1">
        <div className="flex items-center gap-2">
            <IconJson className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-bold text-slate-100">{t.title}</h2>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
            {/* 格式化按钮 */}
            <button 
              onClick={formatJson} 
              className="px-4 py-1.5 text-xs font-bold bg-primary-600 hover:bg-primary-500 rounded text-white transition-colors shadow-md mr-1"
            >
              {t.format}
            </button>

            {/* 视图模式组 */}
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 mr-1">
                <button 
                    onClick={() => setViewMode('text')} 
                    className={`px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${viewMode === 'text' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    title={t.textMode}
                >
                    <IconType className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.textMode}</span>
                </button>
                <button 
                    onClick={() => setViewMode('tree')} 
                    className={`px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${viewMode === 'tree' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    title={t.treeMode}
                >
                    <IconPanelLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.treeMode}</span>
                </button>
                <button 
                    onClick={() => setViewMode('split')} 
                    className={`px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${viewMode === 'split' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    title={t.splitMode}
                >
                    <IconDiff className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.splitMode}</span>
                </button>
            </div>
            
            <button 
                onClick={() => setShowJsonPath(!showJsonPath)} 
                className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors flex items-center gap-2 ${showJsonPath ? 'bg-primary-900/30 border-primary-500/50 text-primary-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
            >
                <IconSearch className="w-3 h-3" /> {t.path}
            </button>
            
            <div className="w-px h-6 bg-slate-700 mx-1 hidden lg:block"></div>
            
            <div className="flex gap-1">
                 <button onClick={escapeJson} className="px-2 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300">{t.esc}</button>
                 <button onClick={unescapeJson} className="px-2 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300">{t.unesc}</button>
                 <button onClick={removeNewlines} className="px-2 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300">{t.rmNewline}</button>
                 <button onClick={fixJson} className="px-2 py-1.5 text-xs font-medium bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300 rounded border border-indigo-900/50 flex items-center gap-1">
                    <IconSparkles className="w-3 h-3" /> {t.fix}
                 </button>
            </div>

            <button onClick={minifyJson} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 transition-colors ml-1">{t.minify}</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        {/* 主要显示区域 */}
        <div className={`flex-1 flex flex-col gap-4 min-w-0 h-full ${viewMode === 'split' ? 'lg:flex-row' : ''}`}>
            
            {/* 文本编辑器 */}
            {showText && (
                <div className="flex-1 flex flex-col gap-2 min-w-0 h-full relative group">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.inputTitle}</span>
                        <button onClick={() => handleCopy(input)} className="text-xs flex items-center gap-1 text-slate-500 hover:text-primary-400 transition-colors">
                            {copied ? <IconCheck className="w-3 h-3"/> : <IconCopy className="w-3 h-3"/>} {t.copy}
                        </button>
                    </div>
                    
                    <div className="flex-1 min-h-0">
                        <JsonEditor value={input} onChange={setInput} error={!!error} placeholder={t.placeholder} />
                    </div>

                    {error && errorVisible && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-md">
                            <div className="bg-red-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                                <IconX className="w-5 h-5 shrink-0" />
                                <span className="flex-1 truncate font-mono text-xs">{error}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 树形视图 */}
            {showTree && (
                <div className="flex-1 flex flex-col gap-2 min-w-0 h-full">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.treeTitle}</span>
                        <span className="text-[10px] text-slate-600 uppercase">Interactive</span>
                    </div>
                    <div className="flex-1 h-full overflow-hidden bg-slate-900/50 rounded-xl border border-slate-700 shadow-inner">
                        <div className="w-full h-full overflow-auto p-4 scrollbar-thin scrollbar-thumb-slate-700">
                            {parsedJson ? <JsonNode value={parsedJson} isLast={true} /> : <div className="text-slate-500 italic text-sm">{input.trim() ? t.empty : (lang === 'zh' ? '空数据' : 'Empty Data')}</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* JSONPath 面板 */}
        {showJsonPath && (
            <div className="flex-1 md:flex-[0.8] lg:flex-[0.6] xl:flex-[0.5] flex flex-col gap-4 min-w-0 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col gap-2 shrink-0">
                    <div className="flex items-center gap-2 px-1">
                        <IconSearch className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.pathTitle}</span>
                    </div>
                    <input type="text" value={pathQuery} onChange={(e) => setPathQuery(e.target.value)} placeholder="$.store.book[*]" className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-3 text-slate-200 font-mono text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div className="flex-1 flex flex-col gap-2 min-h-0">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.resultTitle}</span>
                        <span className="text-xs text-slate-600">{t.readonly}</span>
                    </div>
                    <div className="flex-1 relative bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                        <textarea readOnly value={pathResult} className={`absolute inset-0 w-full h-full bg-transparent p-4 font-mono text-xs sm:text-sm resize-none outline-none ${pathResult === t.noMatch ? 'text-slate-500 italic' : 'text-green-400'}`} placeholder={lang === 'zh' ? '结果将显示在这里...' : "Results will appear here..."} />
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default JsonFormatter;