/** The active/idle class pair every pill and tab button shares. */
export const pill = (active: boolean): string =>
  active ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200';
