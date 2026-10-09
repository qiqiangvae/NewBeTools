/**
 * The pure core of the format converter. Everything parses into a JS value and
 * serializes out of it, so N formats cost 2N paths instead of N².
 *
 * The pivot stays in memory: only the JSON *target* serializes to JSON text. A
 * detour through JSON.stringify/parse would strip class-based values (TOML's
 * dates, for one) and silently change their type.
 *
 * A third-party library is used for CSV only as a tokenizer (RFC 4180 quoting,
 * embedded delimiters and newlines). Every mapping decision in here — headers,
 * column naming, ragged rows, types — is ours, because that is where the tool's
 * contract lives and it is what the tests pin down.
 *
 * Nothing here holds user-facing prose — `MessageKey` and parser messages are
 * rendered by the component, which owns the two languages.
 */
import * as yaml from 'js-yaml';
import * as toml from 'smol-toml';
import Papa from 'papaparse';

export type Fmt = 'json' | 'yaml' | 'toml' | 'csv';

/** Formats the tool offers, in the order the pills render them. */
export const FORMATS: readonly Fmt[] = ['json', 'yaml', 'toml', 'csv'];

export interface ConvertOptions {
  /** CSV field separator; TSV is just a tab here. */
  delimiter?: string;
  /** CSV sources: treat the first row as column names. */
  headerRow?: boolean;
  /** CSV sources: turn numeric/boolean-looking cells into real types. */
  inferTypes?: boolean;
  /** CSV targets: CRLF line endings plus a UTF-8 BOM, so Excel reads non-ASCII. */
  excelCompat?: boolean;
}

export const DEFAULT_OPTIONS: Required<ConvertOptions> = {
  delimiter: ',',
  headerRow: true,
  inferTypes: false,
  excelCompat: false,
};

/** Messages we author; the component supplies the wording. */
export type MessageKey =
  | 'yamlMultiDoc'
  | 'yamlEmpty'
  | 'yamlCycle'
  | 'aliasesExpanded'
  | 'csvRagged'
  | 'csvDuplicateHeaders'
  | 'csvTypesInferred'
  | 'csvNestedSerialized'
  | 'csvTopLevel'
  | 'tomlNullDropped'
  | 'tomlTopLevel';

export interface ConvertMessage {
  key: MessageKey;
  /** How many things were counted, for messages that report a number. */
  count?: number;
}

export interface ConvertError {
  /** A parser's own syntax message, shown verbatim. */
  message?: string;
  /** A violation of our rules, worded by the caller. */
  rule?: ConvertMessage;
  line?: number;
  column?: number;
}

export interface ConvertResult {
  /** null means this input does not convert; callers keep their last good output. */
  output: string | null;
  notices: ConvertMessage[];
  error: ConvertError | null;
}

const DUMP_OPTIONS = { indent: 2, noRefs: true, lineWidth: -1 } as const;

const lineColAt = (text: string, position: number) => {
  const lines = text.slice(0, Math.min(position, text.length)).split('\n');
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
};

/** V8 reports "… at position 12 (line 2 column 3)"; older engines only the position. */
const jsonError = (err: unknown, text: string): ConvertError => {
  const message = err instanceof Error ? err.message : String(err);
  const at = /at position (\d+)(?: \(line (\d+) column (\d+)\))?/.exec(message);
  if (!at) return { message };
  if (at[2]) return { message, line: Number(at[2]), column: Number(at[3]) };
  return { message, ...lineColAt(text, Number(at[1])) };
};

/** YAMLException carries a 0-based `mark` and a multi-line message with a code excerpt. */
const yamlError = (err: any): ConvertError => {
  const raw = err?.message ? String(err.message) : 'Invalid YAML';
  const line = typeof err?.mark?.line === 'number' ? err.mark.line + 1 : undefined;
  const column = typeof err?.mark?.column === 'number' ? err.mark.column + 1 : undefined;
  return { message: raw.split('\n')[0], line, column };
};

