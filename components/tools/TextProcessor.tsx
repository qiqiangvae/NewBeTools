import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { IconCopy, IconCheck, IconType, IconZap, IconUndo, IconChevronDown, IconMarkdown, IconCode } from '../Icons';
import { ToolComponentProps } from '../../types';

// Access global hljs objects from CDN
declare const hljs: any;

interface MarkdownTheme {
  id: string;
  name: string;
  nameZh: string;
  isDark: boolean;
  bg: string;
  text: string;
  h1: string;
  h2: string;
  h3: string;
  link: string;
  blockquote: string;
  codeInline: string;
  codeBlockBg: string;
  border: string;
  hr: string;
  tableTh: string;
  tableTd: string;
}

const THEMES: MarkdownTheme[] = [
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    nameZh: 'GitHub 暗黑',
    isDark: true,
    bg: 'bg-[#0d1117]',
    text: 'text-[#c9d1d9]',
    h1: 'text-[#f0f6fc] border-b border-[#21262d] pb-2 text-2xl font-semibold',
    h2: 'text-[#f0f6fc] border-b border-[#21262d] pb-1.5 text-xl font-semibold',
    h3: 'text-[#f0f6fc] text-lg font-semibold',
    link: 'text-[#58a6ff] hover:underline',
    blockquote: 'border-l-4 border-[#30363d] pl-4 text-[#8b949e] italic',
    codeInline: 'bg-[#161b22] text-[#e6edf3] px-1.5 py-0.5 rounded font-mono text-xs',
    codeBlockBg: 'bg-[#161b22] border border-[#30363d]',
    border: 'border-[#30363d]',
    hr: 'border-[#30363d] my-6',
    tableTh: 'bg-[#161b22] border border-[#30363d] px-4 py-2 font-semibold text-[#f0f6fc] text-left',
    tableTd: 'border border-[#30363d] px-4 py-2 text-[#c9d1d9]'
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    nameZh: 'GitHub 明亮',
    isDark: false,
    bg: 'bg-white',
    text: 'text-slate-800',
    h1: 'text-slate-900 border-b border-slate-200 pb-2 text-2xl font-semibold',
    h2: 'text-slate-900 border-b border-slate-200 pb-1.5 text-xl font-semibold',
    h3: 'text-slate-900 text-lg font-semibold',
    link: 'text-blue-600 hover:underline',
    blockquote: 'border-l-4 border-slate-200 pl-4 text-slate-500 italic',
    codeInline: 'bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-xs',
    codeBlockBg: 'bg-slate-50 border border-slate-200',
    border: 'border-slate-200',
    hr: 'border-slate-200 my-6',
    tableTh: 'bg-slate-100 border border-slate-200 px-4 py-2 font-semibold text-slate-900 text-left',
    tableTd: 'border border-slate-200 px-4 py-2 text-slate-800'
  },
  {
    id: 'dracula',
    name: 'Dracula',
    nameZh: '吸血鬼 (Dracula)',
    isDark: true,
    bg: 'bg-[#282a36]',
    text: 'text-[#f8f8f2]',
    h1: 'text-[#ff79c6] border-b border-[#44475a] pb-2 text-2xl font-semibold',
    h2: 'text-[#8be9fd] border-b border-[#44475a] pb-1.5 text-xl font-semibold',
    h3: 'text-[#50fa7b] text-lg font-semibold',
    link: 'text-[#ffb86c] hover:underline',
    blockquote: 'border-l-4 border-[#6272a4] pl-4 text-[#6272a4] italic',
    codeInline: 'bg-[#191a21] text-[#f1fa8c] px-1.5 py-0.5 rounded font-mono text-xs',
    codeBlockBg: 'bg-[#191a21] border border-[#44475a]',
    border: 'border-[#44475a]',
    hr: 'border-[#44475a] my-6',
    tableTh: 'bg-[#191a21] border border-[#44475a] px-4 py-2 font-semibold text-[#8be9fd] text-left',
    tableTd: 'border border-[#44475a] px-4 py-2 text-[#f8f8f2]'
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    nameZh: '护眼日光 (Solarized)',
    isDark: false,
    bg: 'bg-[#fdf6e3]',
    text: 'text-[#586e75]',
    h1: 'text-[#cb4b16] border-b border-[#eee8d5] pb-2 text-2xl font-semibold',
    h2: 'text-[#268bd2] border-b border-[#eee8d5] pb-1.5 text-xl font-semibold',
    h3: 'text-[#b58900] text-lg font-semibold',
    link: 'text-[#2aa198] hover:underline',
    blockquote: 'border-l-4 border-[#93a1a1] pl-4 text-[#93a1a1] italic',
    codeInline: 'bg-[#eee8d5] text-[#d33682] px-1.5 py-0.5 rounded font-mono text-xs',
    codeBlockBg: 'bg-[#eee8d5] border border-[#e4dcbf]',
    border: 'border-[#eee8d5]',
    hr: 'border-[#eee8d5] my-6',
    tableTh: 'bg-[#eee8d5] border border-[#eee8d5] px-4 py-2 font-semibold text-[#586e75] text-left',
    tableTd: 'border border-[#eee8d5] px-4 py-2 text-[#586e75]'
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    nameZh: '护眼深邃 (Solarized)',
    isDark: true,
    bg: 'bg-[#002b36]',
    text: 'text-[#839496]',
    h1: 'text-[#cb4b16] border-b border-[#073642] pb-2 text-2xl font-semibold',
    h2: 'text-[#268bd2] border-b border-[#073642] pb-1.5 text-xl font-semibold',
    h3: 'text-[#b58900] text-lg font-semibold',
    link: 'text-[#2aa198] hover:underline',
    blockquote: 'border-l-4 border-[#586e75] pl-4 text-[#586e75] italic',
    codeInline: 'bg-[#073642] text-[#d33682] px-1.5 py-0.5 rounded font-mono text-xs',
    codeBlockBg: 'bg-[#073642] border border-[#586e75]',
    border: 'border-[#073642]',
    hr: 'border-[#073642] my-6',
    tableTh: 'bg-[#073642] border border-[#073642] px-4 py-2 font-semibold text-[#839496] text-left',
    tableTd: 'border border-[#073642] px-4 py-2 text-[#839496]'
  },
  {
    id: 'nord',
    name: 'Nord',
    nameZh: '极光冰川 (Nord)',
    isDark: true,
    bg: 'bg-[#2e3440]',
    text: 'text-[#d8dee9]',
    h1: 'text-[#88c0d0] border-b border-[#3b4252] pb-2 text-2xl font-semibold',
    h2: 'text-[#81a1c1] border-b border-[#3b4252] pb-1.5 text-xl font-semibold',
    h3: 'text-[#8fbcbb] text-lg font-semibold',
    link: 'text-[#b48ead] hover:underline',
    blockquote: 'border-l-4 border-[#4c566a] pl-4 text-[#4c566a] italic',
    codeInline: 'bg-[#3b4252] text-[#ebcb8b] px-1.5 py-0.5 rounded font-mono text-xs',
    codeBlockBg: 'bg-[#3b4252] border border-[#4c566a]',
    border: 'border-[#3b4252]',
    hr: 'border-[#3b4252] my-6',
    tableTh: 'bg-[#3b4252] border border-[#3b4252] px-4 py-2 font-semibold text-[#88c0d0] text-left',
    tableTd: 'border border-[#3b4252] px-4 py-2 text-[#d8dee9]'
  },
  {
    id: 'one-dark',
    name: 'One Dark',
    nameZh: '雅致深灰 (One Dark)',
    isDark: true,
    bg: 'bg-[#282c34]',
    text: 'text-[#abb2bf]',
    h1: 'text-[#e06c75] border-b border-[#3e4451] pb-2 text-2xl font-semibold',
    h2: 'text-[#61afef] border-b border-[#3e4451] pb-1.5 text-xl font-semibold',
    h3: 'text-[#98c379] text-lg font-semibold',
    link: 'text-[#56b6c2] hover:underline',
    blockquote: 'border-l-4 border-[#5c6370] pl-4 text-[#5c6370] italic',
    codeInline: 'bg-[#21252b] text-[#d19a66] px-1.5 py-0.5 rounded font-mono text-xs',
    codeBlockBg: 'bg-[#21252b] border border-[#3e4451]',
    border: 'border-[#3e4451]',
    hr: 'border-[#3e4451] my-6',
    tableTh: 'bg-[#21252b] border border-[#3e4451] px-4 py-2 font-semibold text-[#61afef] text-left',
    tableTd: 'border border-[#3e4451] px-4 py-2 text-[#abb2bf]'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    nameZh: '赛博朋克 (Cyberpunk)',
    isDark: true,
    bg: 'bg-[#0f051d]',
    text: 'text-[#00ffcc]',
    h1: 'text-[#ff007f] border-b border-[#330066] pb-2 text-2xl font-bold tracking-wider uppercase',
    h2: 'text-[#00ffff] border-b border-[#330066] pb-1.5 text-xl font-bold tracking-wide',
    h3: 'text-[#ffff00] text-lg font-semibold',
    link: 'text-[#ff00ff] hover:underline font-bold',
    blockquote: 'border-l-4 border-[#ff007f] pl-4 text-[#ffff00] italic bg-[#330066]/30 py-2 pr-2 rounded-r',
    codeInline: 'bg-[#1a0033] text-[#ff00ff] px-1.5 py-0.5 border border-[#330066] rounded font-mono text-xs',
    codeBlockBg: 'bg-[#1a0033] border border-[#330066]',
    border: 'border-[#330066]',
    hr: 'border-[#ff007f]/50 my-6',
    tableTh: 'bg-[#1a0033] border border-[#330066] px-4 py-2 font-semibold text-[#ffff00] text-left uppercase',
    tableTd: 'border border-[#330066] px-4 py-2 text-[#00ffcc]'
  },
  {
    id: 'sepia',
    name: 'Sepia Book',
    nameZh: '复古书香 (Sepia)',
    isDark: false,
    bg: 'bg-[#f4ecd8]',
    text: 'text-[#433422]',
    h1: 'text-[#5c2d12] border-b border-[#e4d7b7] pb-2 text-2xl font-serif font-bold',
    h2: 'text-[#5c2d12] border-b border-[#e4d7b7] pb-1.5 text-xl font-serif font-bold',
    h3: 'text-[#7c4424] text-lg font-serif font-bold',
    link: 'text-[#8c5a3c] hover:underline',
    blockquote: 'border-l-4 border-[#c8b48c] pl-4 text-[#7c644c] italic',
    codeInline: 'bg-[#eae1c8] text-[#904010] px-1.5 py-0.5 rounded font-mono text-xs',
    codeBlockBg: 'bg-[#eae1c8] border border-[#d8cca8]',
    border: 'border-[#e4d7b7]',
    hr: 'border-[#e4d7b7] my-6',
    tableTh: 'bg-[#eae1c8] border border-[#e4d7b7] px-4 py-2 font-semibold text-[#5c2d12] text-left',
    tableTd: 'border border-[#e4d7b7] px-4 py-2 text-[#433422]'
  }
];

