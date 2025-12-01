import React, { useState } from 'react';
import { IconCopy, IconCheck } from '../Icons';

const Base64Converter: React.FC = () => {
  const [text, setText] = useState('');
  const [base64, setBase64] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);

  const handleConvert = (input: string, currentMode: 'encode' | 'decode') => {
    if (!input) {
      if (currentMode === 'encode') setBase64('');
      else setText('');
      return;
    }

    try {
      if (currentMode === 'encode') {
        const encoded = btoa(input);
        setBase64(encoded);
      } else {
        const decoded = atob(input);
        setText(decoded);
      }
    } catch (e) {
      // Invalid input usually
      if (currentMode === 'decode') setText('Invalid Base64 string');
    }
  };

  const handleInputChange = (val: string, type: 'text' | 'base64') => {
    if (type === 'text') {
      setText(val);
      handleConvert(val, 'encode');
    } else {
      setBase64(val);
      handleConvert(val, 'decode');
    }
  };

  const copyToClipboard = (content: string) => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-100">Base64 Converter</h2>
        <div className="bg-slate-800 p-1 rounded-lg flex border border-slate-700">
          <button
            onClick={() => setMode('encode')}
            className={`px-4 py-1.5 text-sm rounded-md transition-all ${mode === 'encode' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`px-4 py-1.5 text-sm rounded-md transition-all ${mode === 'decode' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Decode
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Plain Text Section */}
        <div className="relative group">
           <div className="flex justify-between mb-2">
             <label className="text-sm font-medium text-slate-300">Plain Text</label>
             <button onClick={() => copyToClipboard(text)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary-500">
               {copied ? <IconCheck className="w-4 h-4"/> : <IconCopy className="w-4 h-4"/>}
             </button>
           </div>
           <textarea
             value={text}
             onChange={(e) => handleInputChange(e.target.value, 'text')}
             readOnly={mode === 'decode'} // When decoding, we type in base64 box
             placeholder="Type plain text here..."
             className={`w-full h-32 bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono ${mode === 'decode' ? 'opacity-75 cursor-not-allowed' : ''}`}
           />
        </div>

        {/* Base64 Section */}
        <div className="relative group">
           <div className="flex justify-between mb-2">
             <label className="text-sm font-medium text-slate-300">Base64 Output</label>
             <button onClick={() => copyToClipboard(base64)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary-500">
               {copied ? <IconCheck className="w-4 h-4"/> : <IconCopy className="w-4 h-4"/>}
             </button>
           </div>
           <textarea
             value={base64}
             onChange={(e) => handleInputChange(e.target.value, 'base64')}
             readOnly={mode === 'encode'} // When encoding, we type in text box
             placeholder="Base64 string here..."
             className={`w-full h-32 bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono ${mode === 'encode' ? 'opacity-75 cursor-not-allowed' : ''}`}
           />
        </div>
      </div>
    </div>
  );
};

export default Base64Converter;
