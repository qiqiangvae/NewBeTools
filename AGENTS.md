## Agent skills

### Issue tracker

Issues are GitHub issues handled with the `gh` CLI. See `docs/agents/issue-tracker.md` before publishing a spec, fetching a ticket, or running triage.

### Triage labels

The five canonical role names, unchanged. See `docs/agents/triage-labels.md` before reading or applying a triage label.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/`, both created lazily at the root. See `docs/agents/domain.md` before naming a domain concept or opening an architecture question.

## Repo notes

- **Tool registry.** Adding a tool takes all three edits: the component in `components/tools/MyTool.tsx` typed `React.FC<ToolComponentProps>`, an import in `App.tsx`, and an entry in the `TOOLS` array in `App.tsx` holding `id`, `name`/`nameZh`, `description`/`descriptionZh`, `category`, an icon from `components/Icons.tsx`, `keywords`, and `component: <MyTool lang="en" />`. Miss the array entry and the tool never reaches the sidebar. That `component` value is a placeholder element: `App.tsx` re-renders it through `React.cloneElement`, injecting the live `lang`, `state`, `onStateChange`, and `onNavigateToTool`. `ToolDef.component` is typed `ReactElement<ToolComponentProps>`, so a component that cannot receive `lang` fails the typecheck.
- **Ids address state, but only for tools that opt in.** `App.tsx` keeps one blob per tool id in `toolStates`, written back by whichever tool is mounted and read through its `state` prop. Only tools that accept `state`/`onStateChange` keep their work across navigation — currently `JsonFormatter`, `YamlTool`, `TextProcessor` and `MortgageCalculator`; know which side of that line a new tool belongs on before claiming its input survives.
- **i18n is an inline ternary**, with no library: a component builds a local `t` object from `lang === 'zh' ? … : …`. Every user-visible string needs both languages, as do `nameZh` and `descriptionZh`.
- **Hand-offs travel as props.** `onNavigateToTool(targetId, payload)` switches tools and shallow-merges `payload` into the target's persisted state, which the target reads from its `state` prop. `JsonFormatter`, `YamlTool`, and `TextProcessor` are wired this way; route new hand-offs through the same pair.
- **Shared tool helpers live in `components/tools/shared/`.** `useCopy` (clipboard + copied flag), `CopyButton` (the one copy affordance: icon/label swap, `text` may be a `() => string` getter for text that is expensive to build), `pill` (active/idle tab classes), `hex` (`toHex`/`fromHex`/`textToHex`/`hexToText`), `highlight` (`escapeHtml`, `MAX_HIGHLIGHT_SIZE`) and `CodeEditor` (textarea over a highlighted `<pre>`, configured by an `EditorShell`). Add a copy button or a byte↔hex conversion there instead of re-writing one per tool.
- **App state is partly durable.** Language, theme and sidebar collapse persist in `localStorage` under `nbt.*`; the open tool is mirrored into the URL fragment (`#json-fmt`), so a tool can be linked to and survives a reload. Unknown fragments fall back to home.
- **Tailwind arrives by CDN**, not as a dependency: the `tailwindcss.com` script tag in `index.html`, with no `tailwind.config.js`. Add theme tokens and the `darkMode: 'class'` switch to the inline `tailwind.config` block there, which already carries `primary-500/600` and `slate-750` (the defaults need no restating), beside the styles in its `<style>` block — the opt-in `.no-scrollbar` class that the sidebar nav uses, since the repo has no stylesheet file.
- **Four libraries are consumed as page globals**, loaded from tags in `index.html`: `Diff` (jsdiff), `QRCode`, `jsonpath`, `hljs`. Each consuming file declares the one it uses — `declare const Diff: any;` in `TextDiff.tsx`.
- **The Gemini key is substituted at build time.** `services/geminiService.ts` reads `process.env.API_KEY`, which Vite's `define` fills from `GEMINI_API_KEY` in `.env` (copy `.env.example`). Every function it exports returns `Promise<string | null>`, where `null` means "no result" (missing key, an unusable request, or a failed call); the service holds no user-facing prose, so each caller renders its own localized failure.
- **Verify with `bun run typecheck && bun run build && bun run smoke`**, all clean on `main`; `vite build` bundles through esbuild without typechecking, and `scripts/smoke.tsx` is the only test-shaped file (a headless render of `App` asserting the tool grid and deep links). Note that `tsconfig.json` does not enable `strict`, so `tsc` will not catch a `null` whose caller treats it as a string.
- **Bun owns the lockfile** (`bun.lock`): `bun install`, `bun run dev` (port 3000), `bun run build`.
- **`migrated_prompt_history/` is an archive** of past session transcripts that no code references. Scope searches away from it: `rg -g '!migrated_prompt_history' …`.
