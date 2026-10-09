import React, { useState, useEffect, useMemo, useRef } from 'react';
import { generateRegex } from '../../services/geminiService';
import { IconSparkles } from '../Icons';
import { escapeHtml, MAX_HIGHLIGHT_SIZE } from './shared/highlight';
import { ToolComponentProps } from '../../types';

/** Token colours for the highlighted layer behind the pattern input. */
const REGEX_TOKEN_CLASS = {
    charClass: 'text-amber-300',
    escape: 'text-rose-400',
    group: 'text-sky-400 font-semibold',
    quantifier: 'text-violet-400',
    anchor: 'text-emerald-400 font-semibold',
    alternation: 'text-amber-400 font-semibold',
} as const;

type RegexToken = keyof typeof REGEX_TOKEN_CLASS;

const GROUP_PREFIX = /^\(\?(?:[:=!]|<[^>]*>)/;
const QUANTIFIER_BRACE = /^\{\d+(?:,\d*)?\}/;

/** Colour the regex source's syntactic elements (escapes, classes, groups, quantifiers, anchors, alternation). */
const highlightPattern = (pattern: string): string => {
    if (pattern.length > MAX_HIGHLIGHT_SIZE) return escapeHtml(pattern);

    let html = '';
    let i = 0;
    const emit = (text: string, token?: RegexToken) => {
        const safe = escapeHtml(text);
        html += token ? `<span class="${REGEX_TOKEN_CLASS[token]}">${safe}</span>` : safe;
    };

    while (i < pattern.length) {
        const ch = pattern[i];
        if (ch === '\\') {
            emit(pattern.slice(i, i + 2), 'escape');
            i += 2;
        } else if (ch === '[') {
            let j = i + 1;
            while (j < pattern.length && pattern[j] !== ']') j += pattern[j] === '\\' ? 2 : 1;
            j = j < pattern.length ? j + 1 : pattern.length;
            emit(pattern.slice(i, j), 'charClass');
            i = j;
        } else if (ch === '(' || ch === ')') {
            const prefix = ch === '(' ? GROUP_PREFIX.exec(pattern.slice(i)) : null;
            const len = prefix ? prefix[0].length : 1;
            emit(pattern.slice(i, i + len), 'group');
            i += len;
        } else if (ch === '^' || ch === '$') {
            emit(ch, 'anchor');
            i += 1;
        } else if (ch === '|') {
            emit(ch, 'alternation');
            i += 1;
        } else if (ch === '*' || ch === '+' || ch === '?') {
            emit(ch, 'quantifier');
            i += 1;
        } else {
            const brace = ch === '{' ? QUANTIFIER_BRACE.exec(pattern.slice(i)) : null;
            if (brace) {
                emit(brace[0], 'quantifier');
                i += brace[0].length;
            } else {
                emit(ch);
                i += 1;
            }
        }
    }
    return html;
};

/** Identical metrics for the overlay <pre> and the real <input> so the two layers line up. */
const EDITOR_STYLES: React.CSSProperties = {
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    fontSize: '14px',
    lineHeight: '20px',
    padding: '12px',
    margin: 0,
    width: '100%',
    boxSizing: 'border-box',
    border: 'none',
    outline: 'none',
};

const COMMON_REGEXES = [
    { name: 'Email', regex: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'gm' },
    { name: 'URL', regex: 'https?:\\/\\/[\\w\\-\\.]+(?::\\d+)?(?:\\/.*)?', flags: 'gm' },
    { name: 'IPv4', regex: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'gm' },
    { name: 'Date (ISO)', regex: '\\d{4}-\\d{2}-\\d{2}', flags: 'gm' },
    { name: 'Hex Color', regex: '#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})', flags: 'gm' },
    { name: 'Password (Strong)', regex: '(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)[A-Za-z\\d]{8,}', flags: 'gm' },
    { name: 'Slug', regex: '^[a-z0-9]+(?:-[a-z0-9]+)*$', flags: 'gm' },
    { name: 'Chinese Phone', regex: '1[3-9]\\d{9}', flags: 'gm' },
    { name: 'ID Card (CN)', regex: '\\d{17}[\\dXx]', flags: 'gm' },
];

const RegexTester: React.FC<ToolComponentProps> = ({ lang }) => {
  const [regexStr, setRegexStr] = useState('');
  const [flags, setFlags] = useState('gm');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const patternInputRef = useRef<HTMLInputElement>(null);
  const patternPreRef = useRef<HTMLPreElement>(null);

  const t = {
    title: lang === 'zh' ? '正则测试' : 'Regex Tester',
    aiGen: lang === 'zh' ? 'AI 生成' : 'AI Generate',
    thinking: lang === 'zh' ? '思考中...' : 'Thinking...',
    testStr: lang === 'zh' ? '测试字符串' : 'Test String',
    matches: lang === 'zh' ? '匹配结果' : 'Matches',
    phExpr: lang === 'zh' ? '表达式...' : 'Expression...',
    phTest: lang === 'zh' ? '输入要匹配的文本...' : 'Insert text to match against...',
    noMatch: lang === 'zh' ? '无匹配结果' : 'No matches found.',
    prompt: lang === 'zh' ? '描述你想要匹配的内容:' : 'Describe what you want to match:',
    emptyMatch: lang === 'zh' ? '(空匹配)' : '(empty match)',
    index: lang === 'zh' ? '位置' : 'Idx',
    regexLabel: lang === 'zh' ? '正则表达式' : 'Regular expression',
    flagsLabel: lang === 'zh' ? '修饰符' : 'Flags',
    aiFailed: lang === 'zh' ? '生成失败：缺少 API Key 或请求出错，请稍后重试。' : 'Generation failed: missing API key or request error. Please try again.',
  };

  const highlightedPattern = useMemo(
    () => (regexStr ? highlightPattern(regexStr) : `<span class="text-slate-500">${escapeHtml(t.phExpr)}</span>`),
    [regexStr, t.phExpr]
  );

  /** Keep the highlighted layer in step with the input's horizontal scroll. */
  const syncPatternScroll = () => {
    if (patternInputRef.current && patternPreRef.current) {
      patternPreRef.current.scrollLeft = patternInputRef.current.scrollLeft;
    }
  };

  const handlePatternChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegexStr(e.target.value);
    requestAnimationFrame(syncPatternScroll);
  };

  useEffect(() => {
    if (!regexStr) {
        setMatches([]);
        setError(null);
        return;
    }
    try {
        const regex = new RegExp(regexStr, flags);
        const newMatches = [];
        let match;
        
        // Prevent infinite loops with global flag or empty matches
        if (!flags.includes('g')) {
             match = regex.exec(testString);
             if (match) newMatches.push(match);
        } else {
            let i = 0;
            // Limit iterations to prevent browser freeze on bad regex
            while ((match = regex.exec(testString)) !== null && i < 2000) {
                newMatches.push(match);
                if (match.index === regex.lastIndex) regex.lastIndex++; // Avoid infinite loop for zero-width matches
                i++;
            }
        }
        setMatches(newMatches);
        setError(null);
    } catch (e: any) {
        setError(e.message);
        setMatches([]);
    }
  }, [regexStr, flags, testString]);

  const handleAiGenerate = async () => {
      const userPrompt = window.prompt(t.prompt);
      if (!userPrompt) return;
      setIsGenerating(true);
      const res = await generateRegex(userPrompt);
      setIsGenerating(false);
      if (res === null) {
          setError(t.aiFailed);
          return;
      }
      // Try to extract regex part if it returns slashes
      const clean = res.replace(/^\/|\/[a-z]*$/g, ''); 
      setRegexStr(clean);
      setError(null);
  };

  const loadPreset = (preset: typeof COMMON_REGEXES[0]) => {
      setRegexStr(preset.regex);
      setFlags(preset.flags);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center flex-wrap gap-4">
         <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
         <button onClick={handleAiGenerate} className="flex items-center gap-2 text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors shadow">
            <IconSparkles className="w-4 h-4" />
            {isGenerating ? t.thinking : t.aiGen}
         </button>
      </div>

      {/* Common Presets */}
      <div className="flex flex-wrap gap-2">
          {COMMON_REGEXES.map(p => (
              <button 
                key={p.name} 
                onClick={() => loadPreset(p)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded text-xs transition-colors"
              >
                  {p.name}
              </button>
          ))}
      </div>

      <div className="flex flex-col gap-4 flex-1 min-h-0">
        <div className="flex gap-2 items-center">
             <style>{`
               .regex-editor { display: grid; grid-template-columns: 1fr; grid-template-rows: 1fr; }
               .regex-editor > pre, .regex-editor > input { grid-area: 1 / 1 / 2 / 2; width: 100%; }
               .regex-editor > pre { z-index: 1; pointer-events: none; user-select: none; white-space: pre; overflow: hidden; }
               .regex-editor > input { z-index: 2; background: transparent !important; color: transparent !important; -webkit-text-fill-color: transparent !important; caret-color: #fff !important; }
             `}</style>
             <span className="text-slate-400 font-mono text-lg">/</span>
             <div className={`regex-editor flex-1 min-w-0 bg-slate-800 rounded border overflow-hidden ${error ? 'border-red-500' : 'border-slate-700'} focus-within:ring-2 focus-within:ring-primary-500 transition-all`}>
                <pre
                   ref={patternPreRef}
                   aria-hidden="true"
                   style={EDITOR_STYLES}
                   className="text-slate-200"
                   dangerouslySetInnerHTML={{ __html: highlightedPattern }}
                />
                <input
                   ref={patternInputRef}
                   type="text"
                   value={regexStr}
                   onChange={handlePatternChange}
                   onScroll={syncPatternScroll}
                   onSelect={syncPatternScroll}
                   spellCheck={false}
                   aria-label={t.regexLabel}
                   style={EDITOR_STYLES}
                />
             </div>
             <span className="text-slate-400 font-mono text-lg">/</span>
             <input 
                type="text"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="gims"
                aria-label={t.flagsLabel}
                className="w-20 bg-slate-800 text-slate-200 p-3 rounded border border-slate-700 font-mono outline-none focus:ring-2 focus:ring-primary-500 transition-all text-center"
             />
        </div>
        {error && <div className="text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded border border-red-900/30">{error}</div>}

        <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
            <div className="flex-1 flex flex-col gap-2 min-h-[300px]">
                <label className="text-sm text-slate-400 uppercase font-bold tracking-wider">{t.testStr}</label>
                <textarea
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                    className="flex-1 w-full bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none font-mono text-sm leading-relaxed"
                    placeholder={t.phTest}
                />
            </div>

            <div className="flex-1 flex flex-col gap-2 min-h-[300px]">
                <div className="flex justify-between items-center">
                     <label className="text-sm text-slate-400 uppercase font-bold tracking-wider">{t.matches} ({matches.length})</label>
                </div>
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg overflow-auto font-mono text-sm p-2">
                    {matches.length > 0 ? (
                        <div className="space-y-3 p-2">
                            {matches.map((m, i) => (
                                <div key={i} className="bg-slate-800/50 rounded border border-slate-700/50 p-3 hover:bg-slate-800 transition-colors">
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="text-primary-400 font-bold flex gap-2">
                                            <span className="bg-slate-700 text-slate-300 px-1.5 rounded text-xs flex items-center h-5">#{i + 1}</span>
                                            {m[0] ? (
                                                <span className="break-all">{m[0]}</span>
                                            ) : (
                                                <span className="text-slate-500 italic text-xs py-0.5">{t.emptyMatch}</span>
                                            )}
                                        </div>
                                        <span className="text-slate-600 text-xs whitespace-nowrap ml-2">{t.index}: {m.index}</span>
                                    </div>
                                    
                                    {/* Capture Groups */}
                                    {m.length > 1 && (
                                        <div className="mt-2 pl-3 border-l-2 border-slate-700 space-y-1">
                                            {Array.from(m).slice(1).map((group, groupIdx) => (
                                                <div key={groupIdx} className="text-xs flex gap-2">
                                                    <span className="text-slate-500 font-semibold">G{groupIdx + 1}:</span>
                                                    <span className="text-green-400 break-all">{group !== undefined ? (group as string) : <i className="opacity-50">undefined</i>}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-600 italic">
                            {t.noMatch}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RegexTester;