import React, { useMemo, useState } from 'react';
import { ToolComponentProps } from '../../types';
import { pill } from './shared/pill';
import CopyButton from './shared/CopyButton';
import { textToHex, hexToText } from './shared/hex';

const CHARSET_62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

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

// Parsed data URL. Returns null unless the payload is well-formed base64,
// so a stray "data:..." string is never treated as a file.
const parseDataUrl = (input: string) => {
  const match = /^data:([^,]*),([\s\S]*)$/.exec(input.trim());
  if (!match) return null;
  const [, meta, rawPayload] = match;
  if (!/;base64$/i.test(meta)) return null;
  const payload = rawPayload.replace(/\s+/g, '');
  if (!payload || payload.length % 4 === 1 || !/^[A-Za-z0-9+/]+={0,2}$/.test(payload)) return null;
  const mime = meta.split(';')[0] || 'application/octet-stream';
  const padding = (payload.match(/=+$/) || [''])[0].length;
  return {
    href: `data:${mime};base64,${payload}`,
    mime,
    bytes: Math.floor((payload.length * 3) / 4) - padding,
    ext: (mime.split('/')[1] || 'bin').split('+')[0].replace(/[^a-z0-9]/gi, '') || 'bin',
  };
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const Base64Converter: React.FC<ToolComponentProps> = ({ lang }) => {
  const [text, setText] = useState('');
  const [encoded, setEncoded] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [format, setFormat] = useState<'base64' | 'base62'>('base64');
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
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
    errRead: lang === 'zh' ? '文件读取失败' : 'Could not read that file',
    errDataUrl: lang === 'zh' ? '数据 URL 无效，或载荷不是 Base64' : 'Invalid data URL, or payload is not Base64',
    chooseFile: lang === 'zh' ? '选择文件' : 'Choose file',
    dropHint: lang === 'zh' ? '或把图片/文件拖到输入框' : 'or drop an image/file onto an input box',
    fileLabel: lang === 'zh' ? '文件' : 'File',
    preview: lang === 'zh' ? '图片预览' : 'Image preview',
    download: lang === 'zh' ? '下载文件' : 'Download file',
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
          // A data URL is the encoded form of a file, not decodable text
          if (input.trim().toLowerCase().startsWith('data:')) {
            if (parseDataUrl(input)) setText('');
            else setError(t.errDataUrl);
            return;
          }
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

  // File -> data URL, kept in the encoded box so copy/download keep working
  const loadFile = (picked?: File | null) => {
    if (!picked) return;
    const reader = new FileReader();
    reader.onload = () => {
      setError(null);
      setFileName(picked.name);
      setText('');
      setEncoded(String(reader.result ?? ''));
      setMode('decode');
    };
    reader.onerror = () => setError(t.errRead);
    try {
      reader.readAsDataURL(picked);
    } catch {
      setError(t.errRead);
    }
  };

  const dropProps: React.DOMAttributes<HTMLTextAreaElement> =
    format === 'base64'
      ? {
          onDragOver: (e) => {
            e.preventDefault();
            setDragging(true);
          },
          onDragLeave: () => setDragging(false),
          onDrop: (e) => {
            e.preventDefault();
            setDragging(false);
            loadFile(e.dataTransfer?.files?.[0]);
          },
        }
      : {};

  // Data URL -> file: preview for images, download anchor for anything
  const file = useMemo(() => (format === 'base64' ? parseDataUrl(encoded) : null), [format, encoded]);
  const downloadName = file
    ? `${fileName ? fileName.replace(/\.[^.]+$/, '') : 'base64-file'}.${file.ext}`
    : '';

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
                    className={`px-3 py-1 text-xs sm:text-sm rounded-md transition-all ${pill(format === 'base64')}`}
                >
                    Base64
                </button>
                <button
                    onClick={() => handleFormatChange('base62')}
                    className={`px-3 py-1 text-xs sm:text-sm rounded-md transition-all ${pill(format === 'base62')}`}
                >
                    Base62
                </button>
            </div>

            {/* Mode Switcher */}
            <div className="bg-slate-800 p-1 rounded-lg flex border border-slate-700">
                <button
                    onClick={() => { setMode('encode'); if(text) handleConvert(text, 'encode', format); }}
                    className={`px-4 py-1.5 text-sm rounded-md transition-all ${pill(mode === 'encode')}`}
                >
                    {t.encode}
                </button>
                <button
                    onClick={() => { setMode('decode'); if(encoded) handleConvert(encoded, 'decode', format); }}
                    className={`px-4 py-1.5 text-sm rounded-md transition-all ${pill(mode === 'decode')}`}
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
             <CopyButton
               text={text}
               title={t.copy}
               label={t.copy}
               copiedLabel={t.copied}
               iconClassName="w-3 h-3"
               className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary-500 text-xs"
             />
           </div>
           <textarea
             value={text}
             onChange={(e) => handleInputChange(e.target.value, 'text')}
             readOnly={mode === 'decode'}
             placeholder={t.placeholderPlain}
             title={t.dropHint}
             {...dropProps}
             className={`w-full h-32 bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono ${mode === 'decode' ? 'opacity-75 cursor-not-allowed' : ''} ${dragging ? 'border-primary-500 ring-2 ring-primary-500' : ''}`}
           />
        </div>

        {/* Encoded Output Section */}
        <div className="relative group">
           <div className="flex justify-between items-center mb-2">
             <label className="text-sm font-medium text-slate-300">{t.encoded}</label>
             <div className="flex items-center gap-3">
               {format === 'base64' && (
                 <label className="cursor-pointer text-xs text-slate-400 hover:text-primary-500">
                   {t.chooseFile}
                   <input
                     type="file"
                     className="hidden"
                     onChange={(e) => {
                       loadFile(e.target.files?.[0]);
                       e.target.value = '';
                     }}
                   />
                 </label>
               )}
               <CopyButton
                 text={encoded}
                 title={t.copy}
                 label={t.copy}
                 copiedLabel={t.copied}
                 iconClassName="w-3 h-3"
                 className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary-500 text-xs"
               />
             </div>
           </div>
           <textarea
             value={encoded}
             onChange={(e) => handleInputChange(e.target.value, 'encoded')}
             readOnly={mode === 'encode'}
             placeholder={t.placeholderEncoded}
             title={t.dropHint}
             {...dropProps}
             className={`w-full h-32 bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono ${mode === 'encode' ? 'opacity-75 cursor-not-allowed' : ''} ${dragging ? 'border-primary-500 ring-2 ring-primary-500' : ''} ${error ? 'border-red-500' : ''}`}
           />
           {error && <div className="absolute bottom-4 right-4 text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded">{error}</div>}
        </div>

        {/* Data URL -> file */}
        {file && (
          <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
            <div className="text-xs text-slate-400 font-mono">
              {t.fileLabel}: {file.mime} · {formatBytes(file.bytes)}
            </div>
            {file.mime.startsWith('image/') && (
              <img src={file.href} alt={t.preview} className="max-h-32 rounded border border-slate-700" />
            )}
            <a
              href={file.href}
              download={downloadName}
              className="ml-auto px-3 py-1.5 text-xs sm:text-sm rounded-md bg-primary-600 text-white hover:bg-primary-500 transition-colors"
            >
              {t.download}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Base64Converter;
