import React, { useState } from 'react';
import { IconCopy, IconCheck, IconRefresh } from '../Icons';
import { ToolComponentProps } from '../../types';

const UnicodeConverter: React.FC<ToolComponentProps> = ({ lang }) => {
  const [mode, setMode] = useState<'unicode' | 'utf8'>('unicode');
  const [plain, setPlain] = useState('');
  const [encoded, setEncoded] = useState('');
  const [copied, setCopied] = useState(false);

  const t = {
    title: lang === 'zh' ? 'Unicode 转码' : 'Unicode Converter',
    unicodeMode: lang === 'zh' ? 'Unicode (\\u)' : 'Unicode (\\u)',
    utf8Mode: lang === 'zh' ? 'UTF-8 Hex' : 'UTF-8 Hex',
    plainText: lang === 'zh' ? '普通文本' : 'Plain Text',
    encodedText: lang === 'zh' ? '编码文本' : 'Encoded Text',
    encode: lang === 'zh' ? '编码 (Encode)' : 'Encode',
    decode: lang === 'zh' ? '解码 (Decode)' : 'Decode',
    copy: lang === 'zh' ? '复制' : 'Copy',
    copied: lang === 'zh' ? '已复制' : 'Copied',
    phPlain: lang === 'zh' ? '输入普通文本...' : 'Enter plain text...',
    phEncoded: lang === 'zh' ? '输入编码文本 (如 \\u4f60\\u597d)...' : 'Enter encoded text (e.g. \\u4f60\\u597d)...',
    autoDecode: lang === 'zh' ? '尝试自动修正格式' : 'Try auto-fix format',
  };

  const handleUnicodeEncode = (str: string) => {
    // Encodes non-ASCII characters to \uXXXX
    return str.split('').map(char => {
        const code = char.charCodeAt(0);
        return code > 127 ? '\\u' + code.toString(16).padStart(4, '0') : char;
    }).join('');
  };

  const handleUnicodeDecode = (str: string) => {
    // Replaces \uXXXX with actual characters
    return str.replace(/\\u([\dA-Fa-f]{4})/gi, (_, group) => {
        return String.fromCharCode(parseInt(group, 16));
    });
  };

  const handleUtf8Encode = (str: string) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
  };

  const handleUtf8Decode = (str: string) => {
    // Clean up input: remove spaces, '0x', etc
    const cleanHex = str.replace(/[\s,0x]/g, '');
    if (cleanHex.length % 2 !== 0) return 'Invalid Hex';
    
    try {
        const bytes = new Uint8Array(cleanHex.length / 2);
        for (let i = 0; i < cleanHex.length; i += 2) {
            bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
        }
        const decoder = new TextDecoder();
        return decoder.decode(bytes);
    } catch (e) {
        return 'Decoding Error';
    }
  };

  const processConvert = (direction: 'toEncoded' | 'toPlain') => {
      if (direction === 'toEncoded') {
          if (mode === 'unicode') setEncoded(handleUnicodeEncode(plain));
          else setEncoded(handleUtf8Encode(plain));
      } else {
          if (mode === 'unicode') setPlain(handleUnicodeDecode(encoded));
          else setPlain(handleUtf8Decode(encoded));
      }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
        <div className="bg-slate-800 p-1 rounded-lg flex border border-slate-700">
             <button
                onClick={() => { setMode('unicode'); setEncoded(''); setPlain(''); }}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all ${mode === 'unicode' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
             >
                {t.unicodeMode}
             </button>
             <button
                onClick={() => { setMode('utf8'); setEncoded(''); setPlain(''); }}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all ${mode === 'utf8' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
             >
                {t.utf8Mode}
             </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
          {/* Plain Text */}
          <div className="flex-1 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-400">{t.plainText}</label>
                  <button onClick={() => copyToClipboard(plain)} className="text-slate-500 hover:text-primary-400 transition-colors p-1 flex items-center gap-1 text-xs">
                      {copied ? <IconCheck className="w-3 h-3"/> : <IconCopy className="w-3 h-3"/>} {t.copy}
                  </button>
              </div>
              <textarea 
                  value={plain}
                  onChange={(e) => {
                      setPlain(e.target.value);
                  }}
                  placeholder={t.phPlain}
                  className="w-full h-32 bg-slate-800 text-slate-200 p-4 rounded-xl border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono text-sm"
              />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
              <button 
                onClick={() => processConvert('toEncoded')}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                  <span>↓ {t.encode}</span>
              </button>
              <button 
                onClick={() => processConvert('toPlain')}
                className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                  <span>↑ {t.decode}</span>
              </button>
          </div>

          {/* Encoded Text */}
          <div className="flex-1 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-400">{t.encodedText}</label>
                  <button onClick={() => copyToClipboard(encoded)} className="text-slate-500 hover:text-primary-400 transition-colors p-1 flex items-center gap-1 text-xs">
                      {copied ? <IconCheck className="w-3 h-3"/> : <IconCopy className="w-3 h-3"/>} {t.copy}
                  </button>
              </div>
              <textarea 
                  value={encoded}
                  onChange={(e) => {
                      setEncoded(e.target.value);
                  }}
                  placeholder={t.phEncoded}
                  className="w-full h-32 bg-slate-800 text-slate-200 p-4 rounded-xl border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono text-sm"
              />
          </div>
      </div>
    </div>
  );
};

export default UnicodeConverter;