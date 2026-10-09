## Agent skills

### Issue tracker

Issues are GitHub issues handled with the `gh` CLI. See `docs/agents/issue-tracker.md` before publishing a spec, fetching a ticket, or running triage.

### Triage labels

The five canonical role names, unchanged. See `docs/agents/triage-labels.md` before reading or applying a triage label.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/`, both created lazily at the root. See `docs/agents/domain.md` before naming a domain concept or opening an architecture question.

## Repo notes

- **Tool registry.** Adding a tool takes all three edits: the component in `components/tools/MyTool.tsx` typed `React.FC<ToolComponentProps>`, an import in `App.tsx`, and an entry in the `TOOLS` array in `App.tsx` holding `id`, `name`/`nameZh`, `description`/`descriptionZh`, `category`, an icon from `components/Icons.tsx`, `keywords`, and `component: <MyTool lang="en" />`. Miss the array entry and the tool never reaches the sidebar. That `component` value is a placeholder element: `App.tsx` re-renders it through `React.cloneElement`, injecting the live `lang`, `state`, `onStateChange`, and `onNavigateToTool`.
- **Ids address state.** `toolStates` in `App.tsx` keeps one blob per tool id, so a tool's work survives navigating away and back.
- **i18n is an inline ternary**, with no library: a component builds a local `t` object from `lang === 'zh' ? … : …`. Every user-visible string needs both languages, as do `nameZh` and `descriptionZh`.
- **Hand-offs travel as props.** `onNavigateToTool(targetId, payload)` switches tools and shallow-merges `payload` into the target's persisted state, which the target reads from its `state` prop. `JsonFormatter`, `YamlTool`, and `TextProcessor` are wired this way; route new hand-offs through the same pair.
- **Tailwind arrives by CDN**, not as a dependency: the `tailwindcss.com` script tag in `index.html`, with no `tailwind.config.js`. Add theme tokens and the `darkMode: 'class'` switch to the inline `tailwind.config` block there, which already carries `primary-500/600` and `slate-750/850/900/950`, beside the global styles in its `<style>` block. The `<link href="/index.css">` names a file that does not exist; the build reports it and the browser 404s.
- **Four libraries are consumed as page globals**, loaded from tags in `index.html`: `Diff` (jsdiff), `QRCode`, `jsonpath`, `hljs`. Each consuming file declares the one it uses — `declare const Diff: any;` in `TextDiff.tsx`.
- **The Gemini key is substituted at build time.** `services/geminiService.ts` reads `process.env.API_KEY`, which Vite's `define` fills from `GEMINI_API_KEY` in `.env`. Without it the AI assistant shows its missing-key message.
- **Verify with `bunx tsc --noEmit && bun run build`**, both clean on `main`; `vite build` bundles through esbuild without typechecking, and the repo carries no test runner or linter.
- **Bun owns the lockfile** (`bun.lock`). The README's `npm install` steps and its React 18 and Tailwind-dependency claims are stale.
- **`migrated_prompt_history/` is an archive** of past session transcripts that no code references. Scope searches away from it: `rg -g '!migrated_prompt_history' …`.
