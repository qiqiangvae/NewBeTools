import { describe, expect, test } from 'bun:test';
import { ConvertResult, convert, isPairSupported, readInitialState, shownOutput } from './convert';

describe('json -> yaml', () => {
  test('renders a plain object', () => {
    expect(convert('{"a":1}', 'json', 'yaml').output).toBe('a: 1\n');
  });

  test('keeps nested structure through a round trip', () => {
    const source = '{"a":[1,2],"b":{"c":true,"d":null}}';
    const toYaml = convert(source, 'json', 'yaml');
    expect(toYaml.error).toBeNull();
    const back = convert(toYaml.output as string, 'yaml', 'json');
    expect(JSON.parse(back.output as string)).toEqual({ a: [1, 2], b: { c: true, d: null } });
  });
});

describe('yaml -> json', () => {
  test('indents with two spaces', () => {
    expect(convert('a: 1', 'yaml', 'json').output).toBe('{\n  "a": 1\n}');
  });

  test('leaves timestamps and yes/no as strings, and only true/false as booleans', () => {
    const value = JSON.parse(
      convert('d: 2001-12-15T02:59:43.1Z\nb: yes\nt: true', 'yaml', 'json').output as string,
    );
    expect(value).toEqual({ d: '2001-12-15T02:59:43.1Z', b: 'yes', t: true });
  });
});

describe('refusals', () => {
  test('rejects a multi-document stream and says how many documents there were', () => {
    const result = convert('a: 1\n---\nb: 2', 'yaml', 'json');
    expect(result.output).toBeNull();
    expect(result.error).toEqual({ rule: { key: 'yamlMultiDoc', count: 2 } });
  });

  test('reports a YAML syntax error with the parser position', () => {
    const result = convert('a: "unterminated', 'yaml', 'json');
    expect(result.output).toBeNull();
    expect(typeof result.error?.message).toBe('string');
    expect(result.error?.line).toBeGreaterThan(0);
  });

  test('reports a JSON syntax error', () => {
    const result = convert('{"a":}', 'json', 'yaml');
    expect(result.output).toBeNull();
    expect(result.error?.message).toBeTruthy();
  });

  test('refuses a recursive alias, which JSON cannot express at all', () => {
    const result = convert('a: &x\n  b: *x', 'yaml', 'json');
    expect(result.output).toBeNull();
    expect(result.error).toEqual({ rule: { key: 'yamlCycle' } });
  });

  test('refuses a comment-only document instead of inventing null', () => {
    const result = convert('# nothing here', 'yaml', 'json');
    expect(result.output).toBeNull();
    expect(result.error?.rule?.key).toBe('yamlEmpty');
  });
});

describe('notices', () => {
  test('reports YAML aliases expanded into copies', () => {
    const result = convert('base: &b\n  x: 1\nuse: *b', 'yaml', 'json');
    expect(result.notices).toEqual([{ key: 'aliasesExpanded', count: 1 }]);
    expect(JSON.parse(result.output as string)).toEqual({ base: { x: 1 }, use: { x: 1 } });
  });
});

describe('empty input', () => {
  test('yields empty output with no error, so a cleared box is not an error', () => {
    expect(convert('   \n', 'json', 'yaml')).toEqual({ output: '', notices: [], error: null });
  });
});

describe('which output the pane shows', () => {
  const ok = (text: string): ConvertResult => ({ output: text, notices: [], error: null });
  const failed: ConvertResult = { output: null, notices: [], error: { message: 'boom' } };

  test('a fresh result wins over the last good one', () => {
    expect(shownOutput(ok('new'), { pair: 'json>yaml', text: 'old' }, 'json>yaml')).toBe('new');
  });

  test('a failure keeps the last good output for the same pair of formats', () => {
    expect(shownOutput(failed, { pair: 'json>yaml', text: 'old' }, 'json>yaml')).toBe('old');
  });

  test('a failure drops it once the pair changed, so a YAML result cannot show as JSON', () => {
    expect(shownOutput(failed, { pair: 'json>yaml', text: 'old' }, 'json>toml')).toBe('');
  });
});

describe('what the tool opens with', () => {
  test('a JSON hand-off sets the source format', () => {
    expect(readInitialState({ input: '{"a":1}', sourceFormat: 'json' }, 'sample')).toEqual({
      input: '{"a":1}',
      source: 'json',
      target: 'yaml',
    });
  });

  test('a YAML hand-off keeps text that does not even parse', () => {
    const opened = readInitialState({ input: 'a: [', sourceFormat: 'yaml' }, 'sample');
    expect(opened.input).toBe('a: [');
    expect(opened.source).toBe('yaml');
  });

  test('the hand-off outranks the source this tool remembered', () => {
    expect(readInitialState({ source: 'json', sourceFormat: 'yaml' }, 'sample').source).toBe('yaml');
  });

  test('with nothing remembered it opens on the sample and the defaults', () => {
    expect(readInitialState(undefined, 'sample')).toEqual({ input: 'sample', source: 'json', target: 'yaml' });
  });

  test('never opens with both sides on the same format, whatever the stored blob says', () => {
    const opened = readInitialState({ source: 'json', target: 'json' }, 'sample');
    expect(opened.source).not.toBe(opened.target);
    expect(opened.target).toBe('yaml');
  });
});

