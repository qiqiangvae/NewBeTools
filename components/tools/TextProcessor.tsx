
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { IconCopy, IconCheck, IconType, IconZap, IconUndo, IconChevronDown, IconMarkdown, IconCode } from '../Icons';
import { ToolComponentProps } from '../../types';

// Access global marked and hljs objects from CDN
declare const marked: any;
declare const hljs: any;

const TextProcessor: React.FC<ToolComponentProps> = ({ lang, state, onStateChange }) => {
  const [input, setInput] = useState(state?.input || '');
  const [debouncedInput, setDebouncedInput] = useState(state?.input || '');
  const [extraContent, setExtraContent] = useState(state?.extraContent || '');
  const [quoteType, setQuoteType] = useState(state?.quoteType || '"');
  const [history, setHistory] = useState<string[]>(state?.history || []);
  const [viewMode, setViewMode] = useState<'editor' | 'split' | 'preview'>(
    state?.viewMode || 'split'
  );
  const [copied, setCopied] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);
  // Track the last state sent to parent to avoid infinite loop
  const lastReportedState = useRef<string>('');

  // Debounce Markdown Input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(input);
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  // Sync state back to parent ONLY when it truly changes
  useEffect(() => {
    const nextState = { 
      input, 
      extraContent, 
      quoteType, 
      history, 
      viewMode,
      isPreview: viewMode !== 'editor'
    };
    const stateStr = JSON.stringify(nextState);
    
    if (lastReportedState.current !== stateStr) {
        lastReportedState.current = stateStr;
        onStateChange?.(nextState);
    }
  }, [input, extraContent, quoteType, history, viewMode, onStateChange]);

  const t = {
    title: lang === 'zh' ? '文本处理增强' : 'Text Processor Plus',
    copy: lang === 'zh' ? '复制' : 'Copy',
    copied: lang === 'zh' ? '已复制' : 'Copied',
    placeholder: lang === 'zh' ? '在此输入或粘贴需要处理的文本...' : 'Enter or paste text to process here...',
    unescapeN: lang === 'zh' ? '转义 \\n' : 'Unescape \\n',
    unescapeQ: lang === 'zh' ? '去除 \\"' : 'Unescape \\"',
    appendPrefix: lang === 'zh' ? '行首' : 'Pre',
    appendSuffix: lang === 'zh' ? '行尾' : 'Suf',
    extraPh: lang === 'zh' ? '添加内容...' : 'Content to add...',
    clear: lang === 'zh' ? '清空' : 'Clear',
    trimLines: lang === 'zh' ? '修剪空格' : 'Trim Lines',
    undo: lang === 'zh' ? '撤销' : 'Undo',
    wrap: lang === 'zh' ? '包裹' : 'Wrap',
    editor: lang === 'zh' ? '仅编辑' : 'Editor',
    split: lang === 'zh' ? '分屏对照' : 'Split View',
    preview: lang === 'zh' ? '仅预览' : 'Preview',
  };

  const saveToHistory = () => {
    setHistory(prev => [...prev.slice(-19), input]);
  };

  const handleUnescapeNewlines = () => {
    saveToHistory();
    setInput(input.replace(/\\n/g, '\n'));
  };

  const handleUnescapeQuotes = () => {
    saveToHistory();
    setInput(input.replace(/\\"/g, '"'));
  };

  const handleQuoteLines = () => {
    saveToHistory();
    let start = quoteType, end = quoteType;
    if (quoteType === '[]') { start = '['; end = ']'; }
    else if (quoteType === '{}') { start = '{'; end = '}'; }
    else if (quoteType === '()') { start = '('; end = ')'; }
    else if (quoteType === '<>') { start = '<'; end = '>'; }
    const quoted = input.split('\n').map(line => `${start}${line}${end}`).join('\n');
    setInput(quoted);
  };

  const handleAddAtLocation = (isPrefix: boolean) => {
    if (!extraContent) return;
    saveToHistory();
    const processed = input.split('\n').map(line => isPrefix ? extraContent + line : line + extraContent).join('\n');
    setInput(processed);
  };

  const handleTrimLines = () => {
    saveToHistory();
    setInput(input.split('\n').map(line => line.trim()).join('\n'));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setInput(previous);
  };

  const handleCopy = () => {
    if (!input) return;
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderedMarkdown = useMemo(() => {
    if (!debouncedInput || typeof marked === 'undefined') return '';
    try {
        return marked.parse(debouncedInput, { breaks: true, gfm: true });
    } catch (e) {
        return 'Error parsing markdown';
    }
  }, [debouncedInput]);

  // Apply syntax highlighting
  useEffect(() => {
    if (viewMode !== 'editor' && previewRef.current && typeof hljs !== 'undefined') {
      try {
        previewRef.current.querySelectorAll('pre code').forEach((block: any) => {
          hljs.highlightElement(block);
        });
      } catch (e) {
        console.error("Syntax highlighting error:", e);
      }
    }
  }, [renderedMarkdown, viewMode]);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-1">
        <div className="flex flex-wrap items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
                <IconType className="w-5 h-5 text-primary-400" />
                <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
            </div>
            
            <div className="bg-slate-800/80 p-0.5 rounded-lg flex border border-slate-700 shadow-inner">
                <button
                    onClick={() => setViewMode('editor')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                        viewMode === 'editor' 
                        ? 'bg-primary-600 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={t.editor}
                >
                    <IconCode className="w-3.5 h-3.5" />
                    <span>{t.editor}</span>
                </button>
                <button
                    onClick={() => setViewMode('split')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                        viewMode === 'split' 
                        ? 'bg-primary-600 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={t.split}
                >
                    <div className="flex gap-0.5 items-center">
                        <span className="w-1 h-3 bg-current opacity-40 rounded-sm"></span>
                        <span className="w-1 h-3 bg-current opacity-100 rounded-sm"></span>
                    </div>
                    <span>{t.split}</span>
                </button>
                <button
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                        viewMode === 'preview' 
                        ? 'bg-primary-600 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={t.preview}
                >
                    <IconMarkdown className="w-3.5 h-3.5" />
                    <span>{t.preview}</span>
                </button>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={handleUndo} disabled={history.length === 0} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded transition-all ${history.length > 0 ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'}`}>
                <IconUndo className="w-3.5 h-3.5" /> {t.undo}
            </button>
            <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-all shadow-sm">
                {copied ? <IconCheck className="w-3.5 h-3.5" /> : <IconCopy className="w-3.5 h-3.5" />}
                {copied ? t.copied : t.copy}
            </button>
            <button onClick={() => { saveToHistory(); setInput(''); }} className="px-3 py-1.5 text-xs font-medium bg-red-900/20 border border-red-900/30 text-red-400 rounded hover:bg-red-900/30 transition-all">
                {t.clear}
            </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex flex-wrap items-center gap-3">
              <button onClick={handleUnescapeNewlines} className="flex-none flex items-center justify-center gap-2 px-4 py-2 h-9 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all"><IconZap className="w-3.5 h-3.5 text-yellow-500" /> {t.unescapeN}</button>
              <button onClick={handleUnescapeQuotes} className="flex-none flex items-center justify-center gap-2 px-4 py-2 h-9 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all"><IconZap className="w-3.5 h-3.5 text-blue-500" /> {t.unescapeQ}</button>
              <button onClick={handleTrimLines} className="flex-none px-4 py-2 h-9 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all">{t.trimLines}</button>
              <div className="flex-none flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
                  <div className="w-16 relative">
                    <select value={quoteType} onChange={(e) => setQuoteType(e.target.value)} className="w-full h-7 bg-slate-800 border border-slate-700 rounded pl-2 pr-6 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-primary-500 opts appearance-none font-mono cursor-pointer">
                        <option value='"'>" "</option>
                        <option value="'">' '</option>
                        <option value="`">` `</option>
                        <option value="[]">[ ]</option>
                        <option value="{}">{"{ }"}</option>
                        <option value="()">{"( )"}</option>
                        <option value="<>">&lt; &gt;</option>
                    </select>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><IconChevronDown className="w-3 h-3" /></div>
                  </div>
                  <button onClick={handleQuoteLines} className="px-3 h-7 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-all whitespace-nowrap">{t.wrap}</button>
              </div>
              <div className="flex-none w-full sm:w-auto max-w-sm flex items-center gap-1.5 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
                  <input type="text" value={extraContent} onChange={(e) => setExtraContent(e.target.value)} placeholder={t.extraPh} className="flex-1 min-w-[120px] h-7 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-primary-500" />
                  <button onClick={() => handleAddAtLocation(true)} className="px-3 h-7 text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white rounded transition-all">{t.appendPrefix}</button>
                  <button onClick={() => handleAddAtLocation(false)} className="px-3 h-7 text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white rounded transition-all">{t.appendSuffix}</button>
              </div>
          </div>
          <div className="flex-1 relative bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-inner flex flex-col min-h-0">
            <div className={`absolute inset-0 w-full h-full grid ${
              viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-700' : 'grid-cols-1'
            }`}>
              
              {/* EDITOR COLUMN */}
              {(viewMode === 'editor' || viewMode === 'split') && (
                <div className="relative h-full flex flex-col bg-slate-800/10">
                  <textarea 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder={t.placeholder} 
                    className="w-full h-full bg-transparent p-4 font-mono text-sm text-slate-200 resize-none outline-none focus:ring-2 focus:ring-primary-500/10" 
                    spellCheck="false" 
                  />
                  {viewMode === 'split' && (
                    <div className="absolute bottom-3 right-3 bg-slate-950/80 border border-slate-800 text-slate-500 px-2 py-0.5 text-[10px] font-mono rounded select-none uppercase tracking-wider">
                      {lang === 'zh' ? '编辑器' : 'Editor'}
                    </div>
                  )}
                </div>
              )}

              {/* PREVIEW COLUMN */}
              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className="relative h-full overflow-auto bg-[#0d1117] p-6 md:p-8 flex flex-col" ref={previewRef}>
                  <div className="markdown-body max-w-none !bg-transparent flex-1" dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />
                  {!input && (
                    <div className="text-slate-500 italic text-center my-auto flex flex-col items-center justify-center gap-2 py-10">
                      <IconMarkdown className="w-8 h-8 opacity-30 text-slate-400" />
                      <span>{lang === 'zh' ? '暂无内容可预览' : 'No content to preview'}</span>
                    </div>
                  )}
                  {viewMode === 'split' && (
                    <div className="absolute bottom-3 right-3 bg-slate-950/80 border border-slate-800 text-slate-500 px-2 py-0.5 text-[10px] font-mono rounded select-none uppercase tracking-wider">
                      {lang === 'zh' ? 'GitHub 预览' : 'GitHub Dark Preview'}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          <div className="flex gap-1.5 items-center"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{lang === 'zh' ? '行数' : 'Lines'}: {input ? input.split('\n').length : 0}</div>
          <div className="flex gap-1.5 items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{lang === 'zh' ? '字符数' : 'Chars'}: {input.length}</div>
          <div className="flex gap-1.5 items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>{lang === 'zh' ? '历史' : 'History'}: {history.length}/20</div>
      </div>
    </div>
  );
};

export default TextProcessor;

