import React, { useState, useMemo, useEffect } from 'react';
import { 
  ToolCategory, 
  ToolDef,
  Lang,
  Theme
} from './types';
import { 
  IconJson, 
  IconBase64, 
  IconHash, 
  IconUrl, 
  IconBrain, 
  IconSearch, 
  IconHome, 
  IconClock, 
  IconBinary,
  IconType,
  IconPalette,
  IconRuler,
  IconQrCode,
  IconDiff,
  IconRegex,
  IconGlobe,
  IconPinyin,
  IconFormat,
  IconSun,
  IconMoon,
  IconLanguage,
  IconMenu,
  IconX,
  IconPanelLeft // Keeping for potential future use or if referenced
} from './components/Icons';

import JsonFormatter from './components/tools/JsonFormatter';
import Base64Converter from './components/tools/Base64Converter';
import HashGenerator from './components/tools/HashGenerator';
import UrlConverter from './components/tools/UrlConverter';
import AiAssistant from './components/tools/AiAssistant';
import TimestampConverter from './components/tools/TimestampConverter';
import NumberBaseConverter from './components/tools/NumberBaseConverter';
import StringCaseConverter from './components/tools/StringCaseConverter';
import ColorConverter from './components/tools/ColorConverter';
import UnitConverter from './components/tools/UnitConverter';
import TextDiff from './components/tools/TextDiff';
import QrCodeGenerator from './components/tools/QrCodeGenerator';
import RegexTester from './components/tools/RegexTester';
import IpLookup from './components/tools/IpLookup';
import PinyinConverter from './components/tools/PinyinConverter';
import CodeFormatter from './components/tools/CodeFormatter';
import ToolCard from './components/ToolCard';

