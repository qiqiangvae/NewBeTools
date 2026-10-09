import React, { useState, useEffect } from 'react';
import { ToolComponentProps } from '../../types';
import { pill } from './shared/pill';
import CopyButton from './shared/CopyButton';

const UrlConverter: React.FC<ToolComponentProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'convert' | 'parse'>('convert');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [parsedUrl, setParsedUrl] = useState<any>(null);

  const t = {
    title: lang === 'zh' ? 'URL 工具' : 'URL Tools',
    modeConvert: lang === 'zh' ? '编/解码' : 'Encoder/Decoder',
    modeParse: lang === 'zh' ? '解析器' : 'Parser',
    input: lang === 'zh' ? '输入' : 'Input',
    encode: lang === 'zh' ? '编码' : 'Encode',
    decode: lang === 'zh' ? '解码' : 'Decode',
    result: lang === 'zh' ? '结果' : 'Result',
    copy: lang === 'zh' ? '复制' : 'Copy',
    copied: lang === 'zh' ? '已复制' : 'Copied',
    phText: lang === 'zh' ? '输入 URL 或文本...' : 'Enter URL or text...',
    phUrl: lang === 'zh' ? 'https://example.com/path?query=123' : 'https://example.com/path?query=123',
    queryParams: lang === 'zh' ? '查询参数' : 'Query Params',
    resPlace: lang === 'zh' ? '结果将显示在这里...' : 'Result will appear here...',
    invalidUrl: lang === 'zh' ? '请输入有效的 URL 以解析。' : 'Enter a valid URL to parse its components.',
    errMalformed: lang === 'zh' ? '错误：URL 编码序列无效' : 'Error: Malformed URL sequence',
    // Parsed component labels
    protocol: lang === 'zh' ? '协议' : 'Protocol',
    host: lang === 'zh' ? '主机' : 'Host',
    port: lang === 'zh' ? '端口' : 'Port',
    path: lang === 'zh' ? '路径' : 'Path',
    query: lang === 'zh' ? '查询' : 'Query',
    hash: lang === 'zh' ? '锚点' : 'Hash',
  };

  // Convert Logic
  const handleProcess = (action: 'encode' | 'decode') => {
    if (!input) {
      setOutput('');
      return;
    }
    try {
      if (action === 'encode') {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch (e) {
      setOutput(t.errMalformed);
    }
  };

  // Parse Logic
  useEffect(() => {
    if (activeTab === 'parse' && input) {
        try {
            const url = new URL(input);
            const params = [...url.searchParams.entries()];

            setParsedUrl([
                { label: t.protocol, value: url.protocol },
                { label: t.host, value: url.hostname },
                { label: t.port, value: url.port },
                { label: t.path, value: url.pathname },
                { label: t.query, value: params.length ? params : null },
                { label: t.hash, value: url.hash }
            ]);
        } catch {
            setParsedUrl(null);
        }
    } else {
        setParsedUrl(null);
    }
  }, [input, activeTab, lang]);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
         <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
         <div className="bg-slate-800 p-1 rounded-lg flex border border-slate-700">
            <button 
                onClick={() => setActiveTab('convert')}
                className={`px-4 py-1.5 text-sm rounded-md transition-all ${pill(activeTab === 'convert')}`}
            >
                {t.modeConvert}
            </button>
            <button 
                onClick={() => setActiveTab('parse')}
                className={`px-4 py-1.5 text-sm rounded-md transition-all ${pill(activeTab === 'parse')}`}
            >
                {t.modeParse}
            </button>
         </div>
      </div>
      
      {activeTab === 'convert' ? (
        <>
            <div className="flex flex-col gap-2">
                <label className="text-slate-400 text-sm">{t.input}</label>
                <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.phText}
                className="h-32 bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono text-sm"
                />
            </div>

            <div className="flex gap-4">
                <button
                onClick={() => handleProcess('encode')}
                className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors"
                >
                {t.encode}
                </button>
                <button
                onClick={() => handleProcess('decode')}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                {t.decode}
                </button>
            </div>

            <div className="flex flex-col gap-2 flex-1">
                <div className="flex justify-between items-center">
                    <label className="text-slate-400 text-sm">{t.result}</label>
                    {output && (
                        <CopyButton
                            text={output}
                            title={t.copy}
                            label={t.copy}
                            copiedLabel={t.copied}
                            iconClassName="w-3 h-3"
                            className="text-primary-500 hover:text-primary-400 text-xs"
                        />
                    )}
                </div>
                <textarea
                readOnly
                value={output}
                placeholder={t.resPlace}
                className="flex-1 h-32 bg-slate-900 text-slate-200 p-4 rounded-lg border border-slate-700 outline-none resize-none font-mono text-sm"
                />
            </div>
        </>
      ) : (
        <div className="flex flex-col gap-4 flex-1">
             <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.phUrl}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none font-mono"
             />
             
             <div className="flex-1 bg-slate-900 rounded-lg border border-slate-800 p-6 overflow-auto">
                 {parsedUrl ? (
                     <div className="space-y-4">
                        {parsedUrl.map(({ label, value }: { label: string; value: any }) => {
                            if (!value) return null;
                            if (Array.isArray(value)) {
                                return (
                                    <div key={label}>
                                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">{t.queryParams}</div>
                                        <div className="bg-slate-800 rounded border border-slate-700 p-3 space-y-2">
                                            {value.map(([k, v]) => (
                                                <div key={k} className="flex gap-2">
                                                    <span className="text-primary-400 font-mono">{k}:</span>
                                                    <span className="text-green-400 font-mono break-all">{v as string}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return (
                                <div key={label} className="flex flex-col gap-1">
                                    <div className="text-xs text-slate-500 uppercase font-bold">{label}</div>
                                    <div className="font-mono text-slate-300 break-all">{value as string}</div>
                                </div>
                            );
                        })}
                     </div>
                 ) : (
                     <div className="text-slate-600 text-center mt-10 italic">
                         {t.invalidUrl}
                     </div>
                 )}
             </div>
        </div>
      )}
    </div>
  );
};

export default UrlConverter;