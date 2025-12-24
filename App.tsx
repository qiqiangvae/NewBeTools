
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
  IconCase,
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
  IconPanelLeft,
  IconZap,
  IconKey,
  IconCode
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
import UuidGenerator from './components/tools/UuidGenerator';
import JwtDecoder from './components/tools/JwtDecoder';
import UnicodeConverter from './components/tools/UnicodeConverter';
import CodeFormatter from './components/tools/CodeFormatter';
import TextProcessor from './components/tools/TextProcessor';
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
    component: <JsonFormatter lang="en" />,
    keywords: ['json', 'parse', 'prettify']
  },
  {
    id: 'text-proc',
    name: 'Text Processor',
    nameZh: '文本处理',
    description: 'Unescape newlines, wrap lines with quotes, or add suffixes.',
    descriptionZh: '一键将 \\n 替换为换行、添加行首尾字符或后缀。',
    category: ToolCategory.DEVELOPER,
    icon: <IconType className="w-5 h-5" />,
    component: <TextProcessor lang="en" />,
    keywords: ['text', 'process', 'quote', 'suffix', 'newline']
  },
  {
    id: 'code-fmt',
    name: 'Code Formatter',
    nameZh: '代码格式化',
    description: 'Format code with AI (JS, Py, HTML, etc).',
    descriptionZh: 'AI 智能代码格式化 (支持多种语言)。',
    category: ToolCategory.DEVELOPER,
    icon: <IconFormat className="w-5 h-5" />,
    component: <CodeFormatter lang="en" />,
    keywords: ['format', 'prettier', 'beautify']
  },
  {
    id: 'uuid-gen',
    name: 'UUID Generator',
    nameZh: 'UUID 生成器',
    description: 'Generate random UUIDs (v4).',
    descriptionZh: '批量生成随机 UUID (v4)。',
    category: ToolCategory.DEVELOPER,
    icon: <IconZap className="w-5 h-5" />,
    component: <UuidGenerator lang="en" />,
    keywords: ['uuid', 'guid', 'id']
  },
  {
    id: 'jwt-decode',
    name: 'JWT Decoder',
    nameZh: 'JWT 解码',
    description: 'Decode JSON Web Tokens.',
    descriptionZh: '解析 JWT 头部 and 载荷信息。',
    category: ToolCategory.DEVELOPER,
    icon: <IconKey className="w-5 h-5" />,
    component: <JwtDecoder lang="en" />,
    keywords: ['jwt', 'token', 'auth']
  },
  {
    id: 'regex-test',
    name: 'Regex Tester',
    nameZh: '正则表达式',
    description: 'Test and generate Regular Expressions with AI.',
    descriptionZh: '利用 AI 测试和生成正则表达式。',
    category: ToolCategory.DEVELOPER,
    icon: <IconRegex className="w-5 h-5" />,
    component: <RegexTester lang="en" />,
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
    component: <HashGenerator lang="en" />,
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
    component: <TextDiff lang="en" />,
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
    component: <IpLookup lang="en" />,
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
    component: <QrCodeGenerator lang="en" />,
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
    component: <UrlConverter lang="en" />,
    keywords: ['url', 'uri', 'percent']
  },
  {
    id: 'base64',
    name: 'Base64 / Base62',
    nameZh: 'Base64 / Base62',
    description: 'Convert between Text, Base64, and Base62.',
    descriptionZh: '文本、Base64、Base62 等格式的相互转换。',
    category: ToolCategory.CONVERTER,
    icon: <IconBase64 className="w-5 h-5" />,
    component: <Base64Converter lang="en" />,
    keywords: ['base64', 'base62', 'encode', 'decode']
  },
  {
    id: 'unicode',
    name: 'Unicode Converter',
    nameZh: 'Unicode 转码',
    description: 'Convert text to/from Unicode escapes (\\uXXXX) and UTF-8 Hex.',
    descriptionZh: '文本与 Unicode (\\uXXXX) 或 UTF-8 Hex 编码互转。',
    category: ToolCategory.CONVERTER,
    icon: <IconCode className="w-5 h-5" />,
    component: <UnicodeConverter lang="en" />,
    keywords: ['unicode', 'escape', 'utf8', 'hex']
  },
  {
    id: 'timestamp',
    name: 'Timestamp',
    nameZh: '时间戳转换',
    description: 'Unix timestamp conversion tools.',
    descriptionZh: 'Unix 时间戳与日期时间的相互转换。',
    category: ToolCategory.UTILITY,
    icon: <IconClock className="w-5 h-5" />,
    component: <TimestampConverter lang="en" />,
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
    component: <PinyinConverter lang="en" />,
    keywords: ['chinese', 'pinyin', 'convert']
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
    icon: <IconCase className="w-5 h-5" />,
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
    component: <AiAssistant lang="en" />,
    keywords: ['ai', 'gemini']
  },
];

