
import React, { useState, useEffect } from 'react';
import { IconCopy, IconCheck, IconType, IconZap, IconUndo } from '../Icons';
import { ToolComponentProps } from '../../types';

const TextProcessor: React.FC<ToolComponentProps> = ({ lang, state, onStateChange }) => {
  // Use persistent state if available
  const [input, setInput] = useState(state?.input || '');
  const [extraContent, setExtraContent] = useState(state?.extraContent || '');
  const [quoteType, setQuoteType] = useState(state?.quoteType || '"');
  const [history, setHistory] = useState<string[]>(state?.history || []);
  
  const [copied, setCopied] = useState(false);

  // Sync state back to parent
  useEffect(() => {
    onStateChange?.({ input, extraContent, quoteType, history });
  }, [input, extraContent, quoteType, history, onStateChange]);

  const t = {
    title: lang === 'zh' ? '文本处理增强' : 'Text Processor Plus',
    copy: lang === 'zh' ? '复制' : 'Copy',
    copied: lang === 'zh' ? '已复制' : 'Copied',
    placeholder: lang === 'zh' ? '在此输入或粘贴需要处理的文本...' : 'Enter or paste text to process here...',
    
    unescapeN: lang === 'zh' ? '转义 \\n' : 'Unescape \\n',
    appendPrefix: lang === 'zh' ? '行首添加' : 'Add Prefix',
    appendSuffix: lang === 'zh' ? '行尾添加' : 'Add Suffix',
    extraPh: lang === 'zh' ? '添加内容...' : 'Content to add...',
    clear: lang === 'zh' ? '清空' : 'Clear',
    trimLines: lang === 'zh' ? '修剪空格' : 'Trim Lines',
    undo: lang === 'zh' ? '撤销' : 'Undo',
    wrap: lang === 'zh' ? '包裹' : 'Wrap',
    quoteLabel: lang === 'zh' ? '字符包裹' : 'Line Wrap',
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

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
            <IconType className="w-5 h-5 text-primary-400" />
            <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={handleUndo} 
                disabled={history.length === 0}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded transition-all ${
                    history.length > 0 
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
                    : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                }`}
                title={t.undo}
            >
                <IconUndo className="w-3.5 h-3.5" />
                {t.undo}
            </button>
            <button 
                onClick={handleCopy} 
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 rounded text-slate-300 hover:text-white transition-all"
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
          {/* Action Toolbar - Rebalanced Spans to avoid long inputs */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-11 xl:grid-cols-12 gap-3 items-center">
              <button 
                onClick={handleUnescapeNewlines}
                className="lg:col-span-2 xl:col-span-2 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all"
              >
                <IconZap className="w-3.5 h-3.5 text-yellow-500" />
                {t.unescapeN}
              </button>

              <button 
                onClick={handleTrimLines}
                className="lg:col-span-2 xl:col-span-2 px-3 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all"
              >
                {t.trimLines}
              </button>

              {/* Quote Dropdown - Balanced width */}
              <div className="col-span-2 md:col-span-2 lg:col-span-3 xl:col-span-4 flex gap-1.5">
                  <select 
                    value={quoteType}
                    onChange={(e) => setQuoteType(e.target.value)}
                    className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-primary-500 appearance-none text-center font-mono cursor-pointer"
                  >
                      <option value='"'>" "</option>
                      <option value="'">' '</option>
                      <option value="`">` `</option>
                      <option value="[]">[ ]</option>
                      <option value="{}">{ }</option>
                      <option value="()"> ( ) </option>
                      <option value="<>">&lt; &gt;</option>
                  </select>
                  <button 
                    onClick={handleQuoteLines}
                    className="shrink-0 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all"
                  >
                    {t.wrap}
                  </button>
              </div>

              {/* Consolidated Prefix/Suffix Input - Significantly shortened on large screens */}
              <div className="col-span-2 md:col-span-2 lg:col-span-4 xl:col-span-4 flex gap-1.5">
                  <input 
                    type="text"
                    value={extraContent}
                    onChange={(e) => setExtraContent(e.target.value)}
                    placeholder={t.extraPh}
                    className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <div className="flex gap-1.5 shrink-0">
                    <button 
                      onClick={() => handleAddAtLocation(true)}
                      className="px-3 py-2 text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-all"
                      title={t.appendPrefix}
                    >
                      {lang === 'zh' ? '行首' : 'Pre'}
                    </button>
                    <button 
                      onClick={() => handleAddAtLocation(false)}
                      className="px-3 py-2 text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-all"
                      title={t.appendSuffix}
                    >
                      {lang === 'zh' ? '行尾' : 'Suf'}
                    </button>
                  </div>
              </div>
          </div>

          <div className="flex-1 relative bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                className="absolute inset-0 w-full h-full bg-transparent p-4 font-mono text-sm text-slate-200 resize-none outline-none focus:ring-2 focus:ring-primary-500/20"
                spellCheck="false"
            />
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
