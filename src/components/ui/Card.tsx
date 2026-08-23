import React from 'react';
import { Check, Copy } from 'lucide-react';
import { TokenItem } from '../../types';

export const Card: React.FC<{
  item: TokenItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onCopy: (val: string) => void;
}> = ({ item, selected, onSelect, onCopy }) => {
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(item.displayValue);
  };

  return (
    <div 
      onClick={() => onSelect(item.id)}
      className={`
        group relative flex flex-col rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden
        ${selected 
          ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500' 
          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/50'}
      `}
    >
      {/* Visual Preview Area */}
      <div className="h-24 w-full relative flex items-center justify-center bg-zinc-950/30 border-b border-zinc-800/50 overflow-hidden">
        {item.type === 'COLOR' && (
          <div 
            className="absolute inset-0 w-full h-full transition-transform group-hover:scale-110 duration-500"
            style={{ backgroundColor: item.cssValue }}
          />
        )}
        
        {item.type === 'FLOAT' && (
          <div className="flex flex-col items-center justify-center w-full px-4">
             {/* Preview Bar */}
            <div className="w-full h-8 bg-zinc-800 rounded-md overflow-hidden flex items-center mb-2">
              <div 
                 className="h-full bg-blue-500 rounded-md" 
                 style={{ width: `${Math.min(Number(item.value) * 2, 100)}%` }} 
              />
            </div>
          </div>
        )}

        {item.type === 'STRING' && (
           <div className="px-4 text-center">
             <span className="text-xl font-bold text-zinc-500 truncate w-full block">
                {item.displayValue}
             </span>
           </div>
        )}

        {/* Selection Checkbox (Visual only) */}
        <div className={`absolute top-2 right-2 h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${selected ? 'bg-blue-500 border-blue-500' : 'bg-zinc-900/50 border-zinc-600'}`}>
            {selected && <Check size={12} className="text-white" />}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 flex flex-col gap-1">
        <div className="flex justify-between items-start">
           <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider truncate" title={item.subGroup}>{item.subGroup || item.group}</span>
              <span className="text-sm font-semibold text-zinc-200 truncate" title={item.name}>{item.label}</span>
           </div>
           <button 
             onClick={handleCopy}
             className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
             title="Copy value"
            >
              <Copy size={14} />
           </button>
        </div>
        <code className="text-xs text-zinc-400 bg-zinc-950/50 px-2 py-1 rounded w-fit mt-2 font-mono">
          {item.displayValue}
        </code>
      </div>
    </div>
  );
};
