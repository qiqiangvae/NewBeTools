
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
  IconLanguage
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
    icon: <IconJson className="w-6 h-6" />,
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
    icon: <IconRegex className="w-6 h-6" />,
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
    icon: <IconHash className="w-6 h-6" />,
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
    icon: <IconDiff className="w-6 h-6" />,
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
    icon: <IconGlobe className="w-6 h-6" />,
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
    icon: <IconQrCode className="w-6 h-6" />,
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
    icon: <IconUrl className="w-6 h-6" />,
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
    icon: <IconBase64 className="w-6 h-6" />,
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
    icon: <IconClock className="w-6 h-6" />,
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
    icon: <IconPinyin className="w-6 h-6" />,
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
    icon: <IconFormat className="w-6 h-6" />,
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
    icon: <IconBinary className="w-6 h-6" />,
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
    icon: <IconType className="w-6 h-6" />,
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
    icon: <IconPalette className="w-6 h-6" />,
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
    icon: <IconRuler className="w-6 h-6" />,
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
    icon: <IconBrain className="w-6 h-6" />,
    component: <AiAssistant />,
    keywords: ['ai', 'gemini']
  },
];

// Tools that appear in the "Common" or main screenshot grid
const COMMON_TOOLS_IDS = [
    'json-fmt', 
    'regex-test', 
    'hash', 
    'text-diff', 
    'ip-lookup', 
    'qr-code', 
    'url-enc', 
    'base64', 
    'timestamp', 
    'pinyin', 
    'code-fmt'
];

const QUICK_MENU_CATEGORIES = ['Common', ...Object.values(ToolCategory)];

