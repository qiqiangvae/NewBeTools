import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ToolComponentProps } from '../../types';
import { IconJson, IconRefresh, IconX, IconYaml } from '../Icons';
import CopyButton from './shared/CopyButton';
import CodeEditor from './shared/CodeEditor';
import { ConvertMessage, ConvertOptions, DEFAULT_OPTIONS, Fmt, FORMATS, MessageKey, convert, isPairSupported, readInitialState, shownOutput } from './shared/convert';
import { highlightLang } from './shared/highlight';
import { pill } from './shared/pill';

/** highlight.js ships no CSV grammar in any version, so CSV panes stay plain text. */
const grammarFor = (format: Fmt): string | null => (format === 'csv' ? null : format);

const DELIMITERS = [
  { value: ',', label: ',' },
  { value: '\t', label: 'Tab' },
  { value: ';', label: ';' },
];

const DEFAULT_JSON = `{
  "name": "NewBeTools",
  "version": "0.2.0",
  "features": ["json", "yaml"],
  "settings": {
    "theme": "dark",
    "debug": false
  }
}`;

/** Switching sides must leave the two formats different, so picking the other one swaps. */
const FormatPills: React.FC<{
  label: string;
  active: Fmt;
  onPick: (next: Fmt) => void;
  /** Why this format cannot be picked right now, or null when it can. */
  unavailable: (format: Fmt) => string | null;
}> = ({ label, active, onPick, unavailable }) => (
  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
    <span className="text-xs font-semibold text-slate-500 uppercase px-1.5 hidden sm:inline-block">{label}</span>
    {FORMATS.map((format) => {
      const reason = unavailable(format);
      return (
        <button
          key={format}
          type="button"
          onClick={() => onPick(format)}
          disabled={!!reason}
          title={reason ?? undefined}
          aria-pressed={active === format}
          className={`px-3 py-1 text-xs sm:text-sm rounded-md transition-all ${pill(active === format)} ${reason ? 'opacity-30 cursor-not-allowed' : ''}`}
        >
          {format.toUpperCase()}
        </button>
      );
    })}
  </div>
);

const Check: React.FC<{
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-1.5 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="accent-primary-500"
    />
    {label}
  </label>
);

const SendButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  disabled: boolean;
  onClick: () => void;
}> = ({ icon, label, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-primary-500 hover:border-primary-500/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
  >
    {icon}
    {label}
  </button>
);

const FormatConverter: React.FC<ToolComponentProps> = ({
  lang = 'zh',
  state,
  onStateChange,
  onNavigateToTool,
}) => {
  // A hand-off sets `sourceFormat`; otherwise fall back to this tool's own memory.
  const [initial] = useState(() => readInitialState(state, DEFAULT_JSON));
  const [input, setInput] = useState<string>(initial.input);
  const [source, setSource] = useState<Fmt>(initial.source);
  const [target, setTarget] = useState<Fmt>(initial.target);
  const [settled, setSettled] = useState(input);
  const [lastGood, setLastGood] = useState<{ pair: string; text: string } | null>(null);
  const [options, setOptions] = useState<Required<ConvertOptions>>(DEFAULT_OPTIONS);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Converting on every keystroke would report errors for half-typed input.
  useEffect(() => {
    const timer = setTimeout(() => setSettled(input), 300);
    return () => clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    onStateChange?.({ input, source, target });
  }, [input, source, target, onStateChange]);

  const result = useMemo(() => convert(settled, source, target, options), [settled, source, target, options]);
  const pair = `${source}>${target}`;

  useEffect(() => {
    if (result.output !== null) setLastGood({ pair, text: result.output });
  }, [result, pair]);

  // A failure keeps the previous output; the pure rule owns the pair scoping.
  const output = shownOutput(result, lastGood, pair);
  const error = result.error;

  const pickSource = (next: Fmt) => {
    if (next === target) setTarget(source);
    setSource(next);
  };

  const pickTarget = (next: Fmt) => {
    if (next === source) setSource(target);
    setTarget(next);
  };

  const swap = () => {
    setSource(target);
    setTarget(source);
  };

  const jumpToError = () => {
    const element = textareaRef.current;
    if (!element || error?.line == null) return;
    const lines = input.split('\n');
    let position = 0;
    for (let i = 0; i < error.line - 1 && i < lines.length; i++) position += lines[i].length + 1;
    position += Math.max(0, (error.column ?? 1) - 1);
    element.focus();
    element.setSelectionRange(position, position + 1);
  };

  const t = {
    title: lang === 'zh' ? '数据格式转换' : 'Format Converter',
    sourceFormat: lang === 'zh' ? '源格式' : 'From',
    targetFormat: lang === 'zh' ? '目标格式' : 'To',
    swap: lang === 'zh' ? '交换源格式与目标格式' : 'Swap source and target',
    input: lang === 'zh' ? '输入' : 'Input',
    output: lang === 'zh' ? '输出' : 'Output',
    inputPlaceholder: lang === 'zh' ? '粘贴 JSON、YAML、TOML 或 CSV…' : 'Paste JSON, YAML, TOML or CSV…',
    outputPlaceholder: lang === 'zh' ? '转换结果会出现在这里' : 'The converted result appears here',
    copy: lang === 'zh' ? '复制' : 'Copy',
    copied: lang === 'zh' ? '已复制' : 'Copied',
    sendJson: lang === 'zh' ? '发送到 JSON 工具' : 'Send to JSON tool',
    sendYaml: lang === 'zh' ? '发送到 YAML 工具' : 'Send to YAML tool',
    jump: lang === 'zh' ? '跳到该行' : 'Jump to line',
    delimiter: lang === 'zh' ? '分隔符' : 'Delimiter',
    headerRow: lang === 'zh' ? '首行是表头' : 'First row is a header',
    inferTypes: lang === 'zh' ? '自动推断类型' : 'Infer types',
    excelCompat: lang === 'zh' ? 'Excel 兼容（CRLF + BOM）' : 'Excel compatible (CRLF + BOM)',
    pairUnsupported:
      lang === 'zh'
        ? 'CSV 读出来是「行的数组」，而 TOML 的文档根必须是一张表，这一对无法转换。'
        : 'CSV reads into an array of rows, but a TOML document root must be a table, so this pair cannot convert.',
    line: (n: number) => (lang === 'zh' ? `第 ${n} 行` : `Line ${n}`),
    column: (n: number) => (lang === 'zh' ? `第 ${n} 列` : `Column ${n}`),
  };

  /** Record keeps the two languages exhaustive: a new MessageKey fails the build until worded. */
  const messageText: Record<MessageKey, (count: number) => string> =
    lang === 'zh'
      ? {
          yamlMultiDoc: (count) => `检测到 ${count} 个 YAML 文档，本工具一次只转换一个。`,
          yamlEmpty: () => '没有找到 YAML 文档。',
          yamlCycle: () => '存在递归的 YAML 别名，JSON 无法表示。',
          aliasesExpanded: (count) => `YAML 别名已展开为 ${count} 处副本，& / * 的引用关系不会保留。`,
          csvRagged: (count) => `有 ${count} 行的列数与表头不一致，已按表头补齐或截断。`,
          csvDuplicateHeaders: (count) => `${count} 个重复的列名已自动改名。`,
          csvTypesInferred: (count) => `${count} 个单元格被推断成数字或布尔，前导零与尾随零会丢。`,
          csvNestedSerialized: (count) => `${count} 处嵌套值已序列化为 JSON 文本。`,
          csvTopLevel: () => '顶层必须是对象数组或二维数组，当前形状无法表示成 CSV。',
          tomlNullDropped: (count) => `TOML 无法表示 null，已丢弃 ${count} 个值。`,
          tomlTopLevel: () =>
            'TOML 的文档根必须是一张表；顶层数组或标量无法表示。可以把数据放进一个键下，例如 {"rows": [...]}。',
        }
      : {
          yamlMultiDoc: (count) => `Found ${count} YAML documents; this tool converts one at a time.`,
          yamlEmpty: () => 'No YAML document found.',
          yamlCycle: () => 'A recursive YAML alias cannot be expressed as JSON.',
          aliasesExpanded: (count) =>
            `YAML aliases were expanded into ${count} copies; the & / * link is not preserved.`,
          csvRagged: (count) =>
            `${count} rows did not match the header width and were padded or truncated.`,
          csvDuplicateHeaders: (count) => `${count} duplicate column names were renamed.`,
          csvTypesInferred: (count) =>
            `${count} cells were inferred as numbers or booleans; leading and trailing zeros are lost.`,
          csvNestedSerialized: (count) => `${count} nested values were written as JSON text.`,
          csvTopLevel: () =>
            'The top level must be an array of objects or a 2-D array; this shape cannot become CSV.',
          tomlNullDropped: (count) => `TOML cannot represent null, so ${count} values were dropped.`,
          tomlTopLevel: () =>
            'A TOML document root must be a table; a top-level array or scalar cannot be represented. Wrap the data in a key, for example {"rows": [...]}.',
        };

  const describe = (message: ConvertMessage) => messageText[message.key](message.count ?? 0);
  const errorText = error ? (error.rule ? describe(error.rule) : error.message) : '';
  const position = error?.line != null ? error.line : null;

  /** The one pair that can never work is hidden rather than reported after the fact. */
  const unavailableReason = (from: Fmt, to: Fmt): string | null =>
    isPairSupported(from, to) ? null : t.pairUnsupported;

  return (
    <div className="h-full flex flex-col gap-4 min-h-0">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 shrink-0">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t.title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <FormatPills
            label={t.sourceFormat}
            active={source}
            onPick={pickSource}
            unavailable={(format) => unavailableReason(format, target)}
          />
          <button
            type="button"
            onClick={swap}
            disabled={!isPairSupported(target, source)}
            title={isPairSupported(target, source) ? t.swap : t.pairUnsupported}
            aria-label={t.swap}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-primary-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-400"
          >
            <IconRefresh className="w-4 h-4" />
          </button>
          <FormatPills
            label={t.targetFormat}
            active={target}
            onPick={pickTarget}
            unavailable={(format) => unavailableReason(source, format)}
          />
        </div>
      </div>

      {(source === 'csv' || target === 'csv') && (
        <div className="flex flex-wrap items-center gap-4 shrink-0 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-medium">{t.delimiter}</span>
            <div className="flex bg-slate-800 p-0.5 rounded-md border border-slate-700">
              {DELIMITERS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setOptions({ ...options, delimiter: item.value })}
                  aria-pressed={options.delimiter === item.value}
                  className={`px-2 py-0.5 text-xs rounded transition-all ${pill(options.delimiter === item.value)}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          {source === 'csv' && (
            <>
              <Check
                label={t.headerRow}
                checked={options.headerRow}
                onChange={(next) => setOptions({ ...options, headerRow: next })}
              />
              <Check
                label={t.inferTypes}
                checked={options.inferTypes}
                onChange={(next) => setOptions({ ...options, inferTypes: next })}
              />
            </>
          )}
          {target === 'csv' && (
            <Check
              label={t.excelCompat}
              checked={options.excelCompat}
              onChange={(next) => setOptions({ ...options, excelCompat: next })}
            />
          )}
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
        <section className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{t.input}</label>
          </div>
          <div className="relative flex-1 min-h-0">
            <CodeEditor
              value={input}
              onChange={setInput}
              highlighted={highlightLang(input, grammarFor(source))}
              placeholder={t.inputPlaceholder}
              hasError={!!error}
              textareaRef={textareaRef}
              footer={
                error && (
                  <div className="absolute bottom-3 left-3 right-3 z-30 flex items-start gap-2 px-3 py-2 text-xs rounded-md bg-red-900/90 border border-red-700/60 text-red-100 shadow-lg backdrop-blur">
                    <IconX className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="flex-1">
                      {position != null && (
                        <span className="font-semibold mr-1">
                          {t.line(position)}
                          {error?.column != null ? ` / ${t.column(error.column)}` : ''}：
                        </span>
                      )}
                      {errorText}
                    </span>
                    {position != null && (
                      <button
                        type="button"
                        onClick={jumpToError}
                        className="shrink-0 underline hover:no-underline cursor-pointer"
                      >
                        {t.jump}
                      </button>
                    )}
                  </div>
                )
              }
            />
          </div>
        </section>

        <section className="flex-1 min-h-0 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 shrink-0">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{t.output}</label>
            <div className="flex flex-wrap items-center gap-2">
              <CopyButton
                text={output}
                title={t.copy}
                label={t.copy}
                copiedLabel={t.copied}
                iconClassName="w-3 h-3"
                className="text-slate-400 hover:text-primary-500 text-xs"
              />
              <SendButton
                icon={<IconJson className="w-3 h-3" />}
                label={t.sendJson}
                disabled={!output}
                onClick={() => onNavigateToTool?.('json-fmt', { input: output })}
              />
              <SendButton
                icon={<IconYaml className="w-3 h-3" />}
                label={t.sendYaml}
                disabled={!output}
                onClick={() => onNavigateToTool?.('yaml-fmt', { yamlInput: output })}
              />
            </div>
          </div>

          {result.notices.length > 0 && (
            <ul className="shrink-0 mb-2 space-y-1">
              {result.notices.map((notice) => (
                <li
                  key={notice.key}
                  className="flex items-start gap-1.5 text-xs px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300"
                >
                  <span className="shrink-0">⚠</span>
                  <span>{describe(notice)}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="relative flex-1 min-h-0">
            <CodeEditor
              value={output}
              onChange={() => {}}
              highlighted={highlightLang(output, grammarFor(target))}
              placeholder={t.outputPlaceholder}
              readOnly
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default FormatConverter;
