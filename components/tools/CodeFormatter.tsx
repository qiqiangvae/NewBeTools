import React, { useState } from 'react';
import { formatCode } from '../../services/geminiService';
import { IconSparkles, IconCopy, IconCheck } from '../Icons';

const CodeFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFormat = async () => {
      if (!input.trim()) return;
      setLoading(true);
      const res = await formatCode(input);
      setInput(res); // Update input in place like typical formatters
      setLoading(false);
  };

  const copyToClipboard = () => {
      if (!input) return;
      navigator.clipboard.writeText(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
         <h2 className="text-xl font-bold text-slate-100">Code Formatter (AI)</h2>
         <div className="flex gap-2">
            <button onClick={copyToClipboard} className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded text-slate-300 hover:text-white flex items-center gap-2">
                {copied ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
                Copy
            </button>
         </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste any code (JS, HTML, Python, etc) here to format..."
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
                    Format Code
                  </>
              )}
        </button>
      </div>
    </div>
  );
};

export default CodeFormatter;