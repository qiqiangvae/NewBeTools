import React, { useState } from 'react';
import { IconCopy, IconCheck, IconRefresh } from '../Icons';
import { ToolComponentProps } from '../../types';

const UuidGenerator: React.FC<ToolComponentProps> = ({ lang }) => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [hyphens, setHyphens] = useState(true);
  const [uppercase, setUppercase] = useState(false);
  const [copied, setCopied] = useState(false);

  const t = {
    title: lang === 'zh' ? 'UUID 生成器' : 'UUID Generator',
    count: lang === 'zh' ? '数量' : 'Quantity',
    hyphens: lang === 'zh' ? '连字符 (-)' : 'Hyphens (-)',
    uppercase: lang === 'zh' ? '大写' : 'Uppercase',
    generate: lang === 'zh' ? '生成 UUID' : 'Generate UUIDs',
    copy: lang === 'zh' ? '复制全部' : 'Copy All',
    copied: lang === 'zh' ? '已复制' : 'Copied',
  };

  const generateUuidV4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleGenerate = () => {
    const arr = [];
    const limit = Math.min(Math.max(count, 1), 100);
    for (let i = 0; i < limit; i++) {
        let uuid = generateUuidV4();
        if (!hyphens) uuid = uuid.replace(/-/g, '');
        if (uppercase) uuid = uuid.toUpperCase();
        arr.push(uuid);
    }
    setUuids(arr);
  };

  // Generate on mount
  React.useEffect(() => {
    handleGenerate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-generate if formatting options change
  React.useEffect(() => {
      handleGenerate();
  }, [hyphens, uppercase]);

  const copyToClipboard = () => {
      if (uuids.length === 0) return;
      navigator.clipboard.writeText(uuids.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const copySingle = (uuid: string) => {
      navigator.clipboard.writeText(uuid);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
        <div className="flex flex-wrap items-center gap-4 bg-slate-800 p-2 rounded-lg border border-slate-700">
             <div className="flex items-center gap-2 px-2">
                 <label className="text-sm text-slate-400">{t.count}</label>
                 <input 
                    type="number" 
                    min="1" 
                    max="100" 
                    value={count} 
                    onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                    className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 outline-none text-center"
                 />
             </div>
             <label className="flex items-center gap-2 cursor-pointer select-none px-2 text-sm text-slate-300">
                 <input type="checkbox" checked={hyphens} onChange={(e) => setHyphens(e.target.checked)} className="rounded bg-slate-900 border-slate-600 text-primary-600 focus:ring-primary-500" />
                 {t.hyphens}
             </label>
             <label className="flex items-center gap-2 cursor-pointer select-none px-2 text-sm text-slate-300">
                 <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="rounded bg-slate-900 border-slate-600 text-primary-600 focus:ring-primary-500" />
                 {t.uppercase}
             </label>
             <button 
                onClick={handleGenerate}
                className="bg-primary-600 hover:bg-primary-500 text-white p-2 rounded-md transition-colors"
                title={t.generate}
             >
                 <IconRefresh className="w-4 h-4" />
             </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-3 bg-slate-800 border-b border-slate-700">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">Results ({uuids.length})</span>
              <button 
                onClick={copyToClipboard} 
                className="text-xs flex items-center gap-1.5 text-primary-400 hover:text-primary-300 transition-colors px-2 py-1 rounded hover:bg-slate-700"
              >
                 {copied ? <IconCheck className="w-3.5 h-3.5" /> : <IconCopy className="w-3.5 h-3.5" />}
                 {copied ? t.copied : t.copy}
              </button>
          </div>
          <div className="flex-1 overflow-auto p-2 scrollbar-thin scrollbar-thumb-slate-600">
              <ul className="flex flex-col gap-1">
                  {uuids.map((uuid, i) => (
                      <li key={i} className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-700">
                          <span className="font-mono text-slate-300 text-sm sm:text-base break-all">{uuid}</span>
                          <button 
                            onClick={() => { copySingle(uuid); }}
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-all p-1.5 rounded-md hover:bg-slate-600"
                            title="Copy"
                          >
                              <IconCopy className="w-4 h-4" />
                          </button>
                      </li>
                  ))}
              </ul>
          </div>
      </div>
    </div>
  );
};

export default UuidGenerator;