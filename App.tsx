import React, { useState, useMemo, useEffect } from 'react';
import { 
  ToolCategory, 
  ToolDef 
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
  IconSignature,
  IconPinyin,
  IconFormat
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
    description: 'Format, validate, and minify JSON data.',
    category: ToolCategory.DEVELOPER,
    icon: <IconJson className="w-6 h-6" />,
    component: <JsonFormatter />,
    keywords: ['json', 'parse', 'prettify']
  },
  {
    id: 'regex-test',
    name: 'Regex Tester',
    description: 'Test and generate Regular Expressions with AI.',
    category: ToolCategory.DEVELOPER,
    icon: <IconRegex className="w-6 h-6" />,
    component: <RegexTester />,
    keywords: ['regex', 'match', 'pattern']
  },
  {
    id: 'hash',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes.',
    category: ToolCategory.CRYPTO,
    icon: <IconHash className="w-6 h-6" />,
    component: <HashGenerator />,
    keywords: ['md5', 'sha', 'crypto', 'digest']
  },
  {
    id: 'text-diff',
    name: 'Text Diff',
    description: 'Compare two texts and highlight differences.',
    category: ToolCategory.DEVELOPER,
    icon: <IconDiff className="w-6 h-6" />,
    component: <TextDiff />,
    keywords: ['diff', 'compare', 'difference']
  },
  {
    id: 'ip-lookup',
    name: 'IP Lookup',
    description: 'Get details about your IP or any other IP address.',
    category: ToolCategory.UTILITY,
    icon: <IconGlobe className="w-6 h-6" />,
    component: <IpLookup />,
    keywords: ['ip', 'geo', 'location']
  },
  {
    id: 'qr-code',
    name: 'QR Code',
    description: 'Generate QR codes from text or URLs.',
    category: ToolCategory.UTILITY,
    icon: <IconQrCode className="w-6 h-6" />,
    component: <QrCodeGenerator />,
    keywords: ['qr', 'barcode', '2d']
  },
  {
    id: 'url-enc',
    name: 'URL Tools',
    description: 'Encode/Decode URLs and Parse parameters.',
    category: ToolCategory.CONVERTER,
    icon: <IconUrl className="w-6 h-6" />,
    component: <UrlConverter />,
    keywords: ['url', 'uri', 'percent']
  },
  {
    id: 'base64',
    name: 'Base64',
    description: 'Encode and decode Base64 strings.',
    category: ToolCategory.CONVERTER,
    icon: <IconBase64 className="w-6 h-6" />,
    component: <Base64Converter />,
    keywords: ['base64', 'encode', 'decode']
  },
  {
    id: 'timestamp',
    name: 'Timestamp',
    description: 'Unix timestamp conversion tools.',
    category: ToolCategory.UTILITY,
    icon: <IconClock className="w-6 h-6" />,
    component: <TimestampConverter />,
    keywords: ['time', 'date', 'unix']
  },
  {
    id: 'pinyin',
    name: 'Pinyin Converter',
    description: 'Convert Chinese characters to Pinyin.',
    category: ToolCategory.CONVERTER,
    icon: <IconPinyin className="w-6 h-6" />,
    component: <PinyinConverter />,
    keywords: ['chinese', 'pinyin', 'convert']
  },
  {
    id: 'code-fmt',
    name: 'Code Format',
    description: 'Format code in various languages using AI.',
    category: ToolCategory.DEVELOPER,
    icon: <IconFormat className="w-6 h-6" />,
    component: <CodeFormatter />,
    keywords: ['format', 'prettier', 'beautify']
  },
  {
    id: 'base-conv',
    name: 'Base Converter',
    description: 'Convert Decimal, Binary, Hex, Octal.',
    category: ToolCategory.CONVERTER,
    icon: <IconBinary className="w-6 h-6" />,
    component: <NumberBaseConverter />,
    keywords: ['hex', 'bin', 'dec', 'oct']
  },
  {
    id: 'string-case',
    name: 'Variable Name',
    description: 'Camel, Snake, Pascal, Kebab case converter.',
    category: ToolCategory.DEVELOPER,
    icon: <IconType className="w-6 h-6" />,
    component: <StringCaseConverter />,
    keywords: ['case', 'camel']
  },
  {
    id: 'color-conv',
    name: 'Color Converter',
    description: 'HEX, RGB, HSL converter.',
    category: ToolCategory.CONVERTER,
    icon: <IconPalette className="w-6 h-6" />,
    component: <ColorConverter />,
    keywords: ['hex', 'rgb', 'color']
  },
  {
    id: 'unit-conv',
    name: 'Unit Converter',
    description: 'Storage, Length, Time units.',
    category: ToolCategory.UTILITY,
    icon: <IconRuler className="w-6 h-6" />,
    component: <UnitConverter />,
    keywords: ['measure']
  },
  {
    id: 'ai-assist',
    name: 'AI Assistant',
    description: 'General purpose AI helper.',
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [quickMenuCategory, setQuickMenuCategory] = useState<string>('Common');

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => {
      const matchesSearch = 
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const currentTool = TOOLS.find(t => t.id === currentToolId);

  const handleToolSelect = (id: string) => {
    setCurrentToolId(id);
    setSidebarOpen(false);
    setSearchTerm('');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Auto-update quick menu category to match the selected tool if not in "Common"
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
        // Return tools in the specific order of the screenshot if possible, or just filtered
        return TOOLS.filter(t => COMMON_TOOLS_IDS.includes(t.id));
    }
    return TOOLS.filter(t => t.category === category);
  };

  // Helper to get unique categories for dashboard
  const categories = ['All', ...Array.from(new Set(TOOLS.map(t => t.category)))];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleGoHome}>
             <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20">
               DT
             </div>
             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
               DevTool
             </h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <IconX className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Categories */}
          <div>
            <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Navigation
            </div>
            <button
               onClick={handleGoHome}
               className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${!currentToolId ? 'bg-primary-500/10 text-primary-400 border border-primary-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <IconHome className="w-5 h-5" />
              All Tools
            </button>
          </div>

          <div>
             <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tools
            </div>
            <div className="space-y-1">
              {TOOLS.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${currentToolId === tool.id ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                  <span className="opacity-70">{tool.icon}</span>
                  {tool.name}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-600 text-center">
            &copy; {new Date().getFullYear()} DevTool Hub
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0 shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
               <IconMenu className="w-6 h-6" />
             </button>
             {/* Breadcrumb / Title */}
             <div className="text-sm text-slate-400 flex items-center gap-2">
               <span className="cursor-pointer hover:text-slate-200" onClick={handleGoHome}>Home</span>
               {currentTool && (
                 <>
                   <span>/</span>
                   <span className="text-primary-400 font-medium">{currentTool.name}</span>
                 </>
               )}
             </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-md hidden md:block">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-full py-1.5 pl-10 pr-4 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-slate-600"
            />
          </div>
        </header>

        {/* Quick Menu (Shortcut Bar) */}
        <div className="bg-slate-900 border-b border-slate-800 shrink-0 z-20 shadow-md">
            {/* Top Row: Categories */}
            <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-800/50 px-2">
                {QUICK_MENU_CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setQuickMenuCategory(cat)}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                            quickMenuCategory === cat 
                            ? 'border-primary-500 text-primary-400' 
                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            
            {/* Bottom Row: Tools Chips */}
            <div className="flex overflow-x-auto p-3 gap-3 items-center scrollbar-hide">
                {getToolsForQuickMenu(quickMenuCategory).map(tool => {
                    const isActive = currentToolId === tool.id;
                    return (
                        <button 
                            key={tool.id}
                            onClick={() => handleToolSelect(tool.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                                isActive 
                                ? 'bg-primary-500/10 border-primary-500 text-primary-400' 
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:border-slate-600 hover:text-slate-200'
                            }`}
                        >
                            <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${isActive ? 'border-primary-500' : 'border-slate-500'}`}>
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
                            </div>
                            {tool.name}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 lg:p-8">
           <div className="max-w-6xl mx-auto h-full">
             
             {currentTool ? (
                // Tool View
               <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl min-h-[500px] flex flex-col animate-in fade-in duration-300">
                  {currentTool.component}
               </div>
             ) : (
                // Dashboard View
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10">
                  <div className="text-center space-y-4 py-8">
                     <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                        Developer Utilities <span className="text-primary-500">Hub</span>
                     </h2>
                     <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Your essential Swiss Army knife for development. Privacy-first, client-side tools for everyday tasks.
                     </p>
                     
                     {/* Mobile Search */}
                     <div className="relative max-w-sm mx-auto md:hidden">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          type="text"
                          placeholder="Find a tool..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary-500"
                        />
                     </div>
                  </div>

                  {/* Category Filter Pills (Optional since top bar exists, but good for overview) */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {filteredTools.length > 0 ? (
                       filteredTools.map(tool => (
                         <ToolCard key={tool.id} tool={tool} onClick={handleToolSelect} />
                       ))
                    ) : (
                      <div className="col-span-full text-center py-20 text-slate-500">
                        <p>No tools found matching your search.</p>
                        <button onClick={() => { setSearchTerm(''); setActiveCategory('All'); }} className="text-primary-500 hover:underline mt-2">Clear filters</button>
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