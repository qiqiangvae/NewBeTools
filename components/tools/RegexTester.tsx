import React, { useState, useEffect } from 'react';
import { generateRegex } from '../../services/geminiService';
import { IconSparkles } from '../Icons';

const COMMON_REGEXES = [
    { name: 'Email', regex: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'gm' },
    { name: 'URL', regex: 'https?:\\/\\/[\\w\\-\\.]+(?::\\d+)?(?:\\/.*)?', flags: 'gm' },
    { name: 'IPv4', regex: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'gm' },
    { name: 'Date (ISO)', regex: '\\d{4}-\\d{2}-\\d{2}', flags: 'gm' },
    { name: 'Hex Color', regex: '#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})', flags: 'gm' },
    { name: 'Password (Strong)', regex: '(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)[A-Za-z\\d]{8,}', flags: 'gm' },
    { name: 'Slug', regex: '^[a-z0-9]+(?:-[a-z0-9]+)*$', flags: 'gm' },
    { name: 'Chinese Phone', regex: '1[3-9]\\d{9}', flags: 'gm' },
    { name: 'ID Card (CN)', regex: '\\d{17}[\\dXx]', flags: 'gm' },
];

const RegexTester: React.FC = () => {
  const [regexStr, setRegexStr] = useState('');
  const [flags, setFlags] = useState('gm');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!regexStr) {
        setMatches([]);
        setError(null);
        return;
    }
    try {
        const regex = new RegExp(regexStr, flags);
        const newMatches = [];
        let match;
        
        // Prevent infinite loops with global flag or empty matches
        if (!flags.includes('g')) {
             match = regex.exec(testString);
             if (match) newMatches.push(match);
        } else {
            let i = 0;
            // Limit iterations to prevent browser freeze on bad regex
            while ((match = regex.exec(testString)) !== null && i < 2000) {
                newMatches.push(match);
                if (match.index === regex.lastIndex) regex.lastIndex++; // Avoid infinite loop for zero-width matches
                i++;
            }
        }
        setMatches(newMatches);
        setError(null);
    } catch (e: any) {
        setError(e.message);
        setMatches([]);
    }
  }, [regexStr, flags, testString]);

  const handleAiGenerate = async () => {
      const userPrompt = window.prompt("Describe what you want to match:");
      if (!userPrompt) return;
      setIsGenerating(true);
      const res = await generateRegex(userPrompt);
      // Try to extract regex part if it returns slashes
      const clean = res.replace(/^\/|\/[a-z]*$/g, ''); 
      setRegexStr(clean);
      setIsGenerating(false);
  };

  const loadPreset = (preset: typeof COMMON_REGEXES[0]) => {
      setRegexStr(preset.regex);
      setFlags(preset.flags);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center flex-wrap gap-4">
         <h2 className="text-xl font-bold text-slate-100">Regex Tester</h2>
         <button onClick={handleAiGenerate} className="flex items-center gap-2 text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors shadow">
            <IconSparkles className="w-4 h-4" />
            {isGenerating ? 'Thinking...' : 'AI Generate'}
         </button>
      </div>

      {/* Common Presets */}
      <div className="flex flex-wrap gap-2">
          {COMMON_REGEXES.map(p => (
              <button 
                key={p.name} 
                onClick={() => loadPreset(p)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded text-xs transition-colors"
              >
                  {p.name}
              </button>
          ))}
      </div>

      <div className="flex flex-col gap-4 flex-1 min-h-0">
        <div className="flex gap-2 items-center">
             <span className="text-slate-400 font-mono text-lg">/</span>
             <input 
                type="text"
                value={regexStr}
                onChange={(e) => setRegexStr(e.target.value)}
                placeholder="Expression..."
                className={`flex-1 bg-slate-800 text-slate-200 p-3 rounded border ${error ? 'border-red-500' : 'border-slate-700'} font-mono outline-none focus:ring-2 focus:ring-primary-500 transition-all`}
             />
             <span className="text-slate-400 font-mono text-lg">/</span>
             <input 
                type="text"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="gims"
                className="w-20 bg-slate-800 text-slate-200 p-3 rounded border border-slate-700 font-mono outline-none focus:ring-2 focus:ring-primary-500 transition-all text-center"
             />
        </div>
        {error && <div className="text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded border border-red-900/30">{error}</div>}

        <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
            <div className="flex-1 flex flex-col gap-2 min-h-[300px]">
                <label className="text-sm text-slate-400 uppercase font-bold tracking-wider">Test String</label>
                <textarea
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                    className="flex-1 w-full bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono text-sm leading-relaxed"
                    placeholder="Insert text to match against..."
                />
            </div>

            <div className="flex-1 flex flex-col gap-2 min-h-[300px]">
                <div className="flex justify-between items-center">
                     <label className="text-sm text-slate-400 uppercase font-bold tracking-wider">Matches ({matches.length})</label>
                </div>
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg overflow-auto font-mono text-sm p-2">
                    {matches.length > 0 ? (
                        <div className="space-y-3 p-2">
                            {matches.map((m, i) => (
                                <div key={i} className="bg-slate-800/50 rounded border border-slate-700/50 p-3 hover:bg-slate-800 transition-colors">
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="text-primary-400 font-bold flex gap-2">
                                            <span className="bg-slate-700 text-slate-300 px-1.5 rounded text-xs flex items-center h-5">#{i + 1}</span>
                                            {m[0] ? (
                                                <span className="break-all">{m[0]}</span>
                                            ) : (
                                                <span className="text-slate-500 italic text-xs py-0.5">(empty match)</span>
                                            )}
                                        </div>
                                        <span className="text-slate-600 text-xs whitespace-nowrap ml-2">Idx: {m.index}</span>
                                    </div>
                                    
                                    {/* Capture Groups */}
                                    {m.length > 1 && (
                                        <div className="mt-2 pl-3 border-l-2 border-slate-700 space-y-1">
                                            {Array.from(m).slice(1).map((group, groupIdx) => (
                                                <div key={groupIdx} className="text-xs flex gap-2">
                                                    <span className="text-slate-500 font-semibold">G{groupIdx + 1}:</span>
                                                    <span className="text-green-400 break-all">{group !== undefined ? (group as string) : <i className="opacity-50">undefined</i>}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-600 italic">
                            No matches found.
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RegexTester;