// --- Tool Registry ---
const TOOLS: ToolDef[] = [
  {
    id: 'json-fmt',
    name: 'JSON Formatter',
    nameZh: 'JSON 工具',
    description: 'Format, validate, and minify JSON data.',
    descriptionZh: '格式化、校验和压缩 JSON 数据。',
    category: ToolCategory.DEVELOPER,
    icon: <IconJson className="w-5 h-5" />,
    component: <JsonFormatter />,
    keywords: ['json', 'parse', 'prettify']
  },
  {
    id: 'regex-test',
    name: 'Regex Tester',
    nameZh: '正则表达式',
    description: 'Test and generate Regular Expressions with AI.',
    descriptionZh: '利用 AI 测试和生成正则表达式。',
    category: ToolCategory.DEVELOPER,
    icon: <IconRegex className="w-5 h-5" />,
    component: <RegexTester />,
    keywords: ['regex', 'match', 'pattern']
  },
  {
    id: 'hash',
    name: 'Hash Generator',
    nameZh: '哈希(Hash)生成',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes.',
    descriptionZh: '生成 MD5, SHA-1, SHA-256, SHA-512 等哈希值。',
    category: ToolCategory.CRYPTO,
    icon: <IconHash className="w-5 h-5" />,
    component: <HashGenerator />,
    keywords: ['md5', 'sha', 'crypto', 'digest']
  },
  {
    id: 'text-diff',
    name: 'Text Diff',
    nameZh: '文本比对',
    description: 'Compare two texts and highlight differences.',
    descriptionZh: '在线比对两段文本的差异并高亮显示。',
    category: ToolCategory.DEVELOPER,
    icon: <IconDiff className="w-5 h-5" />,
    component: <TextDiff />,
    keywords: ['diff', 'compare', 'difference']
  },
  {
    id: 'ip-lookup',
    name: 'IP Lookup',
    nameZh: 'IP地址查询',
    description: 'Get details about your IP or any other IP address.',
    descriptionZh: '查询本机 IP 或任意 IP 地址的详细信息。',
    category: ToolCategory.UTILITY,
    icon: <IconGlobe className="w-5 h-5" />,
    component: <IpLookup />,
    keywords: ['ip', 'geo', 'location']
  },
  {
    id: 'qr-code',
    name: 'QR Code',
    nameZh: '二维码生成',
    description: 'Generate QR codes from text or URLs.',
    descriptionZh: '将文本或 URL 转换为二维码图片。',
    category: ToolCategory.UTILITY,
    icon: <IconQrCode className="w-5 h-5" />,
    component: <QrCodeGenerator />,
    keywords: ['qr', 'barcode', '2d']
  },
  {
    id: 'url-enc',
    name: 'URL Tools',
    nameZh: 'URL编码/解码',
    description: 'Encode/Decode URLs and Parse parameters.',
    descriptionZh: 'URL 编码、解码以及参数解析工具。',
    category: ToolCategory.CONVERTER,
    icon: <IconUrl className="w-5 h-5" />,
    component: <UrlConverter />,
    keywords: ['url', 'uri', 'percent']
  },
  {
    id: 'base64',
    name: 'Encoding Converter',
    nameZh: '编码转换',
    description: 'Convert between Text, Base64, and Base62.',
    descriptionZh: '文本、Base64、Base62 等格式的相互转换。',
    category: ToolCategory.CONVERTER,
    icon: <IconBase64 className="w-5 h-5" />,
    component: <Base64Converter />,
    keywords: ['base64', 'base62', 'encode', 'decode']
  },
  {
    id: 'timestamp',
    name: 'Timestamp',
    nameZh: '时间戳转换',
    description: 'Unix timestamp conversion tools.',
    descriptionZh: 'Unix 时间戳与日期时间的相互转换。',
    category: ToolCategory.UTILITY,
    icon: <IconClock className="w-5 h-5" />,
    component: <TimestampConverter />,
    keywords: ['time', 'date', 'unix']
  },
  {
    id: 'pinyin',
    name: 'Pinyin Converter',
    nameZh: '汉字转拼音',
    description: 'Convert Chinese characters to Pinyin.',
    descriptionZh: '将中文字符转换为拼音 (带声调)。',
    category: ToolCategory.CONVERTER,
    icon: <IconPinyin className="w-5 h-5" />,
    component: <PinyinConverter />,
    keywords: ['chinese', 'pinyin', 'convert']
  },
  {
    id: 'code-fmt',
    name: 'Code Format',
    nameZh: '代码格式化',
    description: 'Format code in various languages using AI.',
    descriptionZh: '利用 AI 智能格式化各种语言的代码。',
    category: ToolCategory.DEVELOPER,
    icon: <IconFormat className="w-5 h-5" />,
    component: <CodeFormatter />,
    keywords: ['format', 'prettier', 'beautify']
  },
  {
    id: 'base-conv',
    name: 'Base Converter',
    nameZh: '进制转换',
    description: 'Convert Decimal, Binary, Hex, Octal.',
    descriptionZh: '二进制、八进制、十进制、十六进制相互转换。',
    category: ToolCategory.CONVERTER,
    icon: <IconBinary className="w-5 h-5" />,
    component: <NumberBaseConverter />,
    keywords: ['hex', 'bin', 'dec', 'oct']
  },
  {
    id: 'string-case',
    name: 'Variable Name',
    nameZh: '变量名转换',
    description: 'Camel, Snake, Pascal, Kebab case converter.',
    descriptionZh: '驼峰、下划线、烤串等变量命名风格转换。',
    category: ToolCategory.DEVELOPER,
    icon: <IconType className="w-5 h-5" />,
    component: <StringCaseConverter />,
    keywords: ['case', 'camel']
  },
  {
    id: 'color-conv',
    name: 'Color Converter',
    nameZh: '颜色转换',
    description: 'HEX, RGB, HSL converter.',
    descriptionZh: 'HEX, RGB, HSL 颜色格式互转。',
    category: ToolCategory.CONVERTER,
    icon: <IconPalette className="w-5 h-5" />,
    component: <ColorConverter />,
    keywords: ['hex', 'rgb', 'color']
  },
  {
    id: 'unit-conv',
    name: 'Unit Converter',
    nameZh: '单位换算',
    description: 'Storage, Length, Time units.',
    descriptionZh: '存储、长度、时间等常见单位换算。',
    category: ToolCategory.UTILITY,
    icon: <IconRuler className="w-5 h-5" />,
    component: <UnitConverter />,
    keywords: ['measure']
  },
  {
    id: 'ai-assist',
    name: 'AI Assistant',
    nameZh: 'AI 助手',
    description: 'General purpose AI helper.',
    descriptionZh: '通用 AI 编程助手，解释代码、生成代码。',
    category: ToolCategory.AI,
    icon: <IconBrain className="w-5 h-5" />,
    component: <AiAssistant />,
    keywords: ['ai', 'gemini']
  },
];