const App: React.FC = () => {
  const [currentToolId, setCurrentToolId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Common');
  
  // Settings
  const [lang, setLang] = useState<Lang>('zh');
  const [theme, setTheme] = useState<Theme>('dark');

  // Translations
  const t = {
    search: lang === 'zh' ? '搜索工具...' : 'Search tools...',
    home: lang === 'zh' ? '首页' : 'Home',
    common: lang === 'zh' ? '常用' : 'Common',
    welcome: lang === 'zh' ? '开发者工具箱' : 'Developer Utilities Hub',
    desc: lang === 'zh' ? '您的必备开发瑞士军刀。包含 JSON、Base64、正则、AI 助手等多种工具。' : 'Your essential Swiss Army knife for development. Privacy-first, client-side tools for everyday tasks.',
    noResults: lang === 'zh' ? '未找到匹配的工具。' : 'No tools found matching your search.',
    clear: lang === 'zh' ? '清除筛选' : 'Clear filters',
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

  // Filter tools based on search
  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => {
      const toolName = lang === 'zh' ? tool.nameZh : tool.name;
      const toolDesc = lang === 'zh' ? tool.descriptionZh : tool.description;
      const matchesSearch = 
        toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        toolDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (searchTerm) return matchesSearch;

      if (activeCategory === 'Common') {
          return COMMON_TOOLS_IDS.includes(tool.id);
      }
      return tool.category === activeCategory;
    });
  }, [searchTerm, activeCategory, lang]);

  const currentTool = TOOLS.find(t => t.id === currentToolId);

  const handleToolSelect = (id: string) => {
    setCurrentToolId(id);
    setSearchTerm('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Switch active category if needed
    const tool = TOOLS.find(t => t.id === id);
    if (tool && activeCategory !== 'Common' && tool.category !== activeCategory) {
        setActiveCategory(tool.category);
    }
  };

  const handleGoHome = () => {
    setCurrentToolId(null);
    setSearchTerm('');
  };

  const getToolsForChipRow = () => {
      if (searchTerm) return [];
      
      if (activeCategory === 'Common') {
          return TOOLS.filter(t => COMMON_TOOLS_IDS.includes(t.id));
      }
      return TOOLS.filter(t => t.category === activeCategory);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 flex flex-col font-sans transition-colors duration-200">
      
      {/* --- TOP HEADER (Row 1) --- */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
            
            {/* Left: Logo & Home */}
            <div className="flex items-center gap-6 shrink-0">
                <div 
                    className="flex items-center gap-2 cursor-pointer group" 
                    onClick={handleGoHome}
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform">
                        NB
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-100 dark:to-slate-300 hidden md:block">
                        NewBeTools
                    </span>
                </div>
            </div>

            {/* Middle: Category Tabs (Scrollable) */}
            <div className="flex-1 flex justify-center overflow-hidden">
                <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide mask-fade px-2">
                    {QUICK_MENU_CATEGORIES.map(cat => {
                        const label = cat === 'Common' ? t.common : (t[cat as keyof typeof t] || cat);
                        const isActive = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => { setActiveCategory(cat); setSearchTerm(''); }}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                    isActive 
                                    ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400' 
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Right: Actions (Search, Lang, Theme) */}
            <div className="flex items-center gap-2 shrink-0">
                {/* Search Input (Desktop) */}
                <div className="relative hidden md:block w-48 lg:w-64">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder={t.search}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-1.5 pl-9 pr-4 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-primary-500 placeholder:text-slate-500 transition-all"
                    />
                </div>
                {/* Search Icon (Mobile) */}
                <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                     <IconSearch className="w-5 h-5" />
                </button>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

                <button 
                    onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                >
                    <IconLanguage className="w-5 h-5" />
                    <span className="hidden lg:inline">{lang === 'zh' ? 'EN' : '中'}</span>
                </button>

                <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    {theme === 'dark' ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
                </button>
            </div>
        </div>
      </header>

      {/* --- SUB HEADER (Row 2): Tool Chips --- */}
      <div className="bg-white/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm sticky top-16 z-40">
          <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {getToolsForChipRow().map(tool => {
                  const toolName = lang === 'zh' ? tool.nameZh : tool.name;
                  const isActive = currentToolId === tool.id;
                  return (
                      <button 
                          key={tool.id}
                          onClick={() => handleToolSelect(tool.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-xs font-medium transition-colors shadow-sm whitespace-nowrap ${
                              isActive
                                ? 'bg-primary-600 border-primary-600 text-white'
                                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                      >
                          <span className={`opacity-70 ${isActive ? 'text-white' : ''}`}>{tool.icon}</span>
                          {toolName}
                      </button>
                  )
              })}
              {getToolsForChipRow().length === 0 && searchTerm && (
                  <div className="text-xs text-slate-500 px-2 italic">Searching...</div>
              )}
          </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-300">
         {currentTool ? (
             // Specific Tool View
             <div className="flex flex-col gap-4 h-full">
                 <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                    <button onClick={handleGoHome} className="hover:text-primary-500 flex items-center gap-1">
                        <IconHome className="w-4 h-4" /> {t.home}
                    </button>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-slate-200 font-medium">
                        {lang === 'zh' ? currentTool.nameZh : currentTool.name}
                    </span>
                 </div>

                 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[600px] flex flex-col">
                     {/* Pass lang prop to the component */}
                     {React.isValidElement(currentTool.component) 
                        ? React.cloneElement(currentTool.component as React.ReactElement<any>, { lang }) 
                        : currentTool.component}
                 </div>
             </div>
         ) : (
             // Dashboard Grid View
             <div className="space-y-8">
                 <div className="text-center py-10 space-y-4">
                     <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {t.welcome}
                     </h1>
                     <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                        {t.desc}
                     </p>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                     {filteredTools.length > 0 ? (
                         filteredTools.map(tool => (
                             <ToolCard key={tool.id} tool={tool} onClick={handleToolSelect} lang={lang} />
                         ))
                     ) : (
                         <div className="col-span-full text-center py-20 text-slate-500 dark:text-slate-400">
                             <p>{t.noResults}</p>
                             <button onClick={() => { setSearchTerm(''); setActiveCategory('Common'); }} className="text-primary-500 hover:underline mt-2">
                                 {t.clear}
                             </button>
                         </div>
                     )}
                 </div>
             </div>
         )}
      </main>
    </div>
  );
};

export default App;
