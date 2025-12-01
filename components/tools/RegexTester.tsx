import React, { useState, useEffect } from 'react';
import { generateRegex } from '../../services/geminiService';
import { IconSparkles } from '../Icons';

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
        // Prevent infinite loops with global flag
        if (!flags.includes('g')) {
             match = regex.exec(testString);
             if (match) newMatches.push(match);
        } else {
            let i = 0;
            while ((match = regex.exec(testString)) !== null && i < 1000) {
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

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
         <h2 className="text-xl font-bold text-slate-100">Regex Tester</h2>
         <button onClick={handleAiGenerate} className="flex items-center gap-2 text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors">
            <IconSparkles className="w-4 h-4" />
            {isGenerating ? 'Thinking...' : 'AI Generate'}
         </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-center">
             <span className="text-slate-400 font-mono text-lg">/</span>
             <input 
                type="text"
                value={regexStr}
                onChange={(e) => setRegexStr(e.target.value)}
                placeholder="Expression..."
                className={`flex-1 bg-slate-800 text-slate-200 p-2 rounded border ${error ? 'border-red-500' : 'border-slate-700'} font-mono outline-none focus:ring-1 focus:ring-primary-500`}
             />
             <span className="text-slate-400 font-mono text-lg">/</span>
             <input 
                type="text"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="flags"
                className="w-16 bg-slate-800 text-slate-200 p-2 rounded border border-slate-700 font-mono outline-none focus:ring-1 focus:ring-primary-500"
             />
        </div>
        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm text-slate-400">Test String</label>
            <textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                className="w-full h-32 bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono"
                placeholder="Insert text to match against..."
            />
        </div>

        <div className="flex-1 flex flex-col gap-2">
             <label className="text-sm text-slate-400">Matches ({matches.length})</label>
             <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 h-40 overflow-auto font-mono text-sm">
                {matches.length > 0 ? (
                    <ul className="space-y-1">
                        {matches.map((m, i) => (
                            <li key={i} className="text-green-400 border-b border-slate-800/50 pb-1">
                                <span className="text-slate-500 mr-2">[{i}]</span>
                                {m[0]} 
                                <span className="text-slate-600 text-xs ml-2">index: {m.index}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <span className="text-slate-600 italic">No matches found.</span>
                )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default RegexTester;