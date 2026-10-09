import React, { useState } from 'react';
import { ToolComponentProps } from '../../types';
import { pill } from './shared/pill';
import CopyButton from './shared/CopyButton';
import { fromHex, textToHex } from './shared/hex';

const UnicodeConverter: React.FC<ToolComponentProps> = ({ lang }) => {
  const [mode, setMode] = useState<'unicode' | 'utf8'>('unicode');
  const [plain, setPlain] = useState('');
  const [encoded, setEncoded] = useState('');

  const t = {
    title: lang === 'zh' ? 'Unicode 转码' : 'Unicode Converter',
    unicodeMode: lang === 'zh' ? 'Unicode (\\u)' : 'Unicode (\\u)',
    utf8Mode: lang === 'zh' ? 'UTF-8 Hex' : 'UTF-8 Hex',
    plainText: lang === 'zh' ? '普通文本' : 'Plain Text',
    encodedText: lang === 'zh' ? '编码文本' : 'Encoded Text',
    encode: lang === 'zh' ? '编码 (Encode)' : 'Encode',
    decode: lang === 'zh' ? '解码 (Decode)' : 'Decode',
    copy: lang === 'zh' ? '复制' : 'Copy',
    phPlain: lang === 'zh' ? '输入普通文本...' : 'Enter plain text...',
    phEncoded: lang === 'zh' ? '输入编码文本 (如 \\u4f60\\u597d)...' : 'Enter encoded text (e.g. \\u4f60\\u597d)...',
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

  /** Upper-case, space-separated byte pairs, e.g. "E4 BD A0". */
  const handleUtf8Encode = (str: string) => textToHex(str, ' ', true);

  const handleUtf8Decode = (str: string) => {
    const bytes = fromHex(str);
    if (!bytes) return 'Invalid Hex';
    return new TextDecoder().decode(bytes);
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

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
        <div className="bg-slate-800 p-1 rounded-lg flex border border-slate-700">
             <button
                onClick={() => { setMode('unicode'); setEncoded(''); setPlain(''); }}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all ${pill(mode === 'unicode')}`}
             >
                {t.unicodeMode}
             </button>
             <button
                onClick={() => { setMode('utf8'); setEncoded(''); setPlain(''); }}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all ${pill(mode === 'utf8')}`}
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
                  <CopyButton text={plain} title={t.copy} label={t.copy} iconClassName="w-3 h-3" className="text-slate-500 hover:text-primary-400 p-1 text-xs" />
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
                  <CopyButton text={encoded} title={t.copy} label={t.copy} iconClassName="w-3 h-3" className="text-slate-500 hover:text-primary-400 p-1 text-xs" />
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