/** TomlError carries 1-based `line`/`column`; its message starts with a summary. */
const tomlError = (err: any): ConvertError => {
  const message = err?.message ? String(err.message).split('\n')[0] : 'Invalid TOML';
  const line = typeof err?.line === 'number' ? err.line : undefined;
  const column = typeof err?.column === 'number' ? err.column : undefined;
  return { message, line, column };
};

/** True for the plain objects and arrays we may rewrite — but never for a Date. */
const isContainer = (value: unknown): boolean =>
  Array.isArray(value) ||
  (!!value &&
    typeof value === 'object' &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null));

const isTable = (value: unknown): boolean =>
  !!value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);

/**
 * TOML has no `null`: drop such entries and count them. Arrays cannot merely lose
 * the value at write time — the TOML writer throws on a null element — so this
 * walks the whole graph. Dates are passed through untouched, prototype and all,
 * because that is what keeps `TOML -> YAML` a native timestamp.
 */
const stripNulls = (value: unknown): { value: unknown; dropped: number } => {
  if (Array.isArray(value)) {
    let dropped = 0;
    const kept: unknown[] = [];
    value.forEach((item) => {
      if (item === null || item === undefined) {
        dropped += 1;
        return;
      }
      const inner = stripNulls(item);
      kept.push(inner.value);
      dropped += inner.dropped;
    });
    return { value: kept, dropped };
  }

  if (isContainer(value)) {
    let dropped = 0;
    const out: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
      if (item === null || item === undefined) {
        dropped += 1;
        return;
      }
      const inner = stripNulls(item);
      out[key] = inner.value;
      dropped += inner.dropped;
    });
    return { value: out, dropped };
  }

  return { value, dropped: 0 };
};

/**
 * Aliases survive `load` as shared objects but not as JSON text, and a recursive
 * alias cannot become JSON at all. One walk reports both.
 */
const inspectSharing = (value: unknown) => {
  const seen = new Set<object>();
  const counted = new Set<object>();
  let shared = 0;
  let cyclic = false;

  const walk = (node: unknown, ancestors: Set<object>) => {
    if (!node || typeof node !== 'object') return;
    const obj = node as object;
    if (ancestors.has(obj)) {
      cyclic = true;
      return;
    }
    if (seen.has(obj)) {
      if (!counted.has(obj)) {
        counted.add(obj);
        shared += 1;
      }
      return;
    }
    seen.add(obj);
    ancestors.add(obj);
    Object.values(obj as Record<string, unknown>).forEach((child) => walk(child, ancestors));
    ancestors.delete(obj);
  };

  walk(value, new Set());
  return { shared, cyclic };
};

// --- CSV ---------------------------------------------------------------

/** Field counts that do not match the table shape, and how many cells were typed. */
interface CsvShape {
  rows: string[][];
}

const readCsv = (text: string, options: Required<ConvertOptions>): CsvShape => {
  const parsed = Papa.parse<string[]>(text, {
    delimiter: options.delimiter,
    header: false,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
  });
  return { rows: (parsed.data ?? []) as unknown as string[][] };
};

/** Column names: blanks get a positional name, repeats get a suffix instead of losing data. */
const nameColumns = (header: string[]) => {
  const names: string[] = [];
  const used = new Map<string, number>();
  let duplicates = 0;

  header.forEach((cell, index) => {
    const base = cell.trim() === '' ? `col${index + 1}` : cell;
    const seen = used.get(base) ?? 0;
    if (seen === 0) {
      used.set(base, 1);
      names.push(base);
      return;
    }
    duplicates += 1;
    let suffix = seen + 1;
    let candidate = `${base}_${suffix}`;
    while (used.has(candidate)) {
      suffix += 1;
      candidate = `${base}_${suffix}`;
    }
    used.set(candidate, 1);
    used.set(base, suffix);
    names.push(candidate);
  });

  return { names, duplicates };
};

