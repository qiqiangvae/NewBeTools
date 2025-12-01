import React, { useState, useEffect } from 'react';
import { IconCopy, IconCheck } from '../Icons';

const ColorConverter: React.FC = () => {
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState('59, 130, 246');
  const [hsl, setHsl] = useState('217, 91%, 60%');

  // Convert HEX to others
  const handleHexChange = (val: string) => {
    setHex(val);
    if (/^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(val)) {
        let h = val.replace('#', '');
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        
        setRgb(`${r}, ${g}, ${b}`);
        // Simple HSL calc omitted for brevity, usually needs dedicated function
    }
  };

  const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    return (
        <button 
            onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }} 
            className="p-2 text-slate-400 hover:text-white"
        >
            {copied ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
        </button>
    );
  };

  return (
    <div className="flex flex-col gap-8">
       <h2 className="text-xl font-bold text-slate-100">Color Converter</h2>
       
       <div className="flex flex-col md:flex-row gap-8 items-start">
           {/* Preview */}
           <div className="w-full md:w-64 flex flex-col gap-4">
              <div 
                className="w-full aspect-square rounded-2xl shadow-xl border border-slate-700 transition-colors"
                style={{ backgroundColor: hex }}
              />
              <div className="flex justify-center">
                  <input 
                    type="color" 
                    value={hex} 
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="w-full h-10 rounded cursor-pointer bg-slate-800 border border-slate-700 p-1"
                  />
              </div>
           </div>

           {/* Controls */}
           <div className="flex-1 w-full space-y-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-400">HEX</label>
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg">
                            <input 
                                type="text" 
                                value={hex} 
                                onChange={(e) => handleHexChange(e.target.value)}
                                className="flex-1 bg-transparent px-4 py-2 text-slate-200 outline-none font-mono"
                            />
                            <CopyButton text={hex} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-400">RGB</label>
                         <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg">
                            <input 
                                type="text" 
                                value={rgb} 
                                readOnly
                                className="flex-1 bg-transparent px-4 py-2 text-slate-200 outline-none font-mono"
                            />
                            <CopyButton text={`rgb(${rgb})`} />
                        </div>
                    </div>
                </div>
           </div>
       </div>
    </div>
  );
};

export default ColorConverter;