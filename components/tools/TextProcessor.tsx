
import React, { useState, useEffect, useMemo } from 'react';
import { IconCopy, IconCheck, IconType, IconZap, IconUndo, IconChevronDown, IconMarkdown, IconCode } from '../Icons';
import { ToolComponentProps } from '../../types';

// Access global marked object from CDN
declare const marked: any;

const TextProcessor: React.FC<ToolComponentProps> = ({ lang, state, onStateChange }) => {
  // Use persistent state if available
  const [input, setInput] = useState(state?.input || '');
  const [extraContent, setExtraContent] = useState(state?.extraContent || '');
  const [quoteType, setQuoteType] = useState(state?.quoteType || '"');
  const [history, setHistory] = useState<string[]>(state?.history || []);
  const [isPreview, setIsPreview] = useState(state?.isPreview || false);
  
  const [copied, setCopied] = useState(false);

  // Sync state back to parent
  useEffect(() => {
    onStateChange?.({ input, extraContent, quoteType, history, isPreview });
  }, [input, extraContent, quoteType, history, isPreview, onStateChange]);

  const t = {
    title: lang === 'zh' ? '文本处理增强' : 'Text Processor Plus',
    copy: lang === 'zh' ? '复制' : 'Copy',
    copied: lang === 'zh' ? '已复制' : 'Copied',
    placeholder: lang === 'zh' ? '在此输入或粘贴需要处理的文本...' : 'Enter or paste text to process here...',
    
    unescapeN: lang === 'zh' ? '转义 \\n' : 'Unescape \\n',
    appendPrefix: lang === 'zh' ? '行首' : 'Pre',
    appendSuffix: lang === 'zh' ? '行尾' : 'Suf',
    extraPh: lang === 'zh' ? '添加内容...' : 'Content to add...',
    clear: lang === 'zh' ? '清空' : 'Clear',
    trimLines: lang === 'zh' ? '修剪空格' : 'Trim Lines',
    undo: lang === 'zh' ? '撤销' : 'Undo',
    wrap: lang === 'zh' ? '包裹' : 'Wrap',
    quoteLabel: lang === 'zh' ? '字符包裹' : 'Line Wrap',
    preview: lang === 'zh' ? '预览' : 'Preview',
    editor: lang === 'zh' ? '编辑' : 'Editor',
  };

  const saveToHistory = () => {
    setHistory(prev => [...prev.slice(-49), input]);
  };

  const handleUnescapeNewlines = () => {
    saveToHistory();
    setInput(input.replace(/\\n/g, '\n'));
  };

  const handleQuoteLines = () => {
    saveToHistory();
    let start = quoteType;
    let end = quoteType;
    
    // Handle special pairs
    if (quoteType === '[]') { start = '['; end = ']'; }
    else if (quoteType === '{}') { start = '{'; end = '}'; }
    else if (quoteType === '()') { start = '('; end = ')'; }
    else if (quoteType === '<>') { start = '<'; end = '>'; }

    const lines = input.split('\n');
    const quoted = lines.map(line => `${start}${line}${end}`).join('\n');
    setInput(quoted);
  };

  const handleAddAtLocation = (isPrefix: boolean) => {
    if (!extraContent) return;
    saveToHistory();
    const lines = input.split('\n');
    const processed = lines.map(line => isPrefix ? extraContent + line : line + extraContent).join('\n');
    setInput(processed);
  };

  const handleTrimLines = () => {
    saveToHistory();
    const lines = input.split('\n');
    const trimmed = lines.map(line => line.trim()).join('\n');
    setInput(trimmed);
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

  const handleClear = () => {
    saveToHistory();
    setInput('');
  };

  const renderedMarkdown = useMemo(() => {
    if (!input || !isPreview || typeof marked === 'undefined') return '';
    try {
        // Force breaks on every parse to ensure single newlines work
        return marked.parse(input, { 
          breaks: true,
          gfm: true 
        });
    } catch (e) {
        return 'Error parsing markdown';
    }
  }, [input, isPreview]);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
            <IconType className="w-5 h-5 text-primary-400" />
            <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={() => setIsPreview(!isPreview)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded transition-all shadow-sm ${
                    isPreview 
                    ? 'bg-primary-600 border-primary-500 text-white' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title={isPreview ? t.editor : t.preview}
            >
                {isPreview ? <IconCode className="w-3.5 h-3.5" /> : <IconMarkdown className="w-3.5 h-3.5" />}
                {isPreview ? t.editor : t.preview}
            </button>

            <button 
                onClick={handleUndo} 
                disabled={history.length === 0}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded transition-all ${
                    history.length > 0 
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' 
                    : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                }`}
                title={t.undo}
            >
                <IconUndo className="w-3.5 h-3.5" />
                {t.undo}
            </button>
            <button 
                onClick={handleCopy} 
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-all shadow-sm"
            >
                {copied ? <IconCheck className="w-3.5 h-3.5" /> : <IconCopy className="w-3.5 h-3.5" />}
                {copied ? t.copied : t.copy}
            </button>
            <button 
                onClick={handleClear}
                className="px-3 py-1.5 text-xs font-medium bg-red-900/20 border border-red-900/30 text-red-400 rounded hover:bg-red-900/30 transition-all"
            >
                {t.clear}
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={handleUnescapeNewlines}
                className="flex-none flex items-center justify-center gap-2 px-4 py-2 h-9 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all"
              >
                <IconZap className="w-3.5 h-3.5 text-yellow-500" />
                {t.unescapeN}
              </button>

              <button 
                onClick={handleTrimLines}
                className="flex-none px-4 py-2 h-9 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all"
              >
                {t.trimLines}
              </button>

              <div className="flex-none flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
                  <div className="w-16 relative">
                    <select 
                      value={quoteType}
                      onChange={(e) => setQuoteType(e.target.value)}
                      className="w-full h-7 bg-slate-800 border border-slate-700 rounded pl-2 pr-6 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-primary-500 appearance-none font-mono cursor-pointer"
                    >
                        <option value='"'>" "</option>
                        <option value="'">' '</option>
                        <option value="`">` `</option>
                        <option value="[]">[ ]</option>
                        <option value="{}">{ }</option>
                        <option value="()"> ( ) </option>
                        <option value="<>">&lt; &gt;</option>
                    </select>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <IconChevronDown className="w-3 h-3" />
                    </div>
                  </div>
                  <button 
                    onClick={handleQuoteLines}
                    className="px-3 h-7 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-all whitespace-nowrap"
                  >
                    {t.wrap}
                  </button>
              </div>

              <div className="flex-none w-full sm:w-auto max-w-sm flex items-center gap-1.5 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
                  <input 
                    type="text"
                    value={extraContent}
                    onChange={(e) => setExtraContent(e.target.value)}
                    placeholder={t.extraPh}
                    className="flex-1 min-w-[120px] h-7 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <div className="flex gap-1 shrink-0">
                    <button 
                      onClick={() => handleAddAtLocation(true)}
                      className="px-3 h-7 text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white rounded transition-all whitespace-nowrap"
                    >
                      {t.appendPrefix}
                    </button>
                    <button 
                      onClick={() => handleAddAtLocation(false)}
                      className="px-3 h-7 text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white rounded transition-all whitespace-nowrap"
                    >
                      {t.appendSuffix}
                    </button>
                  </div>
              </div>
          </div>

          <div className="flex-1 relative bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-inner flex flex-col">
            {!isPreview ? (
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.placeholder}
                    className="absolute inset-0 w-full h-full bg-transparent p-4 font-mono text-sm text-slate-200 resize-none outline-none focus:ring-2 focus:ring-primary-500/20"
                    spellCheck="false"
                />
            ) : (
                <div className="absolute inset-0 w-full h-full overflow-auto p-6 md:p-14 bg-slate-950/40">
                    <style>{`
                        .md-preview table { border: 1.5px solid #475569; border-collapse: collapse; width: 100%; margin: 2rem 0; border-radius: 8px; overflow: hidden; }
                        .md-preview th, .md-preview td { border: 1.5px solid #475569; padding: 1rem 1.25rem; }
                        .md-preview th { background-color: #1e293b; color: #f8fafc; font-weight: 700; text-align: left; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
                        .md-preview tr:nth-child(even) { background-color: rgba(30, 41, 59, 0.5); }
                        .md-preview tr:hover { background-color: rgba(51, 65, 85, 0.4); }
                        .md-preview hr { border-color: #334155; margin: 3rem 0; }
                    `}</style>
                    <div 
                        className="md-preview prose prose-invert max-w-none 
                        prose-headings:text-white prose-headings:font-bold prose-headings:mb-6 prose-headings:mt-12
                        prose-h1:text-3xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-4
                        prose-p:text-slate-300 prose-p:leading-8 prose-p:mb-6
                        prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline
                        prose-code:bg-slate-900 prose-code:text-emerald-400 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-[0.9em]
                        prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl prose-pre:shadow-2xl
                        prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:bg-slate-900/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-slate-400
                        prose-strong:text-white prose-strong:font-bold
                        prose-ul:list-disc prose-ol:list-decimal prose-li:text-slate-300 prose-li:mb-3 prose-li:leading-8
                        prose-img:rounded-xl prose-img:shadow-lg"
                        dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
                    />
                    {!input && <div className="text-slate-600 italic text-center mt-20">{lang === 'zh' ? '暂无内容可预览' : 'No content to preview'}</div>}
                </div>
            )}
          </div>
      </div>
      
      <div className="flex items-center gap-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          <div className="flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {lang === 'zh' ? '行数' : 'Lines'}: {input ? input.split('\n').length : 0}
          </div>
          <div className="flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              {lang === 'zh' ? '字符数' : 'Chars'}: {input.length}
          </div>
          <div className="flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {lang === 'zh' ? '历史记录' : 'History'}: {history.length}
          </div>
      </div>
    </div>
  );
};

export default TextProcessor;
