
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
                <div className="absolute inset-0 w-full h-full overflow-auto p-6 md:p-8 bg-slate-950/40">
                    <style>{`
                        .md-preview h1 { font-size: 2.25rem !important; line-height: 2.5rem !important; font-weight: 800 !important; color: white !important; margin-top: 2rem !important; margin-bottom: 1.5rem !important; border-bottom: 2px solid #334155 !important; padding-bottom: 0.75rem !important; }
                        .md-preview h2 { font-size: 1.5rem !important; line-height: 2rem !important; font-weight: 700 !important; color: white !important; margin-top: 2rem !important; margin-bottom: 1rem !important; border-bottom: 1px solid #1e293b !important; padding-bottom: 0.5rem !important; }
                        .md-preview h3 { font-size: 1.25rem !important; line-height: 1.75rem !important; font-weight: 700 !important; color: #f1f5f9 !important; margin-top: 1.5rem !important; margin-bottom: 0.75rem !important; }
                        .md-preview h4 { font-size: 1.125rem !important; line-height: 1.5rem !important; font-weight: 700 !important; color: #e2e8f0 !important; margin-top: 1.25rem !important; margin-bottom: 0.5rem !important; }
                        
                        .md-preview table { border: 1px solid #475569 !important; border-collapse: collapse !important; width: 100% !important; margin: 1.5rem 0 !important; border-radius: 4px !important; overflow: hidden !important; }
                        .md-preview th, .md-preview td { border: 1px solid #475569 !important; padding: 0.6rem 1rem !important; }
                        .md-preview th { background-color: #1e293b !important; color: #f8fafc !important; font-weight: 700 !important; text-align: left !important; }
                        .md-preview tr:nth-child(even) { background-color: rgba(30, 41, 59, 0.4) !important; }
                        .md-preview hr { border-color: #334155 !important; margin: 2rem 0 !important; }
                    `}</style>
                    <div 
                        className="md-preview prose prose-invert max-w-none 
                        prose-p:text-slate-300 prose-p:leading-7 prose-p:mb-4
                        prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline
                        prose-code:bg-slate-900 prose-code:text-emerald-400 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-[0.9em]
                        prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-lg prose-pre:shadow-xl
                        prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:bg-slate-900/30 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-slate-400
                        prose-strong:text-white prose-strong:font-bold
                        prose-ul:list-disc prose-ol:list-decimal prose-li:text-slate-300 prose-li:mb-2 prose-li:leading-7
                        prose-img:rounded-lg prose-img:shadow-md"
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
