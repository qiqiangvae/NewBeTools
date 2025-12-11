import React, { useState, useEffect, useMemo } from 'react';
import { IconCopy, IconCheck, IconX, IconSearch, IconJson, IconType, IconPanelLeft } from '../Icons';

// Access global jsonpath object from CDN
declare const jsonpath: any;

// --- Tree View Components ---

const JsonNode = ({ name, value, isLast }: { name?: string, value: any, isLast: boolean }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const isEmpty = isObject && Object.keys(value).length === 0;

  if (!isObject) {
    // Primitive
    const color = typeof value === 'string' ? 'text-green-400' 
                : typeof value === 'number' ? 'text-blue-400' 
                : typeof value === 'boolean' ? 'text-purple-400' 
                : 'text-slate-400'; // null
    
    return (
      <div className="hover:bg-slate-800/50 px-1 rounded font-mono text-sm leading-6">
        {name && <span className="text-primary-300">"{name}"<span className="text-slate-500">: </span></span>}
        <span className={color}>{JSON.stringify(value)}</span>
        {!isLast && <span className="text-slate-500">,</span>}
      </div>
    );
  }

  // Object / Array
  const keys = Object.keys(value);
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';

  if (isEmpty) {
     return (
       <div className="hover:bg-slate-800/50 px-1 rounded font-mono text-sm leading-6">
         {name && <span className="text-primary-300">"{name}"<span className="text-slate-500">: </span></span>}
         <span className="text-slate-500">{openBracket}{closeBracket}</span>
         {!isLast && <span className="text-slate-500">,</span>}
       </div>
     );
  }

  return (
    <div className="group font-mono text-sm leading-6">
       <div className="hover:bg-slate-800/50 px-1 rounded flex items-start">
         <button 
            onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }} 
            className="w-4 h-6 flex items-center justify-center text-slate-500 hover:text-slate-300 mr-1 select-none shrink-0"
         >
            <span className="text-[10px] transform transition-transform duration-200" style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▼</span>
         </button>
         
         <div className="flex-1 min-w-0">
            {name && <span className="text-primary-300">"{name}"<span className="text-slate-500">: </span></span>}
            <span className="text-slate-500">{openBracket}</span>
            
            {collapsed ? (
                <>
                  <button onClick={() => setCollapsed(false)} className="text-slate-600 text-xs px-2 hover:text-slate-400 select-none bg-slate-800/50 rounded mx-1">...</button>
                  <span className="text-slate-500">{closeBracket}</span>
                  {!isLast && <span className="text-slate-500">,</span>}
                  <span className="text-slate-600 ml-2 text-xs italic">// {isArray ? `${keys.length} items` : `${keys.length} keys`}</span>
                </>
            ) : (
                <>
                   <div className="pl-4 border-l-2 border-slate-800 ml-1.5 my-0.5">
                        {keys.map((key, idx) => (
                            <JsonNode 
                                key={key} 
                                name={isArray ? undefined : key} 
                                value={value[key]} 
                                isLast={idx === keys.length - 1} 
                            />
                        ))}
                    </div>
                    <span className="text-slate-500">{closeBracket}</span>
                    {!isLast && <span className="text-slate-500">,</span>}
                </>
            )}
         </div>
       </div>
    </div>
  );
};

