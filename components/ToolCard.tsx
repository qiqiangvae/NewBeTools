import React from 'react';
import { ToolDef } from '../types';

interface ToolCardProps {
  tool: ToolDef;
  onClick: (id: string) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  return (
    <div 
      onClick={() => onClick(tool.id)}
      className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-primary-500/50 rounded-xl p-5 cursor-pointer transition-all duration-200 group flex flex-col gap-3 h-full shadow-lg hover:shadow-xl hover:-translate-y-1"
    >
      <div className="flex items-start justify-between">
        <div className="p-2 bg-slate-700/50 rounded-lg text-primary-400 group-hover:text-primary-300 group-hover:bg-primary-900/20 transition-colors">
          {tool.icon}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-1 group-hover:text-primary-400 transition-colors">{tool.name}</h3>
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>
    </div>
  );
};

export default ToolCard;
