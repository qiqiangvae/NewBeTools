import React, { useState } from 'react';
import { IconCopy, IconCheck } from '../Icons';

const StringCaseConverter: React.FC = () => {
  const [input, setInput] = useState('');

  const transform = (text: string, type: string) => {
    if (!text) return '';
    const words = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) || [];
    
    switch (type) {
        case 'camel': 
            return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        case 'pascal': 
            return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        case 'snake': 
            return words.map(w => w.toLowerCase()).join('_');
        case 'kebab': 
            return words.map(w => w.toLowerCase()).join('-');
        case 'constant': 
            return words.map(w => w.toUpperCase()).join('_');
        case 'lower': 
            return text.toLowerCase();
        case 'upper': 
            return text.toUpperCase();
        case 'sentence':
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        default: return text;
    }
  };

  const OutputRow = ({ label, value }: { label: string, value: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        if(!value) return;
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
      <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700">
        <div className="flex flex-col overflow-hidden">
            <span className="text-xs text-slate-500 uppercase font-semibold">{label}</span>
            <span className="text-slate-200 font-mono text-sm truncate pr-4">{value || '...'}</span>
        </div>
        <button onClick={handleCopy} className="text-slate-500 hover:text-primary-400 p-1">
            {copied ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <h2 className="text-xl font-bold text-slate-100">Variable Name Converter</h2>
      
      <div>
        <label className="text-sm text-slate-400 mb-2 block">Input Text</label>
        <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your variable name here (e.g. myVariableName)"
            className="w-full bg-slate-800 text-slate-200 p-4 rounded-xl border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none text-lg font-mono"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <OutputRow label="camelCase" value={transform(input, 'camel')} />
          <OutputRow label="PascalCase" value={transform(input, 'pascal')} />
          <OutputRow label="snake_case" value={transform(input, 'snake')} />
          <OutputRow label="kebab-case" value={transform(input, 'kebab')} />
          <OutputRow label="CONSTANT_CASE" value={transform(input, 'constant')} />
          <OutputRow label="Sentence case" value={transform(input, 'sentence')} />
          <OutputRow label="lowercase" value={transform(input, 'lower')} />
          <OutputRow label="UPPERCASE" value={transform(input, 'upper')} />
      </div>
    </div>
  );
};

export default StringCaseConverter;