const App: React.FC = () => {
  const [currentToolId, setCurrentToolId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [isCollapsed, setIsCollapsed] = useState(true); 
  
  // Cache for tool states
  const [toolStates, setToolStates] = useState<Record<string, any>>({});
  
  const [lang, setLang] = useState<Lang>('zh');
  const [theme, setTheme] = useState<Theme>('dark');

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

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => {
        if (!searchTerm) return true;
        const toolName = lang === 'zh' ? tool.nameZh : tool.name;
        const toolDesc = lang === 'zh' ? tool.descriptionZh : tool.description;
        return (
            toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            toolDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });
  }, [searchTerm, lang]);

  const groupedTools = useMemo<Record<string, ToolDef[]>>(() => {
    const groups: Record<string, ToolDef[]> = {};
    filteredTools.forEach(tool => {
        if (!groups[tool.category]) groups[tool.category] = [];
        groups[tool.category].push(tool);
    });
    return groups;
  }, [filteredTools]);

  const currentTool = TOOLS.find(t => t.id === currentToolId);

  const handleToolSelect = (id: string) => {
    setCurrentToolId(id);
    setIsSidebarOpen(false); 
    if (window.innerWidth < 768) {
        setSearchTerm('');
    }
  };

  const handleGoHome = () => {
    setCurrentToolId(null);
    setIsSidebarOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const updateToolState = (id: string, newState: any) => {
    setToolStates(prev => ({ ...prev, [id]: newState }));
  };

  const isDesktopCollapsed = !isSidebarOpen && isCollapsed;

  // Flattened Navigation Helper
  const renderNavItem = (item: any, isHome = false) => {
    const isActive = isHome ? !currentToolId : currentToolId === item.id;
    const label = isHome ? t.home : (lang === 'zh' ? item.nameZh : item.name);
    const onClick = isHome ? handleGoHome : () => handleToolSelect(item.id);

    return (
        <button
            key={isHome ? 'home-nav' : item.id}
            onClick={onClick}
            title={label}
            className={`flex items-center rounded-md text-xs font-medium transition-all group shrink-0 ${
                isActive
                ? (isDesktopCollapsed ? 'bg-primary-600 text-white' : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400')
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            } ${isDesktopCollapsed ? 'w-12 h-10 justify-center gap-0 p-0' : 'w-full px-2 py-2 gap-3'}`}
        >
            <span className={`shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${isActive ? (isDesktopCollapsed ? 'text-white' : 'text-primary-500') : 'text-slate-400 group-hover:text-primary-500'}`}>
                {isHome ? <IconHome className="w-5 h-5" /> : item.icon}
            </span>
            <span className={`truncate transition-all duration-300 ${isDesktopCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                {label}
            </span>
        </button>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 overflow-hidden font-sans text-sm">
      
      {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
            onClick={() => setIsSidebarOpen(false)}
          />
      )}

      <aside className={`
          fixed md:static inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out shadow-2xl md:shadow-none
          ${isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isDesktopCollapsed ? 'md:w-16' : 'md:w-64'}
      `}>
          {/* Sidebar Header */}
          <div className={`flex items-center border-b border-slate-100 dark:border-slate-800 shrink-0 overflow-hidden transition-all duration-300 ${isDesktopCollapsed ? 'h-12 px-0 justify-center' : 'h-14 px-4'}`}>
             <div 
                className={`flex items-center cursor-pointer group transition-all duration-300 ${isDesktopCollapsed ? 'justify-center w-12 gap-0' : 'w-full gap-3'}`} 
                onClick={handleGoHome}
             >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md text-xs shrink-0">
                    NB
                </div>
                <span className={`text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-100 dark:to-slate-300 whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                    NewBeTools
                </span>
             </div>
             
             {!isDesktopCollapsed && (
                <button onClick={toggleCollapse} className="ml-auto p-1.5 rounded-md text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    <IconPanelLeft className="w-4 h-4 transform rotate-180" />
                </button>
             )}

             <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-auto text-slate-400">
                 <IconX className="w-5 h-5" />
             </button>
          </div>

          <div className={`p-2 shrink-0 transition-all duration-300 ${isDesktopCollapsed ? 'opacity-0 h-0 p-0 overflow-hidden' : 'opacity-100 h-12'}`}>
             <div className="relative">
                <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                    type="text"
                    placeholder={t.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-md py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-primary-500 placeholder:text-slate-500 transition-all"
                />
             </div>
          </div>

          {/* Collapsed Mode Toggler (Centered) */}
          {isDesktopCollapsed && (
              <div className="flex justify-center border-b border-slate-100 dark:border-slate-800 hidden md:flex w-full py-0.5">
                  <button onClick={toggleCollapse} className="w-12 h-10 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-500 transition-colors">
                      <IconMenu className="w-5 h-5" />
                  </button>
              </div>
          )}

          {/* Navigation Area */}
          <div className={`flex-1 overflow-y-auto py-1 transition-all duration-300 ${isDesktopCollapsed ? 'px-0 flex flex-col items-center gap-1' : 'px-2'}`}>
              
              {/* If collapsed, use a completely flat list for uniform spacing */}
              {isDesktopCollapsed ? (
                <>
                  {renderNavItem(null, true)}
                  {filteredTools.map(tool => renderNavItem(tool))}
                </>
              ) : (
                <>
                  {renderNavItem(null, true)}
                  <div className="w-full space-y-4">
                    {Object.entries(groupedTools).map(([cat, tools]) => (
                        <div key={cat} className="flex flex-col w-full">
                            <div className="px-2 mb-1 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {t[cat as ToolCategory] || cat}
                            </div>
                            <div className="w-full space-y-0.5">
                                {tools.map(tool => renderNavItem(tool))}
                            </div>
                        </div>
                    ))}
                  </div>
                </>
              )}
          </div>

          {/* Sidebar Footer */}
          <div className={`p-2 border-t border-slate-100 dark:border-slate-800 shrink-0 flex transition-all duration-300 ${isDesktopCollapsed ? 'flex-col items-center gap-1 px-0 py-2' : 'gap-2'}`}>
               <button 
                  onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                  title={lang === 'zh' ? 'English' : '中文'}
                  className={`flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium transition-all ${isDesktopCollapsed ? 'w-12 h-10 gap-0' : 'flex-1 py-2 gap-2'}`}
               >
                  <IconLanguage className="w-4 h-4 shrink-0" />
                  <span className={`whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                    {lang === 'zh' ? '中文' : 'EN'}
                  </span>
               </button>
               <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  className={`flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all ${isDesktopCollapsed ? 'w-12 h-10' : 'w-10 py-2'}`}
               >
                  {theme === 'dark' ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
               </button>
          </div>
      </aside>

      <div className="flex-1 flex flex-col h-full min-w-0">
         <header className="md:hidden h-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3 shrink-0 sticky top-0 z-30">
             <button onClick={() => setIsSidebarOpen(true)} className="p-1 -ml-1 text-slate-600 dark:text-slate-300">
                 <IconMenu className="w-5 h-5" />
             </button>
             <h1 className="font-bold text-slate-900 dark:text-white truncate text-sm">
                 {currentTool ? (lang === 'zh' ? currentTool.nameZh : currentTool.name) : 'NewBeTools'}
             </h1>
         </header>

         <main className="flex-1 overflow-auto p-2 md:p-4">
            <div className={`h-full flex flex-col ${currentTool ? 'w-full' : 'max-w-7xl mx-auto'}`}>
                {currentTool ? (
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                         <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm overflow-hidden flex flex-col">
                             {React.isValidElement(currentTool.component) 
                                ? React.cloneElement(currentTool.component as React.ReactElement<any>, { 
                                    lang,
                                    state: toolStates[currentTool.id],
                                    onStateChange: (s: any) => updateToolState(currentTool.id, s)
                                  }) 
                                : currentTool.component}
                         </div>
                    </div>
                ) : (
                    <div className="space-y-6 pb-6">
                        <div className="text-center py-6 md:py-10 space-y-3">
                            <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary-500/10 to-indigo-500/10 mb-2">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    NB
                                </div>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {t.welcome}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
                                {t.desc}
                            </p>
                        </div>

                        {Object.entries(groupedTools).length > 0 ? (Object.entries(groupedTools) as [string, ToolDef[]][]).map(([cat, tools]) => (
                            <div key={cat} className="space-y-3">
                                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {t[cat as ToolCategory] || cat}
                                    </h3>
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full">
                                        {tools.length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
                            <div className="text-center text-slate-500 py-20">
                                <p className="italic">{lang === 'zh' ? '没有找到相关工具' : 'No tools matching your search'}</p>
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
