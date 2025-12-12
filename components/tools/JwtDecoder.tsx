import React, { useState, useEffect } from 'react';
import { IconCheck, IconCopy } from '../Icons';
import { ToolComponentProps } from '../../types';

const JwtDecoder: React.FC<ToolComponentProps> = ({ lang }) => {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState<any>(null);
  const [payload, setPayload] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const t = {
    title: lang === 'zh' ? 'JWT 解码' : 'JWT Decoder',
    ph: lang === 'zh' ? '在此粘贴 JWT Token...' : 'Paste JWT Token here...',
    header: lang === 'zh' ? 'Header (头部)' : 'Header',
    payload: lang === 'zh' ? 'Payload (载荷)' : 'Payload',
    invalid: lang === 'zh' ? '无效的 Token 格式' : 'Invalid Token Format',
    copy: lang === 'zh' ? '复制' : 'Copy',
    desc: lang === 'zh' ? '警告: 此工具仅在客户端解码，不验证签名。' : 'Warning: Decodes on client-side only. Signature is NOT verified.',
  };

  useEffect(() => {
    if (!token.trim()) {
        setHeader(null);
        setPayload(null);
        setError(null);
        return;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        setError(t.invalid);
        return;
    }

    try {
        const decode = (str: string) => {
            const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
            const json = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(json);
        };

        setHeader(decode(parts[0]));
        setPayload(decode(parts[1]));
        setError(null);
    } catch (e) {
        setError(t.invalid);
    }
  }, [token, t.invalid]);

  const JsonViewer = ({ data, label }: { data: any, label: string }) => {
      const [copied, setCopied] = useState(false);
      const text = JSON.stringify(data, null, 2);
      
      const handleCopy = () => {
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      };

      return (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-800/50 border-b border-slate-700">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                <button onClick={handleCopy} className="text-slate-500 hover:text-primary-400 transition-colors p-1">
                    {copied ? <IconCheck className="w-3.5 h-3.5"/> : <IconCopy className="w-3.5 h-3.5"/>}
                </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
                <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap">{text}</pre>
            </div>
        </div>
      );
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
          <p className="text-xs text-slate-500">{t.desc}</p>
      </div>

      <div className="h-32 shrink-0">
          <textarea
             value={token}
             onChange={(e) => setToken(e.target.value)}
             placeholder={t.ph}
             className={`w-full h-full bg-slate-800 text-slate-200 p-4 rounded-xl border focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono text-sm ${error ? 'border-red-500/50' : 'border-slate-700'}`}
          />
      </div>
      
      {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-900/30 px-4 py-2 rounded-lg">
              {error}
          </div>
      )}

      {(header || payload) && (
          <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
               {header && <JsonViewer data={header} label={t.header} />}
               {payload && <JsonViewer data={payload} label={t.payload} />}
          </div>
      )}
    </div>
  );
};

export default JwtDecoder;