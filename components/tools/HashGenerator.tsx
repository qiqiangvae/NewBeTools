import React, { useState, useEffect } from 'react';
import { IconCopy, IconCheck } from '../Icons';
import { ToolComponentProps } from '../../types';

const ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

const HashGenerator: React.FC<ToolComponentProps> = ({ lang }) => {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});

  useEffect(() => {
    const generateHashes = async () => {
      if (!input) {
        setHashes({});
        return;
      }
      const msgBuffer = new TextEncoder().encode(input);
      const newHashes: Record<string, string> = {};

      await Promise.all(ALGOS.map(async (algo) => {
        try {
            const hashBuffer = await crypto.subtle.digest(algo, msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            newHashes[algo] = hashHex;
        } catch (error) {
            console.error(`Hashing failed for ${algo}`, error);
            newHashes[algo] = 'Error';
        }
      }));
      
      setHashes(newHashes);
    };

    generateHashes();
  }, [input]);

  const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            disabled={!text}
            className="text-slate-500 hover:text-primary-400 p-2 transition-colors disabled:opacity-30"
            title={lang === 'zh' ? '复制' : 'Copy'}
        >
            {copied ? <IconCheck className="w-4 h-4 text-green-500"/> : <IconCopy className="w-4 h-4"/>}
        </button>
    );
  };

  return (
    <div className="flex flex-col gap-6 h-full">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-100">
            {lang === 'zh' ? '哈希生成器' : 'Hash Generator'}
        </h2>
      </div>

      <div className="flex flex-col gap-6">
        {/* Input Section */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-400 font-medium">
              {lang === 'zh' ? '输入文本' : 'Input Text'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={lang === 'zh' ? "输入要计算哈希的文本..." : "Enter text to hash..."}
            className="w-full h-24 bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono text-sm"
          />
        </div>

        {/* Results Section */}
        <div className="flex flex-col gap-4">
           {ALGOS.map(algo => (
               <div key={algo} className="flex flex-col gap-1">
                   <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">{algo}</label>
                   <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden group focus-within:ring-1 focus-within:ring-primary-500/50">
                       <input 
                           readOnly
                           value={hashes[algo] || ''}
                           placeholder="..."
                           className="flex-1 bg-transparent border-none text-slate-200 px-4 py-3 outline-none font-mono text-xs sm:text-sm text-green-400"
                       />
                       <div className="pr-2 bg-slate-900 flex items-center">
                           <CopyButton text={hashes[algo]} />
                       </div>
                   </div>
               </div>
           ))}
           {!input && (
               <div className="text-center py-8 text-slate-600 italic text-sm">
                   {lang === 'zh' ? '输入文本以查看结果' : 'Start typing to see hash results'}
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default HashGenerator;