const getHljsThemeUrl = (themeId: string): string => {
  switch (themeId) {
    case 'github-light':
      return 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
    case 'dracula':
      return 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/dracula.min.css';
    case 'solarized-light':
      return 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/solarized-light.min.css';
    case 'solarized-dark':
      return 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/solarized-dark.min.css';
    case 'nord':
      return 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/nord.min.css';
    case 'one-dark':
      return 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css';
    case 'cyberpunk':
      return 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/monokai.min.css';
    case 'sepia':
      return 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/school-book.min.css';
    case 'github-dark':
    default:
      return 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
  }
};

const TextProcessor: React.FC<ToolComponentProps> = ({ lang, state, onStateChange }) => {
  const [input, setInput] = useState(state?.input || '');
  const [debouncedInput, setDebouncedInput] = useState(state?.input || '');
  const [extraContent, setExtraContent] = useState(state?.extraContent || '');
  const [quoteType, setQuoteType] = useState(state?.quoteType || '"');
  const [history, setHistory] = useState<string[]>(state?.history || []);
  const [viewMode, setViewMode] = useState<'editor' | 'split' | 'preview'>(
    state?.viewMode || 'split'
  );
  const [markdownThemeId, setMarkdownThemeId] = useState<string>(
    state?.markdownThemeId || 'github-dark'
  );
  const [copied, setCopied] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const scrollSource = useRef<'editor' | 'preview' | null>(null);

  const handleEditorScroll = () => {
    if (viewMode !== 'split') return;
    if (scrollSource.current !== 'editor') return;
    
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (editor && preview) {
      const editorLimit = editor.scrollHeight - editor.clientHeight;
      if (editorLimit > 0) {
        const percentage = editor.scrollTop / editorLimit;
        const previewLimit = preview.scrollHeight - preview.clientHeight;
        preview.scrollTop = percentage * previewLimit;
      }
    }
  };

  const handlePreviewScroll = () => {
    if (viewMode !== 'split') return;
    if (scrollSource.current !== 'preview') return;
    
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (editor && preview) {
      const previewLimit = preview.scrollHeight - preview.clientHeight;
      if (previewLimit > 0) {
        const percentage = preview.scrollTop / previewLimit;
        const editorLimit = editor.scrollHeight - editor.clientHeight;
        editor.scrollTop = percentage * editorLimit;
      }
    }
  };

  // Track the last state sent to parent to avoid infinite loop
  const lastReportedState = useRef<string>('');

  // Sync external state updates (e.g., from JSON tree linkage transfer)
  useEffect(() => {
    if (state?.input !== undefined && state.input !== input) {
      if (input && (!history.length || history[history.length - 1] !== input)) {
        setHistory(prev => [...prev.slice(-19), input]);
      }
      setInput(state.input);
    }
    if (state?.markdownThemeId !== undefined && state.markdownThemeId !== markdownThemeId) {
      setMarkdownThemeId(state.markdownThemeId);
    }
  }, [state?.input, state?.markdownThemeId]);

  // Debounce Markdown Input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(input);
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  // Sync state back to parent ONLY when it truly changes
  useEffect(() => {
    const nextState = { 
      input, 
      extraContent, 
      quoteType, 
      history, 
      viewMode,
      markdownThemeId,
      isPreview: viewMode !== 'editor'
    };
    const stateStr = JSON.stringify(nextState);
    
    if (lastReportedState.current !== stateStr) {
        lastReportedState.current = stateStr;
        onStateChange?.(nextState);
    }
  }, [input, extraContent, quoteType, history, viewMode, markdownThemeId, onStateChange]);

  const t = {
    title: lang === 'zh' ? '文本处理增强' : 'Text Processor Plus',
    copy: lang === 'zh' ? '复制' : 'Copy',
    copied: lang === 'zh' ? '已复制' : 'Copied',
    placeholder: lang === 'zh' ? '在此输入或粘贴需要处理的文本...' : 'Enter or paste text to process here...',
    unescapeN: lang === 'zh' ? '转义 \\n' : 'Unescape \\n',
    unescapeQ: lang === 'zh' ? '去除 \\"' : 'Unescape \\"',
    appendPrefix: lang === 'zh' ? '行首' : 'Pre',
    appendSuffix: lang === 'zh' ? '行尾' : 'Suf',
    extraPh: lang === 'zh' ? '添加内容...' : 'Content to add...',
    clear: lang === 'zh' ? '清空' : 'Clear',
    trimLines: lang === 'zh' ? '修剪空格' : 'Trim Lines',
    undo: lang === 'zh' ? '撤销' : 'Undo',
    wrap: lang === 'zh' ? '包裹' : 'Wrap',
    editor: lang === 'zh' ? '仅编辑' : 'Editor',
    split: lang === 'zh' ? '分屏对照' : 'Split View',
    preview: lang === 'zh' ? '仅预览' : 'Preview',
    theme: lang === 'zh' ? '主题' : 'Theme',
  };

  const saveToHistory = () => {
    setHistory(prev => [...prev.slice(-19), input]);
  };

  const handleUnescapeNewlines = () => {
    saveToHistory();
    setInput(input.replace(/\\n/g, '\n'));
  };

  const handleUnescapeQuotes = () => {
    saveToHistory();
    setInput(input.replace(/\\"/g, '"'));
  };

  const handleQuoteLines = () => {
    saveToHistory();
    let start = quoteType, end = quoteType;
    if (quoteType === '[]') { start = '['; end = ']'; }
    else if (quoteType === '{}') { start = '{'; end = '}'; }
    else if (quoteType === '()') { start = '('; end = ')'; }
    else if (quoteType === '<>') { start = '<'; end = '>'; }
    const quoted = input.split('\n').map(line => `${start}${line}${end}`).join('\n');
    setInput(quoted);
  };

  const handleAddAtLocation = (isPrefix: boolean) => {
    if (!extraContent) return;
    saveToHistory();
    const processed = input.split('\n').map(line => isPrefix ? extraContent + line : line + extraContent).join('\n');
    setInput(processed);
  };

  const handleTrimLines = () => {
    saveToHistory();
    setInput(input.split('\n').map(line => line.trim()).join('\n'));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setInput(previous);
  };

  const handleCopy = () => {
    if (!input) return;
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTheme = useMemo(() => {
    return THEMES.find(t => t.id === markdownThemeId) || THEMES[0];
  }, [markdownThemeId]);

  // Load highlight.js style stylesheet dynamically
  useEffect(() => {
    let themeLink = document.getElementById('hljs-theme-link') as HTMLLinkElement;
    if (!themeLink) {
      themeLink = document.createElement('link');
      themeLink.id = 'hljs-theme-link';
      themeLink.rel = 'stylesheet';
      document.head.appendChild(themeLink);
    }
    themeLink.href = getHljsThemeUrl(markdownThemeId);
  }, [markdownThemeId]);

  // Apply syntax highlighting
  useEffect(() => {
    if (viewMode !== 'editor' && previewRef.current && typeof hljs !== 'undefined') {
      try {
        previewRef.current.querySelectorAll('pre code').forEach((block: any) => {
          hljs.highlightElement(block);
        });
      } catch (e) {
        console.error("Syntax highlighting error:", e);
      }
    }
  }, [debouncedInput, viewMode, markdownThemeId]);

  const mdComponents = useMemo(() => {
    return {
      h1: ({ children, ...props }: any) => <h1 className={`my-4 ${currentTheme.h1}`} {...props}>{children}</h1>,
      h2: ({ children, ...props }: any) => <h2 className={`my-3.5 ${currentTheme.h2}`} {...props}>{children}</h2>,
      h3: ({ children, ...props }: any) => <h3 className={`my-3 ${currentTheme.h3}`} {...props}>{children}</h3>,
      h4: ({ children, ...props }: any) => <h4 className="my-2.5 text-base font-bold" {...props}>{children}</h4>,
      h5: ({ children, ...props }: any) => <h5 className="my-2 text-sm font-bold" {...props}>{children}</h5>,
      h6: ({ children, ...props }: any) => <h6 className="my-1.5 text-xs font-bold" {...props}>{children}</h6>,
      p: ({ children, ...props }: any) => <p className="my-3 leading-relaxed" {...props}>{children}</p>,
      a: ({ children, ...props }: any) => <a className={currentTheme.link} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>,
      blockquote: ({ children, ...props }: any) => <blockquote className={`my-4 ${currentTheme.blockquote}`} {...props}>{children}</blockquote>,
      hr: ({ ...props }: any) => <hr className={currentTheme.hr} {...props} />,
      ul: ({ children, ...props }: any) => <ul className="list-disc pl-6 my-3 space-y-1" {...props}>{children}</ul>,
      ol: ({ children, ...props }: any) => <ol className="list-decimal pl-6 my-3 space-y-1" {...props}>{children}</ol>,
      li: ({ children, ...props }: any) => <li className="leading-relaxed" {...props}>{children}</li>,
      table: ({ children, ...props }: any) => (
        <div className="overflow-x-auto my-4 rounded border border-transparent">
          <table className={`min-w-full border-collapse ${currentTheme.border}`} {...props}>{children}</table>
        </div>
      ),
      thead: ({ children, ...props }: any) => <thead className={currentTheme.border} {...props}>{children}</thead>,
      tbody: ({ children, ...props }: any) => <tbody className={currentTheme.border} {...props}>{children}</tbody>,
      tr: ({ children, ...props }: any) => <tr className={`border-b ${currentTheme.border}`} {...props}>{children}</tr>,
      th: ({ children, ...props }: any) => <th className={currentTheme.tableTh} {...props}>{children}</th>,
      td: ({ children, ...props }: any) => <td className={currentTheme.tableTd} {...props}>{children}</td>,
      code: ({ className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || '');
        const isInline = !match;
        if (isInline) {
          return <code className={currentTheme.codeInline} {...props}>{children}</code>;
        }
        return <code className={`${className} block overflow-x-auto font-mono text-xs`} {...props}>{children}</code>;
      },
      pre: ({ children, ...props }: any) => (
        <pre className={`my-4 p-4 rounded-lg font-mono text-xs overflow-x-auto ${currentTheme.codeBlockBg}`} {...props}>
          {children}
        </pre>
      ),
      img: ({ alt, src, ...props }: any) => (
        <img className="max-w-full h-auto my-4 rounded-lg border shadow-sm mx-auto" alt={alt} src={src} referrerPolicy="no-referrer" {...props} />
      )
    };
  }, [currentTheme]);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-1">
        <div className="flex flex-wrap items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
                <IconType className="w-5 h-5 text-primary-400" />
                <h2 className="text-xl font-bold text-slate-100">{t.title}</h2>
            </div>
            
            <div className="bg-slate-800/80 p-0.5 rounded-lg flex border border-slate-700 shadow-inner">
                <button
                    onClick={() => setViewMode('editor')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                        viewMode === 'editor' 
                        ? 'bg-primary-600 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={t.editor}
                >
                    <IconCode className="w-3.5 h-3.5" />
                    <span>{t.editor}</span>
                </button>
                <button
                    onClick={() => setViewMode('split')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                        viewMode === 'split' 
                        ? 'bg-primary-600 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={t.split}
                >
                    <div className="flex gap-0.5 items-center">
                        <span className="w-1 h-3 bg-current opacity-40 rounded-sm"></span>
                        <span className="w-1 h-3 bg-current opacity-100 rounded-sm"></span>
                    </div>
                    <span>{t.split}</span>
                </button>
                <button
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                        viewMode === 'preview' 
                        ? 'bg-primary-600 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={t.preview}
                >
                    <IconMarkdown className="w-3.5 h-3.5" />
                    <span>{t.preview}</span>
                </button>
            </div>

            {/* Theme Selector */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 shadow-inner">
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{t.theme}:</span>
                <div className="relative">
                    <select 
                        value={markdownThemeId} 
                        onChange={(e) => setMarkdownThemeId(e.target.value)} 
                        className="bg-slate-900 border border-slate-700 rounded pl-2.5 pr-8 py-1 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-primary-500 appearance-none cursor-pointer font-medium min-w-[120px]"
                    >
                        {THEMES.map(theme => (
                            <option key={theme.id} value={theme.id}>
                                {lang === 'zh' ? theme.nameZh : theme.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <IconChevronDown className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={handleUndo} disabled={history.length === 0} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded transition-all ${history.length > 0 ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'}`}>
                <IconUndo className="w-3.5 h-3.5" /> {t.undo}
            </button>
            <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-all shadow-sm">
                {copied ? <IconCheck className="w-3.5 h-3.5" /> : <IconCopy className="w-3.5 h-3.5" />}
                {copied ? t.copied : t.copy}
            </button>
            <button onClick={() => { saveToHistory(); setInput(''); }} className="px-3 py-1.5 text-xs font-medium bg-red-900/20 border border-red-900/30 text-red-400 rounded hover:bg-red-900/30 transition-all">
                {t.clear}
            </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex flex-wrap items-center gap-3">
              <button onClick={handleUnescapeNewlines} className="flex-none flex items-center justify-center gap-2 px-4 py-2 h-9 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all"><IconZap className="w-3.5 h-3.5 text-yellow-500" /> {t.unescapeN}</button>
              <button onClick={handleUnescapeQuotes} className="flex-none flex items-center justify-center gap-2 px-4 py-2 h-9 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all"><IconZap className="w-3.5 h-3.5 text-blue-500" /> {t.unescapeQ}</button>
              <button onClick={handleTrimLines} className="flex-none px-4 py-2 h-9 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all">{t.trimLines}</button>
              <div className="flex-none flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
                  <div className="w-16 relative">
                    <select value={quoteType} onChange={(e) => setQuoteType(e.target.value)} className="w-full h-7 bg-slate-800 border border-slate-700 rounded pl-2 pr-6 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-primary-500 opts appearance-none font-mono cursor-pointer">
                        <option value='"'>" "</option>
                        <option value="'">' '</option>
                        <option value="`">` `</option>
                        <option value="[]">[ ]</option>
                        <option value="{}">{"{ }"}</option>
                        <option value="()">{"( )"}</option>
                        <option value="<>">&lt; &gt;</option>
                    </select>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><IconChevronDown className="w-3 h-3" /></div>
                  </div>
                  <button onClick={handleQuoteLines} className="px-3 h-7 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-all whitespace-nowrap">{t.wrap}</button>
              </div>
              <div className="flex-none w-full sm:w-auto max-w-sm flex items-center gap-1.5 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
                  <input type="text" value={extraContent} onChange={(e) => setExtraContent(e.target.value)} placeholder={t.extraPh} className="flex-1 min-w-[120px] h-7 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-primary-500" />
                  <button onClick={() => handleAddAtLocation(true)} className="px-3 h-7 text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white rounded transition-all">{t.appendPrefix}</button>
                  <button onClick={() => handleAddAtLocation(false)} className="px-3 h-7 text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white rounded transition-all">{t.appendSuffix}</button>
              </div>
          </div>
          <div className="flex-1 relative bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-inner flex flex-col min-h-0">
            <div className={`absolute inset-0 w-full h-full grid ${
              viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-700' : 'grid-cols-1'
            }`}>
              
              {/* EDITOR COLUMN */}
              {(viewMode === 'editor' || viewMode === 'split') && (
                <div className="relative h-full flex flex-col bg-slate-800/10">
                  <textarea 
                    ref={editorRef}
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder={t.placeholder} 
                    onScroll={handleEditorScroll}
                    onMouseEnter={() => { scrollSource.current = 'editor'; }}
                    onTouchStart={() => { scrollSource.current = 'editor'; }}
                    className="w-full h-full bg-transparent p-4 font-mono text-sm text-slate-200 resize-none outline-none focus:ring-2 focus:ring-primary-500/10 overflow-y-auto" 
                    spellCheck="false" 
                  />
                  {viewMode === 'split' && (
                    <div className="absolute bottom-3 right-3 bg-slate-950/80 border border-slate-800 text-slate-500 px-2 py-0.5 text-[10px] font-mono rounded select-none uppercase tracking-wider">
                      {lang === 'zh' ? '编辑器' : 'Editor'}
                    </div>
                  )}
                </div>
              )}

              {/* PREVIEW COLUMN */}
              {(viewMode === 'preview' || viewMode === 'split') && (
                <div 
                  className={`relative h-full overflow-auto ${currentTheme.bg} ${currentTheme.text} p-6 md:p-8 flex flex-col transition-colors duration-200`} 
                  ref={previewRef}
                  onScroll={handlePreviewScroll}
                  onMouseEnter={() => { scrollSource.current = 'preview'; }}
                  onTouchStart={() => { scrollSource.current = 'preview'; }}
                >
                  <div className="max-w-none flex-1">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={mdComponents}
                    >
                      {debouncedInput}
                    </ReactMarkdown>
                  </div>
                  {!input && (
                    <div className="text-slate-500 italic text-center my-auto flex flex-col items-center justify-center gap-2 py-10">
                      <IconMarkdown className="w-8 h-8 opacity-30 text-slate-400" />
                      <span>{lang === 'zh' ? '暂无内容可预览' : 'No content to preview'}</span>
                    </div>
                  )}
                  {viewMode === 'split' && (
                    <div className="absolute bottom-3 right-3 bg-slate-950/80 border border-slate-800 text-slate-500 px-2 py-0.5 text-[10px] font-mono rounded select-none uppercase tracking-wider">
                      {lang === 'zh' ? `${currentTheme.nameZh} 预览` : `${currentTheme.name} Preview`}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          <div className="flex gap-1.5 items-center"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{lang === 'zh' ? '行数' : 'Lines'}: {input ? input.split('\n').length : 0}</div>
          <div className="flex gap-1.5 items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{lang === 'zh' ? '字符数' : 'Chars'}: {input.length}</div>
          <div className="flex gap-1.5 items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>{lang === 'zh' ? '历史' : 'History'}: {history.length}/20</div>
      </div>
    </div>
  );
};

export default TextProcessor;
