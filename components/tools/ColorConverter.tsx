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
  const [rgb, setRgb] = useState('rgb(59, 130, 246)');

  const handleHexChange = (val: string) => {
    // Ensure starts with #
    let cleanHex = val.startsWith('#') ? val : '#' + val;
    setHex(cleanHex);
    
    if (/^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(cleanHex)) {
        let h = cleanHex.replace('#', '');
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        
        setRgb(`rgb(${r}, ${g}, ${b})`);
    } else {
        setRgb('Invalid HEX');
    }
  };

  const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    return (
        <button 
            onClick={() => {
                if (!text || text.includes('Invalid')) return;
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }} 
            className="p-2 text-slate-500 hover:text-primary-400 transition-colors shrink-0"
        >
            {copied ? <IconCheck className="w-4 h-4 text-green-500" /> : <IconCopy className="w-4 h-4" />}
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
                className="w-full md:w-1/3 min-h-[160px] rounded-xl shadow-inner border border-slate-700 transition-all relative group overflow-hidden"
                style={{ backgroundColor: hex.startsWith('#') && (hex.length === 4 || hex.length === 7) ? hex : '#000' }}
               >
                  <input 
                    type="color" 
                    value={hex.startsWith('#') && hex.length === 7 ? hex : '#3b82f6'} 
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none text-white font-bold text-sm">
                      Click to Pick Color
                  </div>
               </div>
              
               {/* Popular Palettes */}
               <div className="flex-1 bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col justify-center">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Presets</h3>
                  <div className="flex flex-wrap gap-2.5">
                      {PALETTES.map((p) => (
                          <button
                            key={p.name}
                            onClick={() => handleHexChange(p.hex)}
                            className="w-7 h-7 rounded-lg border border-white/10 hover:scale-110 transition-transform focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                            style={{ backgroundColor: p.hex }}
                            title={`${p.name} (${p.hex})`}
                          />
                      ))}
                  </div>
               </div>
           </div>

           {/* Results Section */}
           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-5">
                {/* HEX Input */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">HEX Value</label>
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg group focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
                        <input 
                            type="text" 
                            value={hex} 
                            onChange={(e) => handleHexChange(e.target.value)}
                            className="flex-1 bg-transparent px-4 py-3 text-slate-100 outline-none font-mono text-sm uppercase"
                            placeholder="#000000"
                            spellCheck="false"
                        />
                        <CopyButton text={hex} />
                    </div>
                </div>

                {/* RGB Display */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">RGB Value</label>
                     <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg group">
                        <input 
                            type="text" 
                            value={rgb} 
                            readOnly
                            className="flex-1 bg-transparent px-4 py-3 text-slate-100 outline-none font-mono text-sm"
                            spellCheck="false"
                        />
                        <CopyButton text={rgb} />
                    </div>
                </div>
                
                {/* CSS Variable Display */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">CSS Variable</label>
                     <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg group">
                        <input 
                            type="text" 
                            value={`--color: ${hex};`} 
                            readOnly
                            className="flex-1 bg-transparent px-4 py-3 text-slate-400 outline-none font-mono text-sm italic"
                            spellCheck="false"
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