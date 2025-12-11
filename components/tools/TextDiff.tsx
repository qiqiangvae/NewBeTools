import React, { useState, useEffect } from 'react';
import { IconCheck, IconCopy } from '../Icons';
import { ToolComponentProps } from '../../types';

// Access global Diff object from jsdiff CDN
declare const Diff: any;

const TextDiff: React.FC<ToolComponentProps> = ({ lang }) => {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [diffResult, setDiffResult] = useState<any[]>([]);

  const t = {
    title: lang === 'zh' ? '文本比对' : 'Text Diff / Compare',
    original: lang === 'zh' ? '原始文本' : 'Original Text',
    new: lang === 'zh' ? '新文本' : 'New Text',
    diff: lang === 'zh' ? '差异对比' : 'Difference Comparison',
    placeholderOrig: lang === 'zh' ? '粘贴原始文本...' : 'Paste original text...',
    placeholderNew: lang === 'zh' ? '粘贴新文本...' : 'Paste new text...',
    empty: lang === 'zh' ? '请在两侧输入文本以进行比对。' : 'Enter text in both panels to compare.',
  };

  useEffect(() => {
    if (typeof Diff !== 'undefined') {
        const diff = Diff.diffLines(left, right);
        setDiffResult(diff);
    }
  }, [left, right]);

  return (
    <div className="h-full flex flex-col gap-4">
      <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
      
      <div className="flex-1 flex flex-col md:flex-row gap-4 h-[600px] md:h-auto overflow-hidden">
        {/* Input Areas */}
        <div className="flex-1 flex flex-col gap-4 min-h-[300px]">
            <div className="flex-1 flex flex-col">
                <label className="text-sm text-slate-400 mb-2">{t.original}</label>
                <textarea
                    value={left}
                    onChange={(e) => setLeft(e.target.value)}
                    className="flex-1 bg-slate-800 text-slate-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono text-xs sm:text-sm"
                    placeholder={t.placeholderOrig}
                />
            </div>
            <div className="flex-1 flex flex-col">
                <label className="text-sm text-slate-400 mb-2">{t.new}</label>
                <textarea
                    value={right}
                    onChange={(e) => setRight(e.target.value)}
                    className="flex-1 bg-slate-800 text-slate-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono text-xs sm:text-sm"
                    placeholder={t.placeholderNew}
                />
            </div>
        </div>

        {/* Diff Output */}
        <div className="flex-1 flex flex-col">
            <label className="text-sm text-slate-400 mb-2">{t.diff}</label>
            <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-auto font-mono text-xs sm:text-sm whitespace-pre-wrap">
                {diffResult.map((part, index) => {
                    let color = 'text-slate-300';
                    let bg = 'bg-transparent';
                    if (part.added) {
                        color = 'text-green-300';
                        bg = 'bg-green-900/30';
                    } else if (part.removed) {
                        color = 'text-red-300';
                        bg = 'bg-red-900/30';
                    }
                    return (
                        <span key={index} className={`${color} ${bg} block w-full px-1`}>
                           {part.value}
                        </span>
                    );
                })}
                {!left && !right && <span className="text-slate-600 italic">{t.empty}</span>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TextDiff;