import React, { useState } from 'react';
import { convertToPinyin } from '../../services/geminiService';
import { IconSparkles, IconCopy, IconCheck } from '../Icons';
import { ToolComponentProps } from '../../types';

const PinyinConverter: React.FC<ToolComponentProps> = ({ lang }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const t = {
    title: lang === 'zh' ? '汉字转拼音' : 'Chinese to Pinyin',
    input: lang === 'zh' ? '中文文本' : 'Chinese Text',
    convert: lang === 'zh' ? '转为拼音' : 'Convert to Pinyin',
    output: lang === 'zh' ? '拼音结果' : 'Pinyin Output',
    copy: lang === 'zh' ? '复制' : 'Copy',
    copied: lang === 'zh' ? '已复制' : 'Copied',
    ph: lang === 'zh' ? '输入中文...' : 'Enter Chinese text...',
    res: lang === 'zh' ? '结果将显示在这里...' : 'Result will appear here...',
  };

  const handleConvert = async () => {
      if (!input.trim()) return;
      setLoading(true);
      const res = await convertToPinyin(input);
      setOutput(res);
      setLoading(false);
  };

  const copyToClipboard = () => {
      if (!output) return;
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
         <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
      </div>

      <div className="flex flex-col gap-4 flex-1">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm text-slate-400">{t.input}</label>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.ph}
                className="w-full h-32 bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none text-lg"
            />
          </div>

          <button 
             onClick={handleConvert}
             disabled={loading || !input}
             className="w-full py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-medium rounded-lg shadow transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
              {loading ? (
                 <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                  <>
                    <IconSparkles className="w-4 h-4" />
                    {t.convert}
                  </>
              )}
          </button>

          <div className="flex-1 flex flex-col gap-2 relative">
             <div className="flex justify-between items-center">
                 <label className="text-sm text-slate-400">{t.output}</label>
                 {output && (
                    <button onClick={copyToClipboard} className="text-primary-500 text-xs flex items-center gap-1">
                        {copied ? <IconCheck className="w-3 h-3" /> : <IconCopy className="w-3 h-3" />}
                        {copied ? t.copied : t.copy}
                    </button>
                 )}
             </div>
             <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-6 overflow-auto text-lg text-green-400 font-medium leading-relaxed">
                {output || <span className="text-slate-600 italic">{t.res}</span>}
             </div>
          </div>
      </div>
    </div>
  );
};

export default PinyinConverter;