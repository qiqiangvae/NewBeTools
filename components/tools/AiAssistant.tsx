import React, { useState } from 'react';
import { generateRegex, explainCode } from '../../services/geminiService';
import { GoogleGenAI } from "@google/genai";
import { IconSparkles, IconCopy, IconCheck } from '../Icons';

type Mode = 'regex' | 'explain' | 'convert';

const AiAssistant: React.FC = () => {
  const [mode, setMode] = useState<Mode>('regex');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const convertCode = async (code: string) => {
    const apiKey = process.env.API_KEY || '';
    if (!apiKey) return "API Key missing";
    const ai = new GoogleGenAI({ apiKey });
    try {
        const prompt = `Convert the following code/request.
        If it looks like a curl command, convert it to Python and JavaScript Fetch.
        If it looks like code, translate it to the other most likely desired language or plain English explanation if vague.
        
        Code/Request:
        ${code}
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text?.trim() || "Failed to convert";
    } catch(e) {
        return "Error converting code";
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput('');
    
    let result = '';
    if (mode === 'regex') {
        result = await generateRegex(input);
    } else if (mode === 'explain') {
        result = await explainCode(input);
    } else {
        result = await convertCode(input);
    }
    
    setOutput(result);
    setLoading(false);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
            <IconSparkles className="text-yellow-400 w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-100">Smart Developer Assistant</h2>
        </div>
        
        <div className="bg-slate-800 p-1 rounded-lg flex border border-slate-700">
            <button
                onClick={() => { setMode('regex'); setOutput(''); setInput(''); }}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all ${mode === 'regex' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
                Regex Gen
            </button>
            <button
                onClick={() => { setMode('explain'); setOutput(''); setInput(''); }}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all ${mode === 'explain' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
                Explain
            </button>
             <button
                onClick={() => { setMode('convert'); setOutput(''); setInput(''); }}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all ${mode === 'convert' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
                Convert
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Input Column */}
        <div className="flex flex-col gap-2">
            <label className="text-slate-400 text-sm">
                {mode === 'regex' ? 'Describe matching rule:' : mode === 'explain' ? 'Paste code to explain:' : 'Paste code to convert (e.g. Curl):'}
            </label>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'regex' ? "e.g., Match valid email addresses excluding .org domains" : "Paste your code snippet here..."}
                className="flex-1 w-full bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono text-sm"
            />
            <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-medium rounded-lg shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
                {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <IconSparkles className="w-4 h-4" />
                        Generate
                    </>
                )}
            </button>
        </div>

        {/* Output Column */}
        <div className="flex flex-col gap-2 relative">
             <div className="flex justify-between items-center">
                <label className="text-slate-400 text-sm">AI Output</label>
                {output && (
                    <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-400">
                        {copied ? <IconCheck className="w-3 h-3" /> : <IconCopy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                )}
             </div>
             <div className={`flex-1 w-full bg-slate-900 rounded-lg border border-slate-700 p-4 font-mono text-sm overflow-auto ${!output ? 'flex items-center justify-center text-slate-600 italic' : 'text-green-400'}`}>
                {output || "Result will appear here..."}
             </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;