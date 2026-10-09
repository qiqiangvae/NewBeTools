import React, { useState, useEffect } from 'react';
import { ToolComponentProps } from '../../types';
import CopyButton from './shared/CopyButton';
import { toHex } from './shared/hex';

interface PanelProps {
  label: string;
  copyText: string;
  copyLabel: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

const Panel: React.FC<PanelProps> = ({ label, copyText, copyLabel, className = '', bodyClassName = 'flex-1', children }) => {
  return (
    <div className={`flex flex-col min-h-0 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden ${className}`}>
      <div className="flex justify-between items-center px-4 py-2 bg-slate-800/50 border-b border-slate-700">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <CopyButton
          text={copyText}
          title={copyLabel}
          ariaLabel={copyLabel}
          iconClassName="w-3.5 h-3.5"
          className="text-slate-500 hover:text-primary-400 p-1"
        />
      </div>
      <div className={`overflow-auto p-4 ${bodyClassName}`}>{children}</div>
    </div>
  );
};

interface SignatureInfo {
  /** The signature segment exactly as it appears in the token. */
  raw: string;
  hex: string;
  bytes: number;
  /** false when the segment is not decodable base64url — it is still shown raw. */
  decodable: boolean;
}

/** The signature is only displayed, never verified: decode the base64url bytes for reading. */
const readSignature = (segment: string): SignatureInfo => {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  try {
    const bytes = Array.from(atob(padded), (c) => c.charCodeAt(0));
    return {
      raw: segment,
      hex: toHex(bytes, ' '),
      bytes: bytes.length,
      decodable: true,
    };
  } catch {
    return { raw: segment, hex: '', bytes: 0, decodable: false };
  }
};

const JwtDecoder: React.FC<ToolComponentProps> = ({ lang }) => {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState<any>(null);
  const [payload, setPayload] = useState<any>(null);
  const [signature, setSignature] = useState<SignatureInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = {
    title: lang === 'zh' ? 'JWT 解码' : 'JWT Decoder',
    ph: lang === 'zh' ? '在此粘贴 JWT Token...' : 'Paste JWT Token here...',
    header: lang === 'zh' ? 'Header (头部)' : 'Header',
    payload: lang === 'zh' ? 'Payload (载荷)' : 'Payload',
    signature: lang === 'zh' ? 'Signature (签名)' : 'Signature',
    sigBytes: lang === 'zh' ? '字节数' : 'Bytes',
    sigRaw: lang === 'zh' ? '原始 Base64URL 段' : 'Raw Base64URL segment',
    sigHex: lang === 'zh' ? '十六进制' : 'Hex',
    sigEmpty: lang === 'zh' ? '(空签名)' : '(empty signature)',
    sigNotBase64: lang === 'zh' ? '不是有效的 Base64URL 数据，原样展示。' : 'Not valid Base64URL data, shown as-is.',
    sigNote: lang === 'zh' ? '仅展示，未验证签名。' : 'Displayed only — signature is NOT verified.',
    invalid: lang === 'zh' ? '无效的 Token 格式' : 'Invalid Token Format',
    copy: lang === 'zh' ? '复制' : 'Copy',
    desc: lang === 'zh' ? '警告: 此工具仅在客户端解码，不验证签名。' : 'Warning: Decodes on client-side only. Signature is NOT verified.',
  };

  useEffect(() => {
    const clear = () => {
        setHeader(null);
        setPayload(null);
        setSignature(null);
    };

    if (!token.trim()) {
        clear();
        setError(null);
        return;
    }

    const parts = token.split('.');
    // 2 parts = signature segment absent; 3 = regular JWS. Anything else is not a JWT.
    if (parts.length < 2 || parts.length > 3) {
        clear();
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
        setSignature(parts.length === 3 ? readSignature(parts[2]) : null);
        setError(null);
    } catch (e) {
        clear();
        setError(t.invalid);
    }
  }, [token, t.invalid]);

  const sigCopyText = signature
    ? [signature.raw, signature.hex].filter(Boolean).join('\n')
    : '';

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
             aria-label={t.title}
             spellCheck={false}
             className={`w-full h-full bg-slate-800 text-slate-200 p-4 rounded-xl border focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono text-sm ${error ? 'border-red-500/50' : 'border-slate-700'}`}
          />
      </div>
      
      {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-900/30 px-4 py-2 rounded-lg">
              {error}
          </div>
      )}

      {(header || payload || signature) && (
          <div className="flex-1 flex flex-col gap-4 min-h-0">
              <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
                   {header && (
                       <Panel label={t.header} copyText={JSON.stringify(header, null, 2)} copyLabel={t.copy} className="flex-1">
                           <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap">{JSON.stringify(header, null, 2)}</pre>
                       </Panel>
                   )}
                   {payload && (
                       <Panel label={t.payload} copyText={JSON.stringify(payload, null, 2)} copyLabel={t.copy} className="flex-1">
                           <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap">{JSON.stringify(payload, null, 2)}</pre>
                       </Panel>
                   )}
              </div>

              {signature && (
                  <Panel
                      label={t.signature}
                      copyText={sigCopyText}
                      copyLabel={t.copy}
                      className="shrink-0"
                      bodyClassName="max-h-48"
                  >
                      <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.sigBytes}</span>
                              <span className="font-mono text-xs text-slate-300">{signature.bytes}</span>
                          </div>
                          <div>
                              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t.sigRaw}</div>
                              <pre className="font-mono text-xs text-amber-400 whitespace-pre-wrap break-all">{signature.raw || t.sigEmpty}</pre>
                          </div>
                          {signature.decodable ? (
                              signature.hex && (
                                  <div>
                                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t.sigHex}</div>
                                      <pre className="font-mono text-xs text-sky-400 whitespace-pre-wrap break-all">{signature.hex}</pre>
                                  </div>
                              )
                          ) : (
                              <p className="text-xs text-amber-500">{t.sigNotBase64}</p>
                          )}
                          <p className="text-xs text-slate-500">{t.sigNote}</p>
                      </div>
                  </Panel>
              )}
          </div>
      )}
    </div>
  );
};

export default JwtDecoder;
