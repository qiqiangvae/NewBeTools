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
  IconMenu,
  IconX,
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
  IconPanelLeft,
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
    name: 'Base64',
    nameZh: 'Base64 编码',
    description: 'Encode and decode Base64 strings.',
    descriptionZh: 'Base64 数据的编码与解码。',
    category: ToolCategory.CONVERTER,
    icon: <IconBase64 className="w-6 h-6" />,
    component: <Base64Converter />,
    keywords: ['base64', 'encode', 'decode']
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
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile toggle
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop toggle
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [quickMenuCategory, setQuickMenuCategory] = useState<string>('Common');
  
  // Settings
  const [lang, setLang] = useState<Lang>('zh');
  const [theme, setTheme] = useState<Theme>('dark');

  // Translations
  const t = {
    allTools: lang === 'zh' ? '所有工具' : 'All Tools',
    search: lang === 'zh' ? '搜索工具...' : 'Search tools...',
    home: lang === 'zh' ? '首页' : 'Home',
    common: lang === 'zh' ? '常用' : 'Common',
    nav: lang === 'zh' ? '导航' : 'Navigation',
    tool: lang === 'zh' ? '工具' : 'Tools',
    welcome: lang === 'zh' ? '开发者工具箱' : 'Developer Utilities Hub',
    desc: lang === 'zh' ? '您的必备开发瑞士军刀。包含 JSON、Base64、正则、AI 助手等多种工具。' : 'Your essential Swiss Army knife for development. Privacy-first, client-side tools for everyday tasks.',
    noResults: lang === 'zh' ? '未找到匹配的工具。' : 'No tools found matching your search.',
    clear: lang === 'zh' ? '清除筛选' : 'Clear filters',
    [ToolCategory.DEVELOPER]: lang === 'zh' ? '开发' : 'Developer',
    [ToolCategory.CONVERTER]: lang === 'zh' ? '转换' : 'Converter',
    [ToolCategory.CRYPTO]: lang === 'zh' ? '加密/签名' : 'Cryptography',
    [ToolCategory.AI]: lang === 'zh' ? 'AI 助手' : 'AI Assistant',
    [ToolCategory.UTILITY]: lang === 'zh' ? '其他' : 'Utility',
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

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => {
      const toolName = lang === 'zh' ? tool.nameZh : tool.name;
      const toolDesc = lang === 'zh' ? tool.descriptionZh : tool.description;
      const matchesSearch = 
        toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        toolDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, lang]);

  const currentTool = TOOLS.find(t => t.id === currentToolId);

  const handleToolSelect = (id: string) => {
    setCurrentToolId(id);
    setSidebarOpen(false);
    setSearchTerm('');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const tool = TOOLS.find(t => t.id === id);
    if (tool) {
        if (quickMenuCategory === 'Common' && COMMON_TOOLS_IDS.includes(id)) {
            // keep common
        } else {
            setQuickMenuCategory(tool.category);
        }
    }
  };

  const handleGoHome = () => {
    setCurrentToolId(null);
    setSidebarOpen(false);
    setActiveCategory('All');
  };

  const getToolsForQuickMenu = (category: string) => {
    if (category === 'Common') {
        return TOOLS.filter(t => COMMON_TOOLS_IDS.includes(t.id));
    }
    return TOOLS.filter(t => t.category === category);
  };

  const categories = ['All', ...Array.from(new Set(TOOLS.map(t => t.category)))];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 flex overflow-hidden font-sans transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'lg:w-0 lg:overflow-hidden lg:border-none' : 'lg:w-64'}
      `}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center h-16 whitespace-nowrap">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleGoHome}>
             <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20">
               DT
             </div>
             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-100 dark:to-slate-400">
               DevTool
             </h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-primary-500">
            <IconX className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {/* Categories */}
          <div>
            <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              {t.nav}
            </div>
            <button
               onClick={handleGoHome}
               className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap ${!currentToolId ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-500/10' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <IconHome className="w-5 h-5 flex-shrink-0" />
              {t.allTools}
            </button>
          </div>

          <div>
             <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              {t.tool}
            </div>
            <div className="space-y-1">
              {TOOLS.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap ${currentToolId === tool.id ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                  <span className="opacity-70 flex-shrink-0">{tool.icon}</span>
                  {lang === 'zh' ? tool.nameZh : tool.name}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Sidebar Footer / Collapse Button */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button 
             onClick={() => setSidebarCollapsed(true)}
             className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
             title="Collapse Sidebar"
          >
             <IconPanelLeft className="w-5 h-5 rotate-180" />
             <span className="lg:inline hidden">Hide Sidebar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0 shrink-0 transition-colors">
          <div className="flex items-center gap-4">
             {/* Mobile Menu Toggle */}
             <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
               <IconMenu className="w-6 h-6" />
             </button>
             
             {/* Desktop Expand Button */}
             {sidebarCollapsed && (
                <button onClick={() => setSidebarCollapsed(false)} className="hidden lg:block text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    <IconPanelLeft className="w-6 h-6" />
                </button>
             )}

             {/* Breadcrumb / Title */}
             <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
               <span className="cursor-pointer hover:text-slate-900 dark:hover:text-slate-200" onClick={handleGoHome}>{t.home}</span>
               {currentTool && (
                 <>
                   <span>/</span>
                   <span className="text-primary-600 dark:text-primary-400 font-medium">
                     {lang === 'zh' ? currentTool.nameZh : currentTool.name}
                   </span>
                 </>
               )}
             </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
             {/* Search Bar (Desktop) */}
             <div className="relative w-full max-w-xs hidden md:block">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-sm rounded-full py-1.5 pl-10 pr-4 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-slate-500"
                />
             </div>

             <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

             {/* Language Switch */}
             <button 
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 font-medium text-sm"
                title="Switch Language"
             >
                <IconLanguage className="w-5 h-5" />
                <span className="hidden sm:inline">{lang === 'zh' ? 'EN' : '中'}</span>
             </button>

             {/* Theme Switch */}
             <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Toggle Theme"
             >
                {theme === 'dark' ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
             </button>
          </div>
        </header>

        {/* Quick Menu (Shortcut Bar) */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-20 shadow-sm transition-colors">
            {/* Top Row: Categories */}
            <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-100 dark:border-slate-800/50 px-2">
                {QUICK_MENU_CATEGORIES.map(cat => {
                    const catLabel = cat === 'Common' ? t.common : (t[cat as keyof typeof t] || cat);
                    return (
                        <button
                            key={cat}
                            onClick={() => setQuickMenuCategory(cat)}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                quickMenuCategory === cat 
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                            {catLabel}
                        </button>
                    )
                })}
            </div>
            
            {/* Bottom Row: Tools Chips */}
            <div className="flex overflow-x-auto p-3 gap-3 items-center scrollbar-hide bg-slate-50/50 dark:bg-transparent">
                {getToolsForQuickMenu(quickMenuCategory).map(tool => {
                    const isActive = currentToolId === tool.id;
                    const toolName = lang === 'zh' ? tool.nameZh : tool.name;
                    return (
                        <button 
                            key={tool.id}
                            onClick={() => handleToolSelect(tool.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                                isActive 
                                ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500 text-primary-600 dark:text-primary-400' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-200 shadow-sm'
                            }`}
                        >
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                            {toolName}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 transition-colors">
           <div className="max-w-6xl mx-auto h-full">
             
             {currentTool ? (
                // Tool View
               <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl min-h-[500px] flex flex-col animate-in fade-in duration-300 text-slate-200">
                  {/* Note: Tools are currently optimized for dark mode internal display. Forcing dark container for tool content. */}
                  {currentTool.component}
               </div>
             ) : (
                // Dashboard View
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10">
                  <div className="text-center space-y-4 py-8">
                     <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {t.welcome}
                     </h2>
                     <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                        {t.desc}
                     </p>
                     
                     {/* Mobile Search */}
                     <div className="relative max-w-sm mx-auto md:hidden">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          placeholder={t.search}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary-500 shadow-sm"
                        />
                     </div>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {filteredTools.length > 0 ? (
                       filteredTools.map(tool => (
                         <ToolCard key={tool.id} tool={tool} onClick={handleToolSelect} lang={lang} />
                       ))
                    ) : (
                      <div className="col-span-full text-center py-20 text-slate-500 dark:text-slate-400">
                        <p>{t.noResults}</p>
                        <button onClick={() => { setSearchTerm(''); setActiveCategory('All'); }} className="text-primary-600 dark:text-primary-500 hover:underline mt-2">{t.clear}</button>
                      </div>
                    )}
                  </div>
                </div>
             )}
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;