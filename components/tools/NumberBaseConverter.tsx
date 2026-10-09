import React, { useState } from 'react';
import { IconCopy, IconCheck } from '../Icons';
import { ToolComponentProps } from '../../types';
import { useCopy } from './shared/useCopy';

type BaseKey = 'dec' | 'hex' | 'bin' | 'oct';

const FIELDS: { key: BaseKey; placeholder: string; uppercase?: boolean }[] = [
  { key: 'dec', placeholder: '123' },
  { key: 'hex', placeholder: '0x7B', uppercase: true },
  { key: 'bin', placeholder: '1111011' },
  { key: 'oct', placeholder: '173' },
];

const NumberBaseConverter: React.FC<ToolComponentProps> = ({ lang }) => {
  const [values, setValues] = useState<Record<BaseKey, string>>({
    dec: '',
    hex: '',
    bin: '',
    oct: ''
  });

  const t = {
    title: lang === 'zh' ? '进制转换' : 'Number Base Converter',
    dec: lang === 'zh' ? '十进制 (10)' : 'Decimal (10)',
    hex: lang === 'zh' ? '十六进制 (16)' : 'Hexadecimal (16)',
    bin: lang === 'zh' ? '二进制 (2)' : 'Binary (2)',
    oct: lang === 'zh' ? '八进制 (8)' : 'Octal (8)',
    copy: lang === 'zh' ? '复制' : 'Copy',
    hint: lang === 'zh' ? '在任一输入框输入数字即可互相转换。' : 'Enter a number in any field to convert between bases.',
  };

  const handleChange = (val: string, type: BaseKey) => {
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
    const { copied, copy } = useCopy();
    return (
        <button onClick={() => copy(text)} title={t.copy} className="text-slate-500 hover:text-primary-400 transition-colors p-3 shrink-0">
            {copied ? <IconCheck className="w-4 h-4 text-green-500" /> : <IconCopy className="w-4 h-4" />}
        </button>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto h-full">
      <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
          <div className="grid gap-5">
              {FIELDS.map(({ key, placeholder, uppercase }) => (
                  <div key={key} className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{t[key]}</label>
                      <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg group focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
                          <input 
                              type="text" 
                              value={values[key]}
                              onChange={(e) => handleChange(e.target.value, key)}
                              placeholder={placeholder}
                              className={`flex-1 bg-transparent px-4 py-3 text-slate-100 outline-none font-mono text-sm${uppercase ? ' uppercase' : ''}`}
                              spellCheck="false"
                          />
                          <CopyButton text={values[key]} />
                      </div>
                  </div>
              ))}
          </div>
      </div>
      
      {!values.dec && (
          <p className="text-center text-slate-500 text-xs mt-4 italic">
              {t.hint}
          </p>
      )}
    </div>
  );
};

export default NumberBaseConverter;