describe('the one pair that can never convert', () => {
  test('CSV to TOML is impossible; every other combination is allowed', () => {
    expect(isPairSupported('csv', 'toml')).toBe(false);
    expect(isPairSupported('toml', 'csv')).toBe(true);
    expect(isPairSupported('csv', 'json')).toBe(true);
    expect(isPairSupported('json', 'toml')).toBe(true);
    expect(isPairSupported('yaml', 'toml')).toBe(true);
  });

  test('a stored blob holding that pair is repaired on open', () => {
    // A session saved before this rule existed can hold exactly this.
    expect(readInitialState({ source: 'csv', target: 'toml' }, 'sample').target).toBe('json');
  });

  test('a pair that only some data breaks is left alone, since parsing has to decide', () => {
    expect(readInitialState({ source: 'json', target: 'toml' }, 'sample').target).toBe('toml');
  });
});

describe('csv -> json', () => {
  test('uses the first row as column names by default', () => {
    expect(JSON.parse(convert('a,b\n1,2', 'csv', 'json').output as string)).toEqual([{ a: '1', b: '2' }]);
  });

  test('keeps every cell a string unless inference is asked for', () => {
    const result = convert('n,b,z\n1,true,007', 'csv', 'json');
    expect(JSON.parse(result.output as string)).toEqual([{ n: '1', b: 'true', z: '007' }]);
    expect(result.notices).toEqual([]);
  });

  test('infers numbers and booleans when asked, and reports what was retyped', () => {
    const result = convert('n,b,z\n1,true,007', 'csv', 'json', { inferTypes: true });
    expect(JSON.parse(result.output as string)).toEqual([{ n: 1, b: true, z: 7 }]);
    expect(result.notices).toEqual([{ key: 'csvTypesInferred', count: 3 }]);
  });

  test('without a header row it yields rows of arrays', () => {
    const result = convert('a,b\n1,2', 'csv', 'json', { headerRow: false });
    expect(JSON.parse(result.output as string)).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  test('names blank header cells positionally', () => {
    expect(JSON.parse(convert(',b\n1,2', 'csv', 'json').output as string)).toEqual([{ col1: '1', b: '2' }]);
  });

  test('renames duplicate column names instead of dropping a column', () => {
    const result = convert('a,a\n1,2', 'csv', 'json');
    expect(JSON.parse(result.output as string)).toEqual([{ a: '1', a_2: '2' }]);
    expect(result.notices).toEqual([{ key: 'csvDuplicateHeaders', count: 1 }]);
  });

  test('pads a short row and truncates a long one, warning about both', () => {
    const short = convert('a,b\n1', 'csv', 'json');
    expect(JSON.parse(short.output as string)).toEqual([{ a: '1', b: '' }]);
    expect(short.notices).toEqual([{ key: 'csvRagged', count: 1 }]);

    const long = convert('a,b\n1,2,3', 'csv', 'json');
    expect(JSON.parse(long.output as string)).toEqual([{ a: '1', b: '2' }]);
    expect(long.notices).toEqual([{ key: 'csvRagged', count: 1 }]);
  });

  test('reads quoting, embedded delimiters and embedded newlines', () => {
    const result = convert('"a,b","c""d","line1\nline2"', 'csv', 'json', { headerRow: false });
    expect(JSON.parse(result.output as string)).toEqual([['a,b', 'c"d', 'line1\nline2']]);
  });

  test('honours the delimiter, so the same text can be TSV', () => {
    const result = convert('a\tb\n1\t2', 'csv', 'json', { delimiter: '\t' });
    expect(JSON.parse(result.output as string)).toEqual([{ a: '1', b: '2' }]);
  });

  test('leaves an empty cell empty even with inference on', () => {
    const result = convert('a,b\n,true', 'csv', 'json', { inferTypes: true });
    expect(JSON.parse(result.output as string)).toEqual([{ a: '', b: true }]);
  });
});

describe('json -> csv', () => {
  test('takes the union of the keys as the header', () => {
    expect(convert('[{"a":1,"b":"x"},{"a":2}]', 'json', 'csv').output).toBe('a,b\n1,x\n2,');
  });

  test('writes a two-dimensional array without inventing a header', () => {
    expect(convert('[["a","b"],["1","2"]]', 'json', 'csv').output).toBe('a,b\n1,2');
  });

  test('quotes only the cells that need it', () => {
    expect(convert('[["a,b","plain"]]', 'json', 'csv').output).toBe('"a,b",plain');
  });

  test('serializes nested values into JSON text and says how many', () => {
    const result = convert('[{"a":{"x":1},"b":[1,2]}]', 'json', 'csv');
    expect(result.output).toBe('a,b\n"{""x"":1}","[1,2]"');
    expect(result.notices).toEqual([{ key: 'csvNestedSerialized', count: 2 }]);
  });

  test('a single object becomes one row', () => {
    expect(convert('{"a":1,"b":2}', 'json', 'csv').output).toBe('a,b\n1,2');
  });

  test('refuses a scalar or a flat array of scalars', () => {
    expect(convert('42', 'json', 'csv').error).toEqual({ rule: { key: 'csvTopLevel' } });
    expect(convert('[1,2,3]', 'json', 'csv').error).toEqual({ rule: { key: 'csvTopLevel' } });
  });

  test('Excel compatibility means CRLF plus a BOM', () => {
    const output = convert('[["a"],["1"]]', 'json', 'csv', { excelCompat: true }).output as string;
    expect(output).toBe('\ufeffa\r\n1');
  });
});

describe('toml', () => {
  test('reads tables and arrays of tables into the same shapes as the other formats', () => {
    const result = convert('a = 1\n[t]\nb = "x"\n[[rows]]\nc = 2\n[[rows]]\nc = 3', 'toml', 'json');
    expect(JSON.parse(result.output as string)).toEqual({
      a: 1,
      t: { b: 'x' },
      rows: [{ c: 2 }, { c: 3 }],
    });
  });

  test('keeps a native date native when the target is YAML', () => {
    // The TOML reader hands back a Date subclass, so YAML receives a real timestamp.
    expect(convert('d = 1979-05-27T07:32:00Z', 'toml', 'yaml').output).toBe(
      'd: 1979-05-27T07:32:00.000Z\n',
    );
  });

  test('turns that same date into a readable ISO string for JSON', () => {
    const value = JSON.parse(convert('d = 1979-05-27T07:32:00Z', 'toml', 'json').output as string);
    expect(value).toEqual({ d: '1979-05-27T07:32:00.000Z' });
  });

  test('does not guess that a date-shaped string is a date', () => {
    expect(convert('{"d":"1979-05-27"}', 'json', 'toml').output).toBe('d = "1979-05-27"\n');
  });

  test('drops nulls and counts them, because TOML has no null', () => {
    const result = convert('{"a":null,"b":1}', 'json', 'toml');
    expect(result.output).toBe('b = 1\n');
    expect(result.notices).toEqual([{ key: 'tomlNullDropped', count: 1 }]);
  });

  test('drops nulls inside arrays too, where the writer would otherwise throw', () => {
    const result = convert('{"a":[1,null,2]}', 'json', 'toml');
    expect(result.output).toBe('a = [ 1, 2 ]\n');
    expect(result.notices).toEqual([{ key: 'tomlNullDropped', count: 1 }]);
  });

  test('refuses a top level that is not a table, instead of surfacing a TypeError', () => {
    expect(convert('[1,2]', 'json', 'toml')).toEqual({
      output: null,
      notices: [],
      error: { rule: { key: 'tomlTopLevel' } },
    });
    expect(convert('5', 'json', 'toml').error).toEqual({ rule: { key: 'tomlTopLevel' } });
    expect(convert('null', 'json', 'toml').error).toEqual({ rule: { key: 'tomlTopLevel' } });
  });

  test('reports a TOML syntax error with its position', () => {
    const result = convert('a = [1,\n2', 'toml', 'json');
    expect(result.output).toBeNull();
    expect(result.error?.line).toBe(2);
    expect(result.error?.column).toBe(2);
  });

  test('writes a table or an array of tables out as TOML', () => {
    expect(convert('{"a":1,"b":2}', 'json', 'toml').output).toBe('a = 1\nb = 2\n');
    expect(convert('{"rows":[{"a":1}]}', 'json', 'toml').output).toBe('[[rows]]\na = 1\n');
  });

  test('a table-shaped CSV is still an array of rows, so it needs a key to become TOML', () => {
    // Settled contract: no invented key names. A bare array is not a TOML document.
    expect(convert('a,b\n1,2', 'csv', 'toml').error).toEqual({ rule: { key: 'tomlTopLevel' } });
    expect(convert('a = 1\nb = 2', 'toml', 'csv').output).toBe('a,b\n1,2');
  });
});
