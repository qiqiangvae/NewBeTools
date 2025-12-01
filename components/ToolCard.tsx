import React from 'react';
import { ToolDef, Lang } from '../types';

interface ToolCardProps {
  tool: ToolDef;
  onClick: (id: string) => void;
  lang: Lang;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick, lang }) => {
  return (
    <div 
      onClick={() => onClick(tool.id)}
      className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-primary-500/50 rounded-xl p-5 cursor-pointer transition-all duration-200 group flex flex-col gap-3 h-full shadow-sm hover:shadow-lg hover:-translate-y-1"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-200">
          {tool.icon}
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {lang === 'zh' ? tool.nameZh : tool.name}
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
            {tool.category}
          </span>
        </div>
      </div>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
        {lang === 'zh' ? tool.descriptionZh : tool.description}
      </p>

      {/* Keywords / Tags - Optional, can show first 2 */}
      <div className="mt-auto pt-3 flex flex-wrap gap-2">
         {tool.keywords.slice(0, 3).map(k => (
             <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">#{k}</span>
         ))}
      </div>
    </div>
  );
};

export default ToolCard;