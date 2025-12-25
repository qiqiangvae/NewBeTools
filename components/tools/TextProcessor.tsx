
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { IconCopy, IconCheck, IconType, IconZap, IconUndo, IconChevronDown, IconMarkdown, IconCode } from '../Icons';
import { ToolComponentProps } from '../../types';

// Access global marked object from CDN
declare const marked: any;

const TextProcessor: React.FC<ToolComponentProps> = ({ lang, state, onStateChange }) => {
  const [input, setInput] = useState(state?.input || '');
  const [debouncedInput, setDebouncedInput] = useState(state?.input || '');
  const [extraContent, setExtraContent] = useState(state?.extraContent || '');
  const [quoteType, setQuoteType] = useState(state?.quoteType || '"');
  const [history, setHistory] = useState<string[]>(state?.history || []);
  const [isPreview, setIsPreview] = useState(state?.isPreview || false);
  const [copied, setCopied] = useState(false);
  
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
    const nextState = { input, extraContent, quoteType, history, isPreview };
    const stateStr = JSON.stringify(nextState);
    
    if (lastReportedState.current !== stateStr) {
        lastReportedState.current = stateStr;
        onStateChange?.(nextState);
    }
  }, [input, extraContent, quoteType, history, isPreview, onStateChange]);

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
    preview: lang === 'zh' ? '预览' : 'Preview',
    editor: lang === 'zh' ? '编辑' : 'Editor',
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
    if (!debouncedInput || !isPreview || typeof marked === 'undefined') return '';
    try {
        return marked.parse(debouncedInput, { breaks: true, gfm: true });
    } catch (e) {
        return 'Error parsing markdown';
    }
  }, [debouncedInput, isPreview]);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
            <IconType className="w-5 h-5 text-primary-400" />
            <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setIsPreview(!isPreview)} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded transition-all shadow-sm ${isPreview ? 'bg-primary-600 border-primary-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'}`}>
                {isPreview ? <IconCode className="w-3.5 h-3.5" /> : <IconMarkdown className="w-3.5 h-3.5" />}
                {isPreview ? t.editor : t.preview}
            </button>
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
                    <select value={quoteType} onChange={(e) => setQuoteType(e.target.value)} className="w-full h-7 bg-slate-800 border border-slate-700 rounded pl-2 pr-6 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-primary-500 appearance-none font-mono cursor-pointer">
                        <option value='"'>" "</option><option value="'">' '</option><option value="`">` `</option><option value="[]">[ ]</option><option value="{}">{ }</option><option value="()"> ( ) </option><option value="<>">&lt; &gt;</option>
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
          <div className="flex-1 relative bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-inner flex flex-col">
            {!isPreview ? (
                <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.placeholder} className="absolute inset-0 w-full h-full bg-transparent p-4 font-mono text-sm text-slate-200 resize-none outline-none focus:ring-2 focus:ring-primary-500/20" spellCheck="false" />
            ) : (
                <div className="absolute inset-0 w-full h-full overflow-auto p-6 md:p-8 bg-slate-950/40">
                    <style>{`
                        .md-preview h1 { font-size: 2.25rem !important; font-weight: 800 !important; color: white !important; margin-top: 2rem !important; margin-bottom: 1.5rem !important; border-bottom: 2px solid #334155 !important; padding-bottom: 0.75rem !important; }
                        .md-preview h2 { font-size: 1.5rem !important; font-weight: 700 !important; color: white !important; margin-top: 2rem !important; margin-bottom: 1rem !important; border-bottom: 1px solid #1e293b !important; padding-bottom: 0.5rem !important; }
                        .md-preview p { color: #cbd5e1 !important; line-height: 1.75 !important; margin-bottom: 1rem !important; }
                    `}</style>
                    <div className="md-preview prose prose-invert max-w-none prose-p:text-slate-300 prose-p:leading-7 prose-p:mb-4 prose-a:text-primary-400 prose-code:bg-slate-900 prose-code:text-emerald-400 prose-code:px-1.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800" dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />
                    {!input && <div className="text-slate-600 italic text-center mt-20">{lang === 'zh' ? '暂无内容可预览' : 'No content to preview'}</div>}
                </div>
            )}
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
