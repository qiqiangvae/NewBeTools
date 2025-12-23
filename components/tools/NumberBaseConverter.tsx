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
      // Handle hex prefix if user types it
      let cleanVal = val;
      if (type === 'hex' && val.toLowerCase().startsWith('0x')) {
          cleanVal = val.substring(2);
      }

      switch (type) {
        case 'dec': decValue = parseInt(cleanVal, 10); break;
        case 'hex': decValue = parseInt(cleanVal, 16); break;
        case 'bin': decValue = parseInt(cleanVal, 2); break;
        case 'oct': decValue = parseInt(cleanVal, 8); break;
      }

      if (isNaN(decValue)) {
        setValues(prev => ({ ...prev, [type]: val }));
        return;
      }

      setValues({
        dec: decValue.toString(10),
        hex: '0x' + decValue.toString(16).toUpperCase(),
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
        <button onClick={handleCopy} className="text-slate-500 hover:text-primary-400 transition-colors p-3 shrink-0">
            {copied ? <IconCheck className="w-4 h-4 text-green-500" /> : <IconCopy className="w-4 h-4" />}
        </button>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto h-full">
      <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100">Number Base Converter</h2>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
          <div className="grid gap-5">
              {/* Decimal */}
              <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Decimal (10)</label>
                  <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg group focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
                      <input 
                          type="text" 
                          value={values.dec}
                          onChange={(e) => handleChange(e.target.value, 'dec')}
                          placeholder="123"
                          className="flex-1 bg-transparent px-4 py-3 text-slate-100 outline-none font-mono text-sm"
                          spellCheck="false"
                      />
                      <CopyButton text={values.dec} />
                  </div>
              </div>

              {/* Hexadecimal */}
              <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Hexadecimal (16)</label>
                  <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg group focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
                      <input 
                          type="text" 
                          value={values.hex}
                          onChange={(e) => handleChange(e.target.value, 'hex')}
                          placeholder="0x7B"
                          className="flex-1 bg-transparent px-4 py-3 text-slate-100 outline-none font-mono text-sm uppercase"
                          spellCheck="false"
                      />
                       <CopyButton text={values.hex} />
                  </div>
              </div>

              {/* Binary */}
              <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Binary (2)</label>
                  <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg group focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
                      <input 
                          type="text" 
                          value={values.bin}
                          onChange={(e) => handleChange(e.target.value, 'bin')}
                          placeholder="1111011"
                          className="flex-1 bg-transparent px-4 py-3 text-slate-100 outline-none font-mono text-sm"
                          spellCheck="false"
                      />
                       <CopyButton text={values.bin} />
                  </div>
              </div>

              {/* Octal */}
              <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Octal (8)</label>
                  <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg group focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
                      <input 
                          type="text" 
                          value={values.oct}
                          onChange={(e) => handleChange(e.target.value, 'oct')}
                          placeholder="173"
                          className="flex-1 bg-transparent px-4 py-3 text-slate-100 outline-none font-mono text-sm"
                          spellCheck="false"
                      />
                       <CopyButton text={values.oct} />
                  </div>
              </div>
          </div>
      </div>
      
      {!values.dec && (
          <p className="text-center text-slate-500 text-xs mt-4 italic">
              Enter a number in any field to convert between bases.
          </p>
      )}
    </div>
  );
};

export default NumberBaseConverter;