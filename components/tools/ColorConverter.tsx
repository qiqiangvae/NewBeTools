import React, { useState, useEffect } from 'react';
import { IconCopy, IconCheck } from '../Icons';

const PALETTES = [
  { name: 'Slate', hex: '#64748b' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Lime', hex: '#84cc16' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Sky', hex: '#0ea5e9' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Fuchsia', hex: '#d946ef' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff' },
];

const ColorConverter: React.FC = () => {
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState('59, 130, 246');
  // const [hsl, setHsl] = useState('217, 91%, 60%'); // Simplification for now

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
    } else {
        setRgb('Invalid HEX');
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
    <div className="flex flex-col gap-6 h-full">
       <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100">Color Converter</h2>
       </div>
       
       <div className="flex flex-col gap-6">
           {/* Top Row: Selector & Palettes */}
           <div className="flex flex-col md:flex-row gap-6">
               {/* Color Selector */}
               <div 
                className="w-full md:w-1/3 min-h-[180px] rounded-xl shadow-md border border-slate-700 transition-colors relative group overflow-hidden"
                style={{ backgroundColor: hex.startsWith('#') ? hex : '#000' }}
               >
                  <input 
                    type="color" 
                    value={hex.startsWith('#') && hex.length === 7 ? hex : '#000000'} 
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none text-white font-medium text-sm">
                      Click to Pick
                  </div>
               </div>
              
               {/* Popular Palettes */}
               <div className="flex-1 bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col justify-center">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Popular Colors</h3>
                  <div className="flex flex-wrap gap-3">
                      {PALETTES.map((p) => (
                          <button
                            key={p.name}
                            onClick={() => handleHexChange(p.hex)}
                            className="w-8 h-8 rounded-full border border-slate-600/50 hover:scale-110 transition-transform focus:ring-2 focus:ring-primary-500 focus:outline-none shadow-sm"
                            style={{ backgroundColor: p.hex }}
                            title={`${p.name} (${p.hex})`}
                          />
                      ))}
                  </div>
               </div>
           </div>

           {/* Controls */}
           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-400">HEX Value</label>
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                        <span className="pl-4 text-slate-500 font-mono">#</span>
                        <input 
                            type="text" 
                            value={hex.replace('#', '')} 
                            onChange={(e) => handleHexChange('#' + e.target.value)}
                            className="flex-1 bg-transparent px-1 py-3 text-slate-200 outline-none font-mono uppercase tracking-wider"
                            placeholder="000000"
                        />
                        <CopyButton text={hex} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-400">RGB Value</label>
                     <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg">
                        <span className="pl-4 text-slate-500 font-mono">rgb(</span>
                        <input 
                            type="text" 
                            value={rgb} 
                            readOnly
                            className="flex-1 bg-transparent px-1 py-3 text-slate-200 outline-none font-mono"
                        />
                        <span className="text-slate-500 font-mono pr-1">)</span>
                        <CopyButton text={`rgb(${rgb})`} />
                    </div>
                </div>
                
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-400">CSS Variable</label>
                     <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg">
                        <input 
                            type="text" 
                            value={`--color: ${hex};`} 
                            readOnly
                            className="flex-1 bg-transparent px-4 py-3 text-slate-500 outline-none font-mono italic"
                        />
                        <CopyButton text={`--color: ${hex};`} />
                    </div>
                </div>
           </div>
       </div>
    </div>
  );
};

export default ColorConverter;