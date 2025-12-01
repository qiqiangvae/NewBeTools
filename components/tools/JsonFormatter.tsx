import React, { useState, useEffect } from 'react';
import { IconCopy, IconCheck, IconX, IconSearch, IconJson } from '../Icons';

// Access global jsonpath object from CDN
declare const jsonpath: any;

const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // JSONPath State
  const [pathQuery, setPathQuery] = useState('$.');
  const [pathResult, setPathResult] = useState('');
  const [pathError, setPathError] = useState<string | null>(null);

  // Auto-validate syntax
  useEffect(() => {
    if (!input.trim()) {
      setError(null);
      return;
    }
    try {
      JSON.parse(input);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, [input]);

  // Execute JSONPath when input or query changes
  useEffect(() => {
    if (!input.trim() || !pathQuery.trim() || error || typeof jsonpath === 'undefined') {
        setPathResult('');
        return;
    }

    try {
        const jsonData = JSON.parse(input);
        const result = jsonpath.query(jsonData, pathQuery);
        
        if (result === undefined || result.length === 0) {
            setPathResult('No match');
            setPathError(null);
        } else {
            setPathResult(JSON.stringify(result, null, 2));
            setPathError(null);
        }
    } catch (e: any) {
        // Silent fail for path errors while typing, mostly
        // setPathError(e.message); 
        setPathResult('');
    }
  }, [input, pathQuery, error]);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e: any) {
      setError("Invalid JSON: " + e.message);
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
      setError(null);
    } catch (e: any) {
      setError("Invalid JSON: " + e.message);
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    const sample = {
        "store": {
            "book": [
                { "category": "reference", "author": "Nigel Rees", "title": "Sayings of the Century", "price": 8.95 },
                { "category": "fiction", "author": "Evelyn Waugh", "title": "Sword of Honour", "price": 12.99 },
                { "category": "fiction", "author": "Herman Melville", "title": "Moby Dick", "isbn": "0-553-21311-3", "price": 8.99 },
                { "category": "fiction", "author": "J. R. R. Tolkien", "title": "The Lord of the Rings", "isbn": "0-395-19395-8", "price": 22.99 }
            ],
            "bicycle": { "color": "red", "price": 19.95 }
        },
        "expensive": 10
    };
    setInput(JSON.stringify(sample, null, 2));
    setPathQuery('$..book[?(@.price<10)]');
  };

  return (
    <div className="flex flex-col gap-4 h-full min-h-[700px]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-1">
        <div className="flex items-center gap-2">
            <IconJson className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-bold text-slate-100">JSON Editor & Path</h2>
        </div>
        <div className="flex flex-wrap gap-2">
            <button onClick={loadSample} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 transition-colors">Sample</button>
            <button onClick={formatJson} className="px-3 py-1.5 text-xs font-medium bg-primary-600 hover:bg-primary-500 rounded text-white transition-colors">Format</button>
            <button onClick={minifyJson} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 transition-colors">Minify</button>
            <button onClick={() => setInput('')} className="px-3 py-1.5 text-xs font-medium bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded border border-red-900/50 transition-colors">Clear</button>
        </div>
      </div>

      {/* Main Content: Split View */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        
        {/* Left Column: Input */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Input JSON</span>
                <button onClick={() => handleCopy(input)} className="text-xs flex items-center gap-1 text-slate-500 hover:text-primary-400 transition-colors">
                    {copied ? <IconCheck className="w-3 h-3"/> : <IconCopy className="w-3 h-3"/>} Copy
                </button>
            </div>
            <div className="relative flex-1 group">
                <textarea
                    className={`w-full h-full bg-slate-800 text-slate-200 font-mono text-sm p-4 rounded-xl border focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-all ${error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 hover:border-slate-600'}`}
                    placeholder="Paste or type JSON here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    spellCheck="false"
                />
                {error && (
                    <div className="absolute bottom-4 left-4 right-4 bg-red-900/90 text-red-100 px-3 py-2 rounded-lg shadow-lg text-xs flex items-center gap-2 backdrop-blur-sm z-10 animate-in fade-in slide-in-from-bottom-2">
                        <IconX className="w-3 h-3 shrink-0" /> <span className="truncate">{error}</span>
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: JSONPath & Result */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* JSONPath Input Section */}
            <div className="flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-2 px-1">
                    <IconSearch className="w-3 h-3 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">JSONPath Expression</span>
                </div>
                <input 
                    type="text" 
                    value={pathQuery}
                    onChange={(e) => setPathQuery(e.target.value)}
                    placeholder="$.store.book[*]"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-slate-200 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-slate-600"
                />
            </div>

            {/* Result Section */}
            <div className="flex-1 flex flex-col gap-2 min-h-0">
                <div className="flex justify-between items-center px-1">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Extraction Result</span>
                     <span className="text-xs text-slate-600">ReadOnly</span>
                </div>
                <div className="flex-1 relative bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <textarea 
                        readOnly
                        value={pathResult}
                        className={`absolute inset-0 w-full h-full bg-transparent p-4 font-mono text-sm resize-none outline-none ${pathResult === 'No match' ? 'text-slate-500 italic' : 'text-green-400'}`}
                        placeholder="Results will appear here..."
                    />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default JsonFormatter;