const App: React.FC = () => {
  const [currentToolId, setCurrentToolId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Settings
  const [lang, setLang] = useState<Lang>('zh');
  const [theme, setTheme] = useState<Theme>('dark');

  // Translations
  const t = {
    search: lang === 'zh' ? '搜索工具...' : 'Search tools...',
    home: lang === 'zh' ? '首页' : 'Home',
    welcome: lang === 'zh' ? '开发者工具箱' : 'Developer Utilities Hub',
    desc: lang === 'zh' ? '您的必备开发瑞士军刀。包含 JSON、Base64、正则、AI 助手等多种工具。' : 'Your essential Swiss Army knife for development. Privacy-first, client-side tools for everyday tasks.',
    [ToolCategory.DEVELOPER]: lang === 'zh' ? '开发' : 'Developer',
    [ToolCategory.CONVERTER]: lang === 'zh' ? '转换' : 'Converter',
    [ToolCategory.CRYPTO]: lang === 'zh' ? '加密' : 'Crypto',
    [ToolCategory.AI]: lang === 'zh' ? 'AI 助手' : 'AI Assistant',
    [ToolCategory.UTILITY]: lang === 'zh' ? '工具' : 'Utility',
  };

  // Theme Effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const groupedTools = useMemo<Record<string, ToolDef[]>>(() => {
    const filtered = TOOLS.filter(tool => {
        if (!searchTerm) return true;
        const toolName = lang === 'zh' ? tool.nameZh : tool.name;
        const toolDesc = lang === 'zh' ? tool.descriptionZh : tool.description;
        return (
            toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            toolDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    const groups: Record<string, ToolDef[]> = {};
    filtered.forEach(tool => {
        if (!groups[tool.category]) groups[tool.category] = [];
        groups[tool.category].push(tool);
    });
    return groups;
  }, [searchTerm, lang]);

  const currentTool = TOOLS.find(t => t.id === currentToolId);

  const handleToolSelect = (id: string) => {
    setCurrentToolId(id);
    setIsSidebarOpen(false); // Close sidebar on mobile on select
    if (window.innerWidth < 768) {
        setSearchTerm(''); // Optional: clear search on mobile to reset view next time
    }
  };

  const handleGoHome = () => {
    setCurrentToolId(null);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 overflow-hidden font-sans">
      
      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
            onClick={() => setIsSidebarOpen(false)}
          />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-out shadow-2xl md:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
          {/* Sidebar Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
             <div 
                className="flex items-center gap-2 cursor-pointer group w-full" 
                onClick={handleGoHome}
             >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                    NB
                </div>
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-100 dark:to-slate-300">
                    NewBeTools
                </span>
             </div>
             <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-auto text-slate-400">
                 <IconX className="w-6 h-6" />
             </button>
          </div>

          {/* Search Box */}
          <div className="p-4 shrink-0">
             <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text"
                    placeholder={t.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-9 pr-4 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-primary-500 placeholder:text-slate-500 transition-all"
                />
             </div>
          </div>

          {/* Navigation List */}
          <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              <button 
                 onClick={handleGoHome}
                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-4 transition-colors ${
                     !currentToolId 
                     ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                     : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                 }`}
              >
                 <IconHome className="w-5 h-5" />
                 {t.home}
              </button>

              <div className="space-y-6">
                {Object.keys(groupedTools).length > 0 ? (Object.entries(groupedTools) as [string, ToolDef[]][]).map(([cat, tools]) => (
                    <div key={cat}>
                        <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {t[cat as ToolCategory] || cat}
                        </div>
                        <div className="space-y-0.5">
                            {tools.map(tool => {
                                const isActive = currentToolId === tool.id;
                                return (
                                    <button
                                        key={tool.id}
                                        onClick={() => handleToolSelect(tool.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                                            isActive
                                            ? 'bg-primary-600 text-white shadow-md'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:translate-x-1'
                                        }`}
                                    >
                                        <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-500'}`}>
                                            {tool.icon}
                                        </span>
                                        <span className="truncate">
                                            {lang === 'zh' ? tool.nameZh : tool.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-slate-500 text-sm py-4 italic">
                        No tools found.
                    </div>
                )}
              </div>
          </div>

          {/* Sidebar Footer (Controls) */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 flex gap-2">
               <button 
                  onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium transition-colors"
               >
                  <IconLanguage className="w-4 h-4" />
                  {lang === 'zh' ? '中文' : 'English'}
               </button>
               <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
               >
                  {theme === 'dark' ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
               </button>
          </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-full min-w-0">
         
         {/* Mobile Header (Only visible on mobile) */}
         <header className="md:hidden h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3 shrink-0 sticky top-0 z-30">
             <button onClick={() => setIsSidebarOpen(true)} className="p-1 -ml-1 text-slate-600 dark:text-slate-300">
                 <IconMenu className="w-6 h-6" />
             </button>
             <h1 className="font-bold text-slate-900 dark:text-white truncate">
                 {currentTool ? (lang === 'zh' ? currentTool.nameZh : currentTool.name) : 'NewBeTools'}
             </h1>
         </header>

         {/* Content Scrollable Area */}
         <main className="flex-1 overflow-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
                {currentTool ? (
                    // Tool View
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                         {/* Desktop Breadcrumb / Header */}
                         <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6 shrink-0">
                            <span className="hover:text-primary-500 cursor-pointer transition-colors" onClick={handleGoHome}>{t.home}</span>
                            <span>/</span>
                            <span className="text-slate-900 dark:text-slate-200 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                {lang === 'zh' ? currentTool.nameZh : currentTool.name}
                            </span>
                         </div>
                         
                         {/* Tool Container - Flex 1 to allow tool to stretch */}
                         <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col">
                             {React.isValidElement(currentTool.component) 
                                ? React.cloneElement(currentTool.component as React.ReactElement<any>, { lang }) 
                                : currentTool.component}
                         </div>
                    </div>
                ) : (
                    // Dashboard View
                    <div className="space-y-8 pb-10">
                        <div className="text-center py-10 md:py-16 space-y-4">
                            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-indigo-500/10 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                                    NB
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {t.welcome}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                                {t.desc}
                            </p>
                        </div>

                        {/* Grouped Tools Grid */}
                        {Object.entries(groupedTools).length > 0 ? (Object.entries(groupedTools) as [string, ToolDef[]][]).map(([cat, tools]) => (
                            <div key={cat} className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                                        {t[cat as ToolCategory] || cat}
                                    </h3>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                                        {tools.length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {tools.map(tool => (
                                        <ToolCard 
                                            key={tool.id} 
                                            tool={tool} 
                                            onClick={handleToolSelect} 
                                            lang={lang} 
                                        />
                                    ))}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-slate-500">
                                {/* Optional: display something if no tools match search */}
                            </div>
                        )}
                    </div>
                )}
            </div>
         </main>
      </div>

    </div>
  );
};

export default App;