/** CSV cells carry no type: only an explicit inference turns `007` into 7. */
const inferCell = (cell: string): unknown => {
  const text = cell.trim();
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (text !== '' && Number.isFinite(Number(text))) return Number(text);
  return cell;
};

const readValue = (input: string, options: Required<ConvertOptions>) => {
  const { rows } = readCsv(input, options);
  const notices: ConvertMessage[] = [];
  const width = rows.reduce((max, row) => Math.max(max, row.length), 0);

  if (!options.headerRow) {
    const ragged = rows.filter((row) => row.length !== width).length;
    if (ragged) notices.push({ key: 'csvRagged', count: ragged });
    const value = rows.map((row) => Array.from({ length: width }, (_, i) => row[i] ?? ''));
    return { value, notices };
  }

  const header = rows[0] ?? [];
  const { names, duplicates } = nameColumns(header);
  if (duplicates) notices.push({ key: 'csvDuplicateHeaders', count: duplicates });

  // Rows that do not line up with the header are padded or truncated, never dropped.
  const ragged = rows.slice(1).filter((row) => row.length !== names.length).length;
  if (ragged) notices.push({ key: 'csvRagged', count: ragged });

  let inferred = 0;
  const value = rows.slice(1).map((row) => {
    const record: Record<string, unknown> = {};
    names.forEach((name, index) => {
      const cell = row[index] ?? '';
      const typed = options.inferTypes ? inferCell(cell) : cell;
      if (typed !== cell) inferred += 1;
      record[name] = typed;
    });
    return record;
  });
  if (inferred) notices.push({ key: 'csvTypesInferred', count: inferred });

  return { value, notices };
};

const writeCsv = (
  value: unknown,
  options: Required<ConvertOptions>,
): { output: string; notices: ConvertMessage[] } | { error: ConvertError } => {
  const notices: ConvertMessage[] = [];
  const rows = Array.isArray(value) ? value : [value];
  if (rows.length === 0) return { output: '', notices };

  const isObject = (row: unknown) => !!row && typeof row === 'object' && !Array.isArray(row);
  const records = rows.every(isObject);
  const grid = rows.every(Array.isArray);

  if (!records && !grid) return { error: { rule: { key: 'csvTopLevel' } } };

  let table: unknown[][];
  if (records) {
    const header: string[] = [];
    rows.forEach((row) => {
      Object.keys(row as Record<string, unknown>).forEach((key) => {
        if (!header.includes(key)) header.push(key);
      });
    });

    let nested = 0;
    const body = rows.map((row) =>
      header.map((key) => {
        const cell = (row as Record<string, unknown>)[key];
        if (cell instanceof Date) return cell.toISOString();
        if (cell !== null && typeof cell === 'object') {
          nested += 1;
          return JSON.stringify(cell);
        }
        return cell === null || cell === undefined ? '' : String(cell);
      }),
    );
    if (nested) notices.push({ key: 'csvNestedSerialized', count: nested });
    table = [header, ...body];
  } else {
    table = rows as unknown[][];
  }

  const body = Papa.unparse(table as any[], {
    delimiter: options.delimiter,
    newline: options.excelCompat ? '\r\n' : '\n',
    quotes: false,
    header: false,
  });

  return { output: options.excelCompat ? `\ufeff${body}` : body, notices };
};

// --- entry points ------------------------------------------------------

/**
 * What the output pane shows: a fresh result wins, otherwise the previous output
 * is kept — but only while the format pair is unchanged, so a YAML result never
 * lingers in a pane that has since become JSON.
 */
export const shownOutput = (
  result: ConvertResult,
  previous: { pair: string; text: string } | null,
  pair: string,
): string => result.output ?? (previous?.pair === pair ? previous.text : '');

export interface InitialState {
  input: string;
  source: Fmt;
  target: Fmt;
}

/**
 * CSV always reads into an array of rows and a TOML document root must be a table,
 * so that one direction can never work — the UI hides it rather than reporting it
 * after the fact. Every other pair is only shape-dependent, which cannot be known
 * before parsing, so those keep their own error.
 */
export const isPairSupported = (from: Fmt, to: Fmt): boolean => !(from === 'csv' && to === 'toml');

/** The first target that both differs from the source and can actually convert. */
const defaultTargetFor = (source: Fmt): Fmt =>
  FORMATS.find((format) => format !== source && isPairSupported(source, format)) ?? source;

/**
 * What the tool opens with. Another tool's hand-off arrives as `sourceFormat` plus
 * `input` and is a one-shot signal, so it outranks this tool's own remembered
 * `source`; unusable values fall back to the defaults. Handed-over text is kept
 * verbatim even when it does not parse — the converter reports that itself.
 */
export const readInitialState = (state: any, fallbackInput: string): InitialState => {
  const pick = (candidate: unknown, fallback: Fmt): Fmt =>
    FORMATS.includes(candidate as Fmt) ? (candidate as Fmt) : fallback;

  const source = pick(state?.sourceFormat, pick(state?.source, 'json'));
  const rememberedTarget = pick(state?.target, 'yaml');

  return {
    input: typeof state?.input === 'string' ? state.input : fallbackInput,
    source,
    // A stray blob must not open on two identical pills, nor on a pair that can
    // never convert — a session stored before this rule existed can hold both.
    target:
      rememberedTarget === source || !isPairSupported(source, rememberedTarget)
        ? defaultTargetFor(source)
        : rememberedTarget,
  };
};

export const convert = (
  input: string,
  from: Fmt,
  to: Fmt,
  options: ConvertOptions = {},
): ConvertResult => {
  const opts: Required<ConvertOptions> = { ...DEFAULT_OPTIONS, ...options };
  if (!input.trim()) return { output: '', notices: [], error: null };
  if (from === to) return { output: input, notices: [], error: null };

  let notices: ConvertMessage[] = [];
  let value: unknown;

  if (from === 'json') {
    try {
      value = JSON.parse(input);
    } catch (err) {
      return { output: null, notices, error: jsonError(err, input) };
    }
  } else if (from === 'yaml') {
    let documents: unknown[];
    try {
      documents = yaml.loadAll(input);
    } catch (err) {
      return { output: null, notices, error: yamlError(err) };
    }
    if (documents.length === 0) {
      return { output: null, notices, error: { rule: { key: 'yamlEmpty' } } };
    }
    if (documents.length > 1) {
      return {
        output: null,
        notices,
        error: { rule: { key: 'yamlMultiDoc', count: documents.length } },
      };
    }

    value = documents[0];
    const { shared, cyclic } = inspectSharing(value);
    if (cyclic) return { output: null, notices, error: { rule: { key: 'yamlCycle' } } };
    if (shared) notices.push({ key: 'aliasesExpanded', count: shared });
  } else if (from === 'toml') {
    try {
      value = toml.parse(input);
    } catch (err) {
      return { output: null, notices, error: tomlError(err) };
    }
  } else {
    const read = readValue(input, opts);
    value = read.value;
    notices = read.notices;
  }

  try {
    if (to === 'csv') {
      const written = writeCsv(value, opts);
      if ('error' in written) return { output: null, notices, error: written.error };
      return {
        output: written.output,
        notices: [...notices, ...written.notices],
        error: null,
      };
    }
    if (to === 'toml') {
      const stripped = stripNulls(value);
      if (stripped.dropped) notices.push({ key: 'tomlNullDropped', count: stripped.dropped });
      if (!isTable(stripped.value)) {
        return { output: null, notices, error: { rule: { key: 'tomlTopLevel' } } };
      }
      return { output: toml.stringify(stripped.value), notices, error: null };
    }
    if (to === 'json') {
      return { output: JSON.stringify(value, null, 2) ?? 'null', notices, error: null };
    }
    return { output: yaml.dump(value, DUMP_OPTIONS), notices, error: null };
  } catch (err) {
    return {
      output: null,
      notices,
      error: { message: err instanceof Error ? err.message : String(err) },
    };
  }
};
