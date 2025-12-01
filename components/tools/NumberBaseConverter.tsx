import React, { useState } from 'react';
import { IconCopy, IconCheck } from '../Icons';

const NumberBaseConverter: React.FC = () => {
  const [values, setValues] = useState({
    dec: '',
    hex: '',
    bin: '',
    oct: ''
  });

  const handleChange = (val: string, type: 'dec' | 'hex' | 'bin' | 'oct') => {
    let decValue = NaN;

    if (!val) {
      setValues({ dec: '', hex: '', bin: '', oct: '' });
      return;
    }

    try {
      switch (type) {
        case 'dec': decValue = parseInt(val, 10); break;
        case 'hex': decValue = parseInt(val, 16); break;
        case 'bin': decValue = parseInt(val, 2); break;
        case 'oct': decValue = parseInt(val, 8); break;
      }

      if (isNaN(decValue)) {
        // Just update the current field to allow typing, but don't update others if invalid
        setValues(prev => ({ ...prev, [type]: val }));
        return;
      }

      setValues({
        dec: decValue.toString(10),
        hex: decValue.toString(16).toUpperCase(),
        bin: decValue.toString(2),
        oct: decValue.toString(8)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        if(!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="text-slate-500 hover:text-primary-400 transition-colors p-2">
            {copied ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
        </button>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-100">Number Base Converter</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
            
            <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-400">Decimal</label>
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
                    <input 
                        type="text" 
                        value={values.dec}
                        onChange={(e) => handleChange(e.target.value, 'dec')}
                        placeholder="123"
                        className="flex-1 bg-transparent border-none text-slate-200 px-4 py-3 outline-none font-mono"
                    />
                    <CopyButton text={values.dec} />
                </div>
            </div>

            <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-400">Hexadecimal</label>
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
                    <span className="pl-4 text-slate-500 font-mono select-none">0x</span>
                    <input 
                        type="text" 
                        value={values.hex}
                        onChange={(e) => handleChange(e.target.value, 'hex')}
                        placeholder="7B"
                        className="flex-1 bg-transparent border-none text-slate-200 px-2 py-3 outline-none font-mono uppercase"
                    />
                     <CopyButton text={values.hex} />
                </div>
            </div>

            <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-400">Binary</label>
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
                    <input 
                        type="text" 
                        value={values.bin}
                        onChange={(e) => handleChange(e.target.value, 'bin')}
                        placeholder="1111011"
                        className="flex-1 bg-transparent border-none text-slate-200 px-4 py-3 outline-none font-mono"
                    />
                     <CopyButton text={values.bin} />
                </div>
            </div>

            <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-400">Octal</label>
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
                    <input 
                        type="text" 
                        value={values.oct}
                        onChange={(e) => handleChange(e.target.value, 'oct')}
                        placeholder="173"
                        className="flex-1 bg-transparent border-none text-slate-200 px-4 py-3 outline-none font-mono"
                    />
                     <CopyButton text={values.oct} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NumberBaseConverter;