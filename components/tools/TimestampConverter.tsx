import React, { useState, useEffect } from 'react';
import { IconClock, IconCopy, IconCheck } from '../Icons';
import { ToolComponentProps } from '../../types';

const TimestampConverter: React.FC<ToolComponentProps> = ({ lang }) => {
  const [now, setNow] = useState(Date.now());
  const [tsInput, setTsInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [resultDate, setResultDate] = useState('');
  const [resultTs, setResultTs] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const t = {
    current: lang === 'zh' ? '当前时间' : 'Current Time',
    tsToDate: lang === 'zh' ? '时间戳 → 日期' : 'Timestamp → Date',
    dateToTs: lang === 'zh' ? '日期 → 时间戳' : 'Date → Timestamp',
    convert: lang === 'zh' ? '转换' : 'Convert',
    result: lang === 'zh' ? '结果...' : 'Result...',
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTsConvert = () => {
    if (!tsInput) return;
    try {
      let ts = parseInt(tsInput);
      // Guess if seconds (10 digits) or ms (13 digits)
      if (tsInput.length === 10) ts *= 1000;
      
      const date = new Date(ts);
      if (isNaN(date.getTime())) {
        setResultDate('Invalid Timestamp');
      } else {
        setResultDate(date.toLocaleString() + ' (Local)\n' + date.toUTCString());
      }
    } catch {
      setResultDate('Error');
    }
  };

  const handleDateConvert = () => {
    if (!dateInput) return;
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) {
        setResultTs('Invalid Date');
      } else {
        const ts = date.getTime();
        setResultTs(`${Math.floor(ts / 1000)} (Seconds)\n${ts} (Milliseconds)`);
      }
    } catch {
      setResultTs('Error');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <IconClock className="w-8 h-8 text-primary-500" />
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide font-bold">{t.current}</div>
            <div className="text-xl md:text-2xl font-mono text-white font-bold tracking-tight">
              {Math.floor(now / 1000)}
            </div>
          </div>
        </div>
        <div className="text-right mt-2 md:mt-0">
          <div className="text-sm text-slate-300 font-mono">{new Date(now).toLocaleString()}</div>
          <div className="text-xs text-slate-500 font-mono">{new Date(now).toUTCString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timestamp to Date */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2">{t.tsToDate}</h3>
          <div className="flex gap-2">
             <input
               type="number"
               value={tsInput}
               onChange={(e) => setTsInput(e.target.value)}
               placeholder="1678900000"
               className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none font-mono"
             />
             <button onClick={handleTsConvert} className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
               {t.convert}
             </button>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 relative min-h-[80px]">
             {resultDate && (
                 <button 
                   onClick={() => copyToClipboard(resultDate, 'ts-res')} 
                   className="absolute top-2 right-2 text-slate-500 hover:text-primary-400"
                 >
                   {copied === 'ts-res' ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
                 </button>
             )}
             <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{resultDate || t.result}</pre>
          </div>
        </div>

        {/* Date to Timestamp */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2">{t.dateToTs}</h3>
           <div className="flex gap-2">
             <input
               type="text"
               value={dateInput}
               onChange={(e) => setDateInput(e.target.value)}
               placeholder="YYYY-MM-DD HH:mm:ss"
               className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none font-mono"
             />
             <button onClick={handleDateConvert} className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
               {t.convert}
             </button>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 relative min-h-[80px]">
             {resultTs && (
                 <button 
                   onClick={() => copyToClipboard(resultTs, 'date-res')} 
                   className="absolute top-2 right-2 text-slate-500 hover:text-primary-400"
                 >
                   {copied === 'date-res' ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
                 </button>
             )}
             <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{resultTs || t.result}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimestampConverter;