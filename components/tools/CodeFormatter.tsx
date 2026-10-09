import React, { useState } from 'react';
import { formatCode } from '../../services/geminiService';
import { IconSparkles, IconCopy, IconCheck } from '../Icons';
import { ToolComponentProps } from '../../types';
import { useCopy } from './shared/useCopy';

const CodeFormatter: React.FC<ToolComponentProps> = ({ lang }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { copied, copy } = useCopy(2000);

  const t = {
    title: lang === 'zh' ? '代码格式化 (AI)' : 'Code Formatter (AI)',
    copy: lang === 'zh' ? '复制' : 'Copy',
    copied: lang === 'zh' ? '已复制' : 'Copied',
    placeholder: lang === 'zh' ? '粘贴代码 (JS, HTML, Python 等) 以格式化...' : 'Paste any code (JS, HTML, Python, etc) here to format...',
    format: lang === 'zh' ? '格式化代码' : 'Format Code',
    failed: lang === 'zh'
      ? '格式化失败：缺少 API Key 或请求出错，代码未改动，请稍后重试。'
      : 'Formatting failed: missing API key or request error. Your code was left unchanged, please try again.',
  };

  const handleFormat = async () => {
      if (!input.trim()) return;
      setLoading(true);
      setError('');
      const res = await formatCode(input);
      if (res === null) {
          setError(t.failed);
      } else {
          setInput(res); // Update input in place like typical formatters
      }
      setLoading(false);
  };

  const copyToClipboard = () => copy(input);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
         <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
         <div className="flex gap-2">
            <button onClick={copyToClipboard} className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded text-slate-300 hover:text-white flex items-center gap-2">
                {copied ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
                {copied ? t.copied : t.copy}
            </button>
         </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 w-full bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono text-sm"
        />
        
        <button 
            onClick={handleFormat}
            disabled={loading || !input}
             className="py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg shadow transition-all disabled:opacity-50 flex justify-center items-center gap-2"
        >
             {loading ? (
                 <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                  <>
                    <IconSparkles className="w-4 h-4" />
                    {t.format}
                  </>
              )}
        </button>

        {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>
    </div>
  );
};

export default CodeFormatter;