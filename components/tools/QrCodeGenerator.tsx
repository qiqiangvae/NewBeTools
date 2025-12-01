import React, { useState, useEffect, useRef } from 'react';
import { IconCopy, IconCheck } from '../Icons';

declare const QRCode: any;

const QrCodeGenerator: React.FC = () => {
  const [text, setText] = useState('https://ctool.dev');
  const qrRef = useRef<HTMLDivElement>(null);
  const [qrCodeObj, setQrCodeObj] = useState<any>(null);

  useEffect(() => {
    if (qrRef.current && typeof QRCode !== 'undefined') {
        // Clear previous
        qrRef.current.innerHTML = '';
        
        try {
            const qr = new QRCode(qrRef.current, {
                text: text || " ",
                width: 256,
                height: 256,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            setQrCodeObj(qr);
        } catch(e) {
            console.error("QR Error", e);
        }
    }
  }, []);

  useEffect(() => {
      if (qrCodeObj && text) {
          try {
            qrCodeObj.clear();
            qrCodeObj.makeCode(text);
          } catch(e) {}
      }
  }, [text, qrCodeObj]);

  return (
    <div className="flex flex-col gap-6 h-full items-center justify-center">
      <h2 className="text-xl font-bold text-slate-100 w-full text-left">QR Code Generator</h2>
      
      <div className="flex flex-col md:flex-row gap-8 items-start w-full">
         <div className="flex-1 w-full space-y-4">
             <label className="text-sm text-slate-400">Content / URL</label>
             <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text or URL"
                className="w-full h-32 bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
             />
         </div>

         <div className="w-full md:w-auto flex flex-col items-center gap-4 p-6 bg-slate-800 rounded-xl border border-slate-700 shadow-lg">
             <div ref={qrRef} className="p-4 bg-white rounded-lg" />
             <div className="text-slate-400 text-sm">Scan with your phone</div>
         </div>
      </div>
    </div>
  );
};

export default QrCodeGenerator;