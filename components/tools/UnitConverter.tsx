import React, { useState, useEffect } from 'react';

const CATEGORIES = {
  'Storage': {
    units: ['B', 'KB', 'MB', 'GB', 'TB', 'PB'],
    factor: 1024
  },
  'Time': {
    units: ['ms', 's', 'min', 'h', 'd', 'wk'],
    ratios: [1, 1000, 60000, 3600000, 86400000, 604800000] // Relative to ms
  },
  'Length': {
    units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
    ratios: [0.001, 0.01, 1, 1000, 0.0254, 0.3048, 0.9144, 1609.34] // Relative to meter
  }
};

const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<keyof typeof CATEGORIES>('Storage');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [value, setValue] = useState<number | string>(1);
  const [result, setResult] = useState<string>('');

  // Update units when category changes
  useEffect(() => {
    setFromUnit(CATEGORIES[category].units[0]);
    setToUnit(CATEGORIES[category].units[1] || CATEGORIES[category].units[0]);
  }, [category]);

  // Calculate
  useEffect(() => {
    const val = parseFloat(value.toString());
    if (isNaN(val)) {
        setResult('---');
        return;
    }

    let res = 0;
    const cat = CATEGORIES[category];

    if (category === 'Storage') {
        // Base 1024 logic
        const fromIdx = cat.units.indexOf(fromUnit);
        const toIdx = cat.units.indexOf(toUnit);
        const diff = fromIdx - toIdx;
        // Fix: Use 'any' cast to access 'factor' since TypeScript inference doesn't narrow 'cat' type automatically here
        res = val * Math.pow((cat as any).factor, diff);
    } else {
        // Ratio logic
        const r = cat as any;
        const fromRatio = r.ratios[r.units.indexOf(fromUnit)];
        const toRatio = r.ratios[r.units.indexOf(toUnit)];
        res = (val * fromRatio) / toRatio;
    }

    // Format
    setResult(res.toLocaleString(undefined, { maximumFractionDigits: 6 }));

  }, [value, fromUnit, toUnit, category]);

  return (
    <div className="flex flex-col gap-8 h-full">
      <h2 className="text-xl font-bold text-slate-100">Unit Converter</h2>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
         {Object.keys(CATEGORIES).map(c => (
            <button
                key={c}
                onClick={() => setCategory(c as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${category === c ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
            >
                {c}
            </button>
         ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-800 p-8 rounded-xl border border-slate-700">
         <div className="flex-1 w-full space-y-2">
            <label className="text-xs text-slate-500 uppercase font-semibold">From</label>
            <input 
                type="number" 
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-xl text-white outline-none focus:ring-2 focus:ring-primary-500"
            />
            <select 
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 outline-none"
            >
                {CATEGORIES[category].units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
         </div>

         <div className="text-slate-500 font-bold text-2xl">=</div>

         <div className="flex-1 w-full space-y-2">
            <label className="text-xs text-slate-500 uppercase font-semibold">To</label>
            <div className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-xl text-primary-400 font-mono overflow-hidden text-ellipsis">
                {result}
            </div>
             <select 
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 outline-none"
            >
                {CATEGORIES[category].units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
         </div>
      </div>
    </div>
  );
};

export default UnitConverter;