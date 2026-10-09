import React, { useMemo, useState } from 'react';
import { IconCopy, IconCheck } from '../Icons';
import { ToolComponentProps } from '../../types';
import { useCopy } from './shared/useCopy';

const PALETTES: { en: string; zh: string; hex: string }[] = [
  { en: 'Slate', zh: '石板灰', hex: '#64748b' },
  { en: 'Red', zh: '红', hex: '#ef4444' },
  { en: 'Orange', zh: '橙', hex: '#f97316' },
  { en: 'Amber', zh: '琥珀', hex: '#f59e0b' },
  { en: 'Yellow', zh: '黄', hex: '#eab308' },
  { en: 'Lime', zh: '柠檬绿', hex: '#84cc16' },
  { en: 'Green', zh: '绿', hex: '#22c55e' },
  { en: 'Emerald', zh: '翠绿', hex: '#10b981' },
  { en: 'Teal', zh: '青绿', hex: '#14b8a6' },
  { en: 'Cyan', zh: '青色', hex: '#06b6d4' },
  { en: 'Sky', zh: '天蓝', hex: '#0ea5e9' },
  { en: 'Blue', zh: '蓝', hex: '#3b82f6' },
  { en: 'Indigo', zh: '靛蓝', hex: '#6366f1' },
  { en: 'Violet', zh: '紫罗兰', hex: '#8b5cf6' },
  { en: 'Purple', zh: '紫', hex: '#a855f7' },
  { en: 'Fuchsia', zh: '品红', hex: '#d946ef' },
  { en: 'Pink', zh: '粉', hex: '#ec4899' },
  { en: 'Rose', zh: '玫红', hex: '#f43f5e' },
  { en: 'Black', zh: '黑', hex: '#000000' },
  { en: 'White', zh: '白', hex: '#ffffff' },
];

interface Rgb { r: number; g: number; b: number }

const hexToRgb = (hex: string): Rgb | null => {
  if (!/^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(hex)) return null;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
};

const rgbToHsl = ({ r, g, b }: Rgb): { h: number; s: number; l: number } => {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) return { h: 0, s: 0, l: Math.round(l * 100) };

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
    case gn: h = (bn - rn) / d + 2; break;
    default: h = (rn - gn) / d + 4;
  }
  return { h: Math.round(h * 60), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const ColorConverter: React.FC<ToolComponentProps> = ({ lang }) => {
  const [hex, setHex] = useState('#3b82f6');

  const t = {
    title: lang === 'zh' ? '颜色转换' : 'Color Converter',
    pick: lang === 'zh' ? '点击取色' : 'Click to Pick Color',
    presets: lang === 'zh' ? '预设' : 'Presets',
    hexValue: lang === 'zh' ? 'HEX 值' : 'HEX Value',
    rgbValue: lang === 'zh' ? 'RGB 值' : 'RGB Value',
    hslValue: lang === 'zh' ? 'HSL 值' : 'HSL Value',
    cssVar: lang === 'zh' ? 'CSS 变量' : 'CSS Variable',
    invalid: lang === 'zh' ? '无效的 HEX' : 'Invalid HEX',
    copy: lang === 'zh' ? '复制' : 'Copy',
  };

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => (rgb ? rgbToHsl(rgb) : null), [rgb]);

  const handleHexChange = (val: string) => {
    // Ensure starts with #
    setHex(val.startsWith('#') ? val : '#' + val);
  };

  const copyableRows = [
    { label: t.rgbValue, value: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : t.invalid, copy: Boolean(rgb) },
    { label: t.hslValue, value: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : t.invalid, copy: Boolean(hsl) },
    { label: t.cssVar, value: `--color: ${hex};`, copy: true },
  ];

  const CopyButton = ({ text }: { text: string }) => {
    const { copied, copy } = useCopy();
    return (
        <button 
            onClick={() => copy(text)} 
            title={t.copy}
            className="p-2 text-slate-500 hover:text-primary-400 transition-colors shrink-0"
        >
            {copied ? <IconCheck className="w-4 h-4 text-green-500" /> : <IconCopy className="w-4 h-4" />}
        </button>
    );
  };

  return (
    <div className="flex flex-col gap-6 h-full">
       <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
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
                      {t.pick}
                  </div>
               </div>
               
               {/* Popular Palettes */}
               <div className="flex-1 bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col justify-center">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">{t.presets}</h3>
                  <div className="flex flex-wrap gap-2.5">
                      {PALETTES.map((p) => (
                          <button
                            key={p.hex}
                            onClick={() => handleHexChange(p.hex)}
                            className="w-7 h-7 rounded-lg border border-white/10 hover:scale-110 transition-transform focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                            style={{ backgroundColor: p.hex }}
                            title={`${lang === 'zh' ? p.zh : p.en} (${p.hex})`}
                          />
                      ))}
                  </div>
               </div>
           </div>

           {/* Results Section */}
           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-5">
                {/* HEX Input */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{t.hexValue}</label>
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

                {copyableRows.map(({ label, value, copy }) => (
                    <div key={label} className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg group">
                            <input 
                                type="text" 
                                value={value} 
                                readOnly
                                className="flex-1 bg-transparent px-4 py-3 text-slate-100 outline-none font-mono text-sm"
                                spellCheck="false"
                            />
                            {copy && <CopyButton text={value} />}
                        </div>
                    </div>
                ))}
           </div>
       </div>
    </div>
  );
};

export default ColorConverter;
