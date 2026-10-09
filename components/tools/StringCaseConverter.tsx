import React, { useState } from 'react';
import { Lang, ToolComponentProps } from '../../types';
import CopyButton from './shared/CopyButton';

type CaseType = 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'lower' | 'upper' | 'sentence';

const CASES: CaseType[] = ['camel', 'pascal', 'snake', 'kebab', 'constant', 'sentence', 'lower', 'upper'];

const CASE_LABELS: Record<Lang, Record<CaseType, string>> = {
  en: {
    camel: 'camelCase',
    pascal: 'PascalCase',
    snake: 'snake_case',
    kebab: 'kebab-case',
    constant: 'CONSTANT_CASE',
    sentence: 'Sentence case',
    lower: 'lowercase',
    upper: 'UPPERCASE',
  },
  zh: {
    camel: 'camelCase',
    pascal: 'PascalCase',
    snake: 'snake_case',
    kebab: 'kebab-case',
    constant: 'CONSTANT_CASE',
    sentence: '句首大写',
    lower: '全小写',
    upper: '全大写',
  },
};

const transform = (text: string, type: CaseType): string => {
  if (!text) return '';
  const words = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) || [];

  switch (type) {
    case 'camel':
      return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'pascal':
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'snake':
      return words.map(w => w.toLowerCase()).join('_');
    case 'kebab':
      return words.map(w => w.toLowerCase()).join('-');
    case 'constant':
      return words.map(w => w.toUpperCase()).join('_');
    case 'lower':
      return text.toLowerCase();
    case 'upper':
      return text.toUpperCase();
    case 'sentence':
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
};

const OutputRow = ({ label, value, copyTitle }: { label: string; value: string; copyTitle: string }) => {
  return (
    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700">
      <div className="flex flex-col overflow-hidden">
          <span className="text-xs text-slate-500 uppercase font-semibold">{label}</span>
          <span className="text-slate-200 font-mono text-sm truncate pr-4">{value || '...'}</span>
      </div>
      <CopyButton text={value} title={copyTitle} className="text-slate-500 hover:text-primary-400 p-1" resetMs={1500} />
    </div>
  );
};

const StringCaseConverter: React.FC<ToolComponentProps> = ({ lang }) => {
  const [input, setInput] = useState('');

  const t = {
    title: lang === 'zh' ? '变量名转换' : 'Variable Name Converter',
    input: lang === 'zh' ? '输入文本' : 'Input Text',
    placeholder: lang === 'zh' ? '在此输入变量名（如 myVariableName）' : 'Type your variable name here (e.g. myVariableName)',
    copy: lang === 'zh' ? '复制' : 'Copy',
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
      
      <div>
        <label className="text-sm text-slate-400 mb-2 block">{t.input}</label>
        <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className="w-full bg-slate-800 text-slate-200 p-4 rounded-xl border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none text-lg font-mono"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CASES.map(caseType => (
              <OutputRow
                  key={caseType}
                  label={CASE_LABELS[lang][caseType]}
                  value={transform(input, caseType)}
                  copyTitle={t.copy}
              />
          ))}
      </div>
    </div>
  );
};

export default StringCaseConverter;
