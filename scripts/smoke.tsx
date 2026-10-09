/**
 * Headless render smoke check: `bun run smoke`.
 *
 * The repo has no test runner, and `tsc`/`vite build` cannot catch a broken tool
 * grid, so this renders App to static markup and asserts the three things that
 * would silently break it: the home grid, a deep link, and an unknown hash.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import App from '../App';

const store = new Map<string, string>();
const g = globalThis as any;
g.localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, v),
};
g.document = { documentElement: { classList: { toggle: () => {} }, lang: '' } };
g.window = {
  location: { hash: '', pathname: '/', search: '' },
  matchMedia: () => ({ matches: false }),
  addEventListener: () => {},
  removeEventListener: () => {},
  history: { replaceState: () => {} },
};
store.set('nbt.lang', 'en'); // assert against the English copy

const render = (hash: string) => {
  g.window.location.hash = hash;
  return renderToStaticMarkup(React.createElement(App));
};

let failed = false;
const check = (ok: boolean, label: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`);
  if (!ok) failed = true;
};

const home = render('');
check(!home.includes('role="button"'), 'home grid cards are real <button> elements');
check(/<button[^>]*class="[^"]*rounded-lg p-3/.test(home), 'tool cards keep the card styling');
check(home.includes('JSON Formatter') && home.includes('YAML Tool'), 'tool names render');
check(render('#json-fmt').includes('Tree Viewer'), 'deep link #json-fmt opens the JSON tool');
check(render('#nope').includes('Developer Utilities Hub'), 'unknown hash falls back to home');

process.exit(failed ? 1 : 0);
