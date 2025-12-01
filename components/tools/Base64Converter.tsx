import React, { useState } from 'react';
import { IconCopy, IconCheck } from '../Icons';
import { ToolComponentProps } from '../../types';

const CHARSET_62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// Helper: Text -> Hex
const textToHex = (str: string) => {
  const raw = new TextEncoder().encode(str);
  return Array.from(raw).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Helper: Hex -> Text
const hexToText = (hex: string) => {
  if (hex.length % 2 !== 0) return '';
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return new TextDecoder().decode(bytes);
};

// Helper: BigInt -> Base62 String
const toBase62 = (hex: string): string => {
  if (!hex) return '';
  let num = BigInt('0x' + hex);
  if (num === 0n) return '';
  
  let res = '';
  const base = 62n;
  while (num > 0n) {
    const rem = num % base;
    res = CHARSET_62[Number(rem)] + res;
    num = num / base;
  }
  return res;
};

// Helper: Base62 String -> Hex
const fromBase62 = (str: string): string => {
  if (!str) return '';
  let num = 0n;
  const base = 62n;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const idx = CHARSET_62.indexOf(char);
    if (idx === -1) throw new Error('Invalid Base62 character');
    num = num * base + BigInt(idx);
  }
  let hex = num.toString(16);
  if (hex.length % 2 !== 0) hex = '0' + hex;
  return hex;
};

const Base64Converter: React.FC<ToolComponentProps> = ({ lang }) => {
  const [text, setText] = useState('');
  const [encoded, setEncoded] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [format, setFormat] = useState<'base64' | 'base62'>('base64');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Translations
  const t = {
    title: lang === 'zh' ? '编码转换 (Base64 / Base62)' : 'Encoding Converter',
    plain: lang === 'zh' ? '明文 (Plain Text)' : 'Plain Text',
    encoded: lang === 'zh' ? (format === 'base62' ? 'Base62 密文' : 'Base64 密文') : (format === 'base62' ? 'Base62 Output' : 'Base64 Output'),
    encode: lang === 'zh' ? '编码' : 'Encode',
    decode: lang === 'zh' ? '解码' : 'Decode',
    copy: lang === 'zh' ? '复制' : 'Copy',
    copied: lang === 'zh' ? '已复制' : 'Copied',
    formatLabel: lang === 'zh' ? '格式' : 'Format',
    errInvalid: lang === 'zh' ? '无效的编码格式' : 'Invalid encoding format',
    placeholderPlain: lang === 'zh' ? '输入要编码的文本...' : 'Type plain text here...',
    placeholderEncoded: lang === 'zh' ? '输入要解码的字符串...' : 'Encoded string here...',
  };

  const handleConvert = (input: string, currentMode: 'encode' | 'decode', currentFormat: 'base64' | 'base62') => {
    setError(null);
    if (!input) {
      if (currentMode === 'encode') setEncoded('');
      else setText('');
      return;
    }

    try {
      if (currentFormat === 'base64') {
        if (currentMode === 'encode') {
          // Use Buffer equivalent for UTF-8 support in browser (text encoder)
          // Simple btoa works for latin1. For unicode:
          const utf8Bytes = new TextEncoder().encode(input);
          const binaryStr = Array.from(utf8Bytes, b => String.fromCharCode(b)).join('');
          setEncoded(btoa(binaryStr));
        } else {
          const binaryStr = atob(input);
          const bytes = new Uint8Array(binaryStr.length);
          for(let i=0; i<binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
          setText(new TextDecoder().decode(bytes));
        }
      } else {
        // Base62
        if (currentMode === 'encode') {
           const hex = textToHex(input);
           setEncoded(toBase62(hex));
        } else {
           const hex = fromBase62(input);
           setText(hexToText(hex));
        }
      }
    } catch (e) {
      if (currentMode === 'decode') {
          setError(t.errInvalid);
      }
    }
  };

  const handleInputChange = (val: string, type: 'text' | 'encoded') => {
    if (type === 'text') {
      setText(val);
      handleConvert(val, 'encode', format);
    } else {
      setEncoded(val);
      handleConvert(val, 'decode', format);
    }
  };

  // Re-run conversion if format switches
  const handleFormatChange = (newFormat: 'base64' | 'base62') => {
    setFormat(newFormat);
    // If we have plain text, re-encode to new format
    if (mode === 'encode' && text) {
        // slight delay to let state update or just call directly
        // React batching means format isn't updated in this scope yet, pass it explicitly
        handleConvert(text, 'encode', newFormat);
    } else if (mode === 'decode') {
        // If decoding, we clear output because the input encoded string is likely invalid for new format
        setText('');
        setError(null);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
        
        <div className="flex flex-wrap gap-4">
            {/* Format Switcher */}
            <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
                <span className="text-xs font-semibold text-slate-500 uppercase px-2 hidden sm:inline-block">{t.formatLabel}</span>
                <button
                    onClick={() => handleFormatChange('base64')}
                    className={`px-3 py-1 text-xs sm:text-sm rounded-md transition-all ${format === 'base64' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    Base64
                </button>
                <button
                    onClick={() => handleFormatChange('base62')}
                    className={`px-3 py-1 text-xs sm:text-sm rounded-md transition-all ${format === 'base62' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    Base62
                </button>
            </div>

            {/* Mode Switcher */}
            <div className="bg-slate-800 p-1 rounded-lg flex border border-slate-700">
                <button
                    onClick={() => { setMode('encode'); if(text) handleConvert(text, 'encode', format); }}
                    className={`px-4 py-1.5 text-sm rounded-md transition-all ${mode === 'encode' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    {t.encode}
                </button>
                <button
                    onClick={() => { setMode('decode'); if(encoded) handleConvert(encoded, 'decode', format); }}
                    className={`px-4 py-1.5 text-sm rounded-md transition-all ${mode === 'decode' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    {t.decode}
                </button>
            </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Plain Text Section */}
        <div className="relative group">
           <div className="flex justify-between mb-2">
             <label className="text-sm font-medium text-slate-300">{t.plain}</label>
             <button onClick={() => copyToClipboard(text)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary-500 flex items-center gap-1 text-xs">
               {copied ? <IconCheck className="w-3 h-3"/> : <IconCopy className="w-3 h-3"/>}
               {t.copy}
             </button>
           </div>
           <textarea
             value={text}
             onChange={(e) => handleInputChange(e.target.value, 'text')}
             readOnly={mode === 'decode'}
             placeholder={t.placeholderPlain}
             className={`w-full h-32 bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono ${mode === 'decode' ? 'opacity-75 cursor-not-allowed' : ''}`}
           />
        </div>

        {/* Encoded Output Section */}
        <div className="relative group">
           <div className="flex justify-between mb-2">
             <label className="text-sm font-medium text-slate-300">{t.encoded}</label>
             <button onClick={() => copyToClipboard(encoded)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary-500 flex items-center gap-1 text-xs">
               {copied ? <IconCheck className="w-3 h-3"/> : <IconCopy className="w-3 h-3"/>}
               {t.copy}
             </button>
           </div>
           <textarea
             value={encoded}
             onChange={(e) => handleInputChange(e.target.value, 'encoded')}
             readOnly={mode === 'encode'}
             placeholder={t.placeholderEncoded}
             className={`w-full h-32 bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono ${mode === 'encode' ? 'opacity-75 cursor-not-allowed' : ''} ${error ? 'border-red-500' : ''}`}
           />
           {error && <div className="absolute bottom-4 right-4 text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default Base64Converter;
