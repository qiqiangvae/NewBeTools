import React, { useState, useEffect } from 'react';
import { IconCopy, IconCheck } from '../Icons';

const ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

const HashGenerator: React.FC = () => {
  const [input, setInput] = useState('');
  const [hash, setHash] = useState('');
  const [algo, setAlgo] = useState('SHA-256');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generateHash = async () => {
      if (!input) {
        setHash('');
        return;
      }
      try {
        const msgBuffer = new TextEncoder().encode(input);
        const hashBuffer = await crypto.subtle.digest(algo, msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setHash(hashHex);
      } catch (error) {
        console.error("Hashing failed", error);
      }
    };

    generateHash();
  }, [input, algo]);

  const handleCopy = () => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-100">Hash Generator</h2>
        <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Algorithm:</span>
            <select
              value={algo}
              onChange={(e) => setAlgo(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary-500"
            >
              {ALGOS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Input Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to hash..."
            className="w-full h-32 bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
          />
        </div>

        <div>
           <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-slate-400 block">{algo} Output</label>
            <button
                onClick={handleCopy}
                disabled={!hash}
                className="text-xs flex items-center gap-1 text-primary-500 hover:text-primary-400 disabled:opacity-50"
            >
                {copied ? <IconCheck className="w-3 h-3"/> : <IconCopy className="w-3 h-3"/>}
                {copied ? 'Copied' : 'Copy'}
            </button>
           </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 break-all font-mono text-green-400 text-sm min-h-[3rem] flex items-center">
            {hash || <span className="text-slate-600 italic">Result will appear here...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HashGenerator;
