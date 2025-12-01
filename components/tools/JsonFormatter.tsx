import React, { useState, useEffect } from 'react';
import { IconCopy, IconCheck, IconX } from '../Icons';

const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setOutput('');
    }
  }, [input]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    setInput('{"name":"DevTool Hub","features":["JSON","Base64","AI"],"active":true,"meta":{"version":1.0}}');
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-100">JSON Formatter & Validator</h2>
        <div className="flex gap-2">
            <button onClick={loadSample} className="px-3 py-1 text-sm bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 transition-colors">Load Sample</button>
            <button onClick={() => setInput('')} className="px-3 py-1 text-sm bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 transition-colors">Clear</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-[700px]">
        <div className="flex-1 flex flex-col">
           <label className="text-sm text-slate-400 mb-2">Input JSON</label>
           <textarea
             className={`flex-1 w-full bg-slate-800 text-slate-200 font-mono text-sm p-4 rounded-lg border focus:ring-2 focus:ring-primary-500 outline-none resize-none ${error ? 'border-red-500' : 'border-slate-700'}`}
             placeholder="Paste your JSON here..."
             value={input}
             onChange={(e) => setInput(e.target.value)}
           />
           {error && (
             <div className="mt-2 text-red-400 text-sm flex items-center gap-2">
                <IconX className="w-4 h-4" />
                <span>{error}</span>
             </div>
           )}
        </div>

        <div className="flex-1 flex flex-col relative">
           <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-slate-400">Formatted Output</label>
              {output && (
                <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-400">
                    {copied ? <IconCheck className="w-3 h-3" /> : <IconCopy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
              )}
           </div>
           <textarea
             readOnly
             className="flex-1 w-full bg-slate-900 text-green-400 font-mono text-sm p-4 rounded-lg border border-slate-700 outline-none resize-none"
             placeholder="Formatted result will appear here..."
             value={output}
           />
        </div>
      </div>
    </div>
  );
};

export default JsonFormatter;