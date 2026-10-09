import React, { useState, useEffect } from 'react';
import { ToolComponentProps } from '../../types';
import CopyButton from './shared/CopyButton';
import { toHex } from './shared/hex';

/** Web Crypto has no MD5, so it is implemented here (RFC 1321). */
const MD5_SHIFTS = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
const MD5_K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0);

const md5Hex = (text: string): string => {
  const bytes = new TextEncoder().encode(text);
  const bitLength = bytes.length * 8;
  const padded = new Uint8Array((((bytes.length + 8) >> 6) + 1) * 64);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, bitLength >>> 0, true);
  view.setUint32(padded.length - 4, Math.floor(bitLength / 2 ** 32), true);

  const rotl = (x: number, n: number) => ((x << n) | (x >>> (32 - n))) >>> 0;
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  const m = new Uint32Array(16);

  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) m[i] = view.getUint32(offset + i * 4, true);

    let a = a0, b = b0, c = c0, d = d0;
    for (let i = 0; i < 64; i++) {
      let f: number, g: number;
      if (i < 16) { f = (b & c) | (~b & d); g = i; }
      else if (i < 32) { f = (d & b) | (~d & c); g = (5 * i + 1) % 16; }
      else if (i < 48) { f = b ^ c ^ d; g = (3 * i + 5) % 16; }
      else { f = c ^ (b | ~d); g = (7 * i) % 16; }
      const rotated = rotl((a + f + MD5_K[i] + m[g]) >>> 0, MD5_SHIFTS[(i >> 4) * 4 + (i % 4)]);
      [a, b, c, d] = [d, (b + rotated) >>> 0, b, c];
    }

    a0 = (a0 + a) >>> 0; b0 = (b0 + b) >>> 0; c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0;
  }

  const hex = (n: number) => [0, 8, 16, 24].map(s => ((n >>> s) & 0xff).toString(16).padStart(2, '0')).join('');
  return hex(a0) + hex(b0) + hex(c0) + hex(d0);
};

const ALGOS = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

const HashGenerator: React.FC<ToolComponentProps> = ({ lang }) => {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});

  useEffect(() => {
    const generateHashes = async () => {
      if (!input) {
        setHashes({});
        return;
      }
      const msgBuffer = new TextEncoder().encode(input);
      const newHashes: Record<string, string> = {};

      await Promise.all(ALGOS.map(async (algo) => {
        try {
            if (algo === 'MD5') {
                newHashes.MD5 = md5Hex(input);
                return;
            }
            const hashBuffer = await crypto.subtle.digest(algo, msgBuffer);
            newHashes[algo] = toHex(new Uint8Array(hashBuffer));
        } catch (error) {
            console.error(`Hashing failed for ${algo}`, error);
            newHashes[algo] = 'Error';
        }
      }));

      setHashes(newHashes);
    };

    generateHashes();
  }, [input]);

  return (
    <div className="flex flex-col gap-6 h-full">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-100">
            {lang === 'zh' ? '哈希生成器' : 'Hash Generator'}
        </h2>
      </div>

      <div className="flex flex-col gap-6">
        {/* Input Section */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-400 font-medium">
              {lang === 'zh' ? '输入文本' : 'Input Text'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={lang === 'zh' ? "输入要计算哈希的文本..." : "Enter text to hash..."}
            className="w-full h-24 bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono text-sm"
          />
        </div>

        {/* Results Section */}
        <div className="flex flex-col gap-4">
           {ALGOS.map(algo => (
               <div key={algo} className="flex flex-col gap-1">
                   <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">{algo}</label>
                   <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden group focus-within:ring-1 focus-within:ring-primary-500/50">
                       <input 
                           readOnly
                           value={hashes[algo] || ''}
                           placeholder="..."
                           className="flex-1 bg-transparent border-none text-slate-200 px-4 py-3 outline-none font-mono text-xs sm:text-sm text-green-400"
                       />
                       <div className="pr-2 bg-slate-900 flex items-center">
                           <CopyButton
                               text={hashes[algo]}
                               title={lang === 'zh' ? '复制' : 'Copy'}
                               disabled={!hashes[algo]}
                               className="text-slate-500 hover:text-primary-400 p-2"
                           />
                       </div>
                   </div>
               </div>
           ))}
           {!input && (
               <div className="text-center py-8 text-slate-600 italic text-sm">
                   {lang === 'zh' ? '输入文本以查看结果' : 'Start typing to see hash results'}
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default HashGenerator;