const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'text' | 'tree'>('text');
  
  // JSONPath State
  const [showJsonPath, setShowJsonPath] = useState(false);
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
        setPathResult('');
    }
  }, [input, pathQuery, error]);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
      setError(null);
      setViewMode('text'); // Formatting usually implies checking the source
    } catch (e: any) {
      setError("Invalid JSON: " + e.message);
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
      setError(null);
      setViewMode('text');
    } catch (e: any) {
      setError("Invalid JSON: " + e.message);
    }
  };

  const escapeJson = () => {
    try {
        // Escape the string content
        const escaped = JSON.stringify(input);
        // JSON.stringify adds surrounding quotes, e.g. "foo" -> "\"foo\""
        // Most users want the content with surrounding quotes for pasting into code
        setInput(escaped);
        setViewMode('text');
    } catch(e) {
        // Should not happen for string
    }
  };

  const unescapeJson = () => {
      try {
          // Attempt to parse as JSON string
          if (input.startsWith('"') && input.endsWith('"')) {
              const unescaped = JSON.parse(input);
              setInput(unescaped);
          } else {
              // Manual unescape if not wrapped in quotes or parse fails
              // Replaces \" with " and \\ with \
              const unescaped = input.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
              setInput(unescaped);
          }
          setViewMode('text');
      } catch(e: any) {
          setError("Could not unescape: " + e.message);
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
                { "category": "fiction", "author": "Evelyn Waugh", "title": "Sword of Honour", "price": 12.99 }
            ],
            "bicycle": { "color": "red", "price": 19.95 }
        },
        "expensive": 10
    };
    setInput(JSON.stringify(sample, null, 2));
    setViewMode('tree');
  };

  // Memoize parsed JSON for tree view to avoid re-parsing on every render if input didn't change (though input changes often)
  const parsedJson = useMemo(() => {
      if (!input.trim()) return null;
      try {
          return JSON.parse(input);
      } catch {
          return null;
      }
  }, [input]);

  return (
    <div className="flex flex-col gap-4 h-full min-h-[500px]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1">
        <div className="flex items-center gap-2">
            <IconJson className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-bold text-slate-100">JSON Editor</h2>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
            {/* View Mode Toggles */}
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 mr-2">
                <button
                    onClick={() => setViewMode('text')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${viewMode === 'text' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    title="Text Editor"
                >
                    <IconType className="w-3.5 h-3.5" />
                    Text
                </button>
                <button
                    onClick={() => setViewMode('tree')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${viewMode === 'tree' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    title="Tree Viewer"
                >
                    <IconPanelLeft className="w-3.5 h-3.5" />
                    Tree
                </button>
            </div>

            <button 
                onClick={() => setShowJsonPath(!showJsonPath)} 
                className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors flex items-center gap-2 ${showJsonPath ? 'bg-primary-900/30 border-primary-500/50 text-primary-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
            >
                <IconSearch className="w-3 h-3" />
                Path
            </button>
            
            <div className="w-px h-6 bg-slate-700 mx-1 hidden lg:block"></div>
            
            <div className="flex gap-1">
                 <button onClick={escapeJson} className="px-2 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 transition-colors" title="Escape JSON string">Esc</button>
                 <button onClick={unescapeJson} className="px-2 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 transition-colors" title="Unescape JSON string">UnEsc</button>
            </div>

            <div className="flex gap-1">
                <button onClick={formatJson} className="px-3 py-1.5 text-xs font-medium bg-primary-600 hover:bg-primary-500 rounded text-white transition-colors">Format</button>
                <button onClick={minifyJson} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 transition-colors">Minify</button>
            </div>
            
            <button onClick={() => setInput('')} className="px-3 py-1.5 text-xs font-medium bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded border border-red-900/50 transition-colors">Clear</button>
            <button onClick={loadSample} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 transition-colors">Sample</button>
        </div>
      </div>

      {/* Main Content: Split View */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        
        {/* Left Column: Input / Tree */}
        <div className="flex-1 flex flex-col gap-2 min-w-0 transition-all duration-300 ease-in-out h-full min-h-[400px]">
            <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {viewMode === 'text' ? 'Input JSON' : 'Tree Viewer'}
                </span>
                <button onClick={() => handleCopy(input)} className="text-xs flex items-center gap-1 text-slate-500 hover:text-primary-400 transition-colors">
                    {copied ? <IconCheck className="w-3 h-3"/> : <IconCopy className="w-3 h-3"/>} Copy
                </button>
            </div>
            
            <div className="relative flex-1 group h-full overflow-hidden bg-slate-800 rounded-xl border border-slate-700">
                {viewMode === 'text' ? (
                    <textarea
                        className={`w-full h-full bg-slate-800 text-slate-200 font-mono text-xs sm:text-sm p-4 outline-none resize-none transition-all ${error ? 'focus:ring-2 focus:ring-red-500/50' : 'focus:ring-2 focus:ring-primary-500'}`}
                        placeholder="Paste or type JSON here..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        spellCheck="false"
                    />
                ) : (
                    <div className="w-full h-full overflow-auto p-4 scrollbar-thin scrollbar-thumb-slate-600">
                        {parsedJson ? (
                            <JsonNode value={parsedJson} isLast={true} />
                        ) : (
                            <div className="text-slate-500 italic text-sm">
                                {input.trim() ? "Invalid JSON - switch to Text mode to fix errors." : "Empty JSON"}
                            </div>
                        )}
                    </div>
                )}

                {error && viewMode === 'text' && (
                    <div className="absolute bottom-4 left-4 right-4 bg-red-900/90 text-red-100 px-3 py-2 rounded-lg shadow-lg text-xs flex items-center gap-2 backdrop-blur-sm z-10 animate-in fade-in slide-in-from-bottom-2">
                        <IconX className="w-3 h-3 shrink-0" /> <span className="truncate">{error}</span>
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: JSONPath & Result (Conditional) */}
        {showJsonPath && (
            <div className="flex-1 md:flex-[0.8] lg:flex-1 flex flex-col gap-4 min-w-0 animate-in fade-in slide-in-from-right-4 duration-300 border-l border-slate-700/50 pl-4 md:pl-0 md:border-l-0">
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
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-slate-600"
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
                            className={`absolute inset-0 w-full h-full bg-transparent p-4 font-mono text-xs sm:text-sm resize-none outline-none ${pathResult === 'No match' ? 'text-slate-500 italic' : 'text-green-400'}`}
                            placeholder="Results will appear here..."
                        />
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default JsonFormatter;