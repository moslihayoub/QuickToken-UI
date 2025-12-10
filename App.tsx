import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Upload, Download, Copy, Trash2, Layers, Check, Grid, List, Search, Palette, Type, Ruler, Filter, X, ChevronDown, RefreshCcw, CloudUpload } from 'lucide-react';
import { FigmaExport, TokenItem, FigmaVariable, FigmaColorValue } from './types';
import { figmaColorToHex, figmaColorToRgba, downloadBlob, jsonToCSV, getContrastColor } from './utils';

// --- DEMO DATA ---
const DEMO_DATA_STR = JSON.stringify({
  "id": "demo-collection",
  "name": "Demo Collection",
  "modes": { "mode-1": "Default" },
  "variableIds": [],
  "variables": [
    // Colors - Lynch Gray Series
    ...[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((step, i) => ({
      "id": `color-lynch-${step}`,
      "name": `Color/Lynch Gray/${step}`,
      "type": "COLOR",
      "resolvedValuesByMode": {
        "mode-1": { "resolvedValue": { "r": 0.4 + (i * 0.05), "g": 0.45 + (i * 0.05), "b": 0.5 + (i * 0.05), "a": 1 } }
      }
    })),
    // Colors - Azure Radiance
    ...[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((step, i) => ({
      "id": `color-azure-${step}`,
      "name": `Color/Azure Radiance/${step}`,
      "type": "COLOR",
      "resolvedValuesByMode": {
        "mode-1": { "resolvedValue": { "r": 0.0 + (i * 0.02), "g": 0.5 - (i * 0.05), "b": 1.0 - (i * 0.05), "a": 1 } }
      }
    })),
    // Colors - Semantic
    { "id": "sem-success", "name": "Color/Semantic/Success", "type": "COLOR", "resolvedValuesByMode": { "mode-1": { "resolvedValue": { "r": 0.1, "g": 0.8, "b": 0.3, "a": 1 } } } },
    { "id": "sem-warning", "name": "Color/Semantic/Warning", "type": "COLOR", "resolvedValuesByMode": { "mode-1": { "resolvedValue": { "r": 0.9, "g": 0.7, "b": 0.1, "a": 1 } } } },
    { "id": "sem-error", "name": "Color/Semantic/Error", "type": "COLOR", "resolvedValuesByMode": { "mode-1": { "resolvedValue": { "r": 0.9, "g": 0.2, "b": 0.2, "a": 1 } } } },
    
    // Spacing
    { "id": "size-xs", "name": "Size/Spacing/XS", "type": "FLOAT", "resolvedValuesByMode": { "mode-1": { "resolvedValue": 4 } } },
    { "id": "size-sm", "name": "Size/Spacing/SM", "type": "FLOAT", "resolvedValuesByMode": { "mode-1": { "resolvedValue": 8 } } },
    { "id": "size-md", "name": "Size/Spacing/MD", "type": "FLOAT", "resolvedValuesByMode": { "mode-1": { "resolvedValue": 16 } } },
    { "id": "size-lg", "name": "Size/Spacing/LG", "type": "FLOAT", "resolvedValuesByMode": { "mode-1": { "resolvedValue": 24 } } },
    { "id": "size-xl", "name": "Size/Spacing/XL", "type": "FLOAT", "resolvedValuesByMode": { "mode-1": { "resolvedValue": 32 } } },

    // Font Families
    { "id": "font-main", "name": "Font/Family/Primary", "type": "STRING", "resolvedValuesByMode": { "mode-1": { "resolvedValue": "Inter" } } },
    { "id": "font-mono", "name": "Font/Family/Mono", "type": "STRING", "resolvedValuesByMode": { "mode-1": { "resolvedValue": "JetBrains Mono" } } }
  ]
});

// --- Helper Functions ---

const parseTokens = (content: string): TokenItem[] => {
  try {
    const json: FigmaExport = JSON.parse(content);
    
    if (!json.variables) {
      throw new Error("Invalid format: 'variables' array missing.");
    }

    const defaultModeId = Object.keys(json.modes)[0];

    return json.variables.map(v => {
      const resolvedEntry = v.resolvedValuesByMode[defaultModeId];
      const rawValue = resolvedEntry?.resolvedValue;

      let displayValue = '';
      let cssValue = '';

      if (v.type === 'COLOR') {
        const colorVal = rawValue as FigmaColorValue;
        // Handle cases where color might be incomplete or just RGB
        if(colorVal && typeof colorVal.r === 'number') {
           displayValue = figmaColorToHex(colorVal);
           cssValue = figmaColorToRgba(colorVal);
        } else {
           displayValue = '#000000';
           cssValue = 'rgb(0,0,0)';
        }
      } else if (v.type === 'FLOAT') {
        const numVal = rawValue as number;
        displayValue = `${numVal}px`;
        cssValue = `${numVal}px`;
      } else {
        displayValue = String(rawValue);
        cssValue = String(rawValue);
      }

      const path = v.name.split('/');
      const group = path[0] || 'Other';
      const label = path[path.length - 1];
      const subGroup = path.length > 2 ? path.slice(1, -1).join(' / ') : '';

      return {
        id: v.id,
        name: v.name,
        group,
        subGroup,
        label,
        type: v.type,
        value: rawValue,
        displayValue,
        cssValue,
        originalData: v
      };
    });
  } catch (e) {
    console.error("Parsing Error", e);
    throw e;
  }
};

// --- Sub-Components ---

const Card: React.FC<{
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

// --- Main App Component ---

const App: React.FC = () => {
  // Initialize with Demo Data
  const [data, setData] = useState<TokenItem[]>(() => parseTokens(DEMO_DATA_STR));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('ALL');
  
  // Filtering State
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(new Set(['COLOR', 'FLOAT', 'STRING', 'UNKNOWN']));
  const [visibleSubGroups, setVisibleSubGroups] = useState<Set<string>>(new Set());

  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize filters when data changes
  useEffect(() => {
     if (data.length > 0) {
        // Automatically select all subgroups when data loads
        const allSubs = new Set(data.map(i => i.subGroup || 'General'));
        setVisibleSubGroups(allSubs);
     }
  }, [data]);

  // Close filter on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Logic ---

  const loadData = useCallback((content: string) => {
    try {
      const items = parseTokens(content);
      setData(items);
      setSelectedIds(new Set()); // Reset selections
      showToast(`Successfully imported ${items.length} tokens`, 'success');
    } catch (e) {
      showToast('Failed to parse file. Ensure it is a valid Figma Variables Export JSON.', 'error');
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        loadData(text);
      };
      reader.readAsText(file);
    }
    // Reset input value to allow same file upload again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
     loadData(DEMO_DATA_STR);
     showToast("Reset to default demo data", "success");
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied: ${text.substring(0, 20)}${text.length > 20 ? '...' : ''}`);
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    const visibleIds = filteredData.map(i => i.id);
    const allSelected = visibleIds.every(id => selectedIds.has(id));
    
    if (allSelected) {
       const newSet = new Set(selectedIds);
       visibleIds.forEach(id => newSet.delete(id));
       setSelectedIds(newSet);
    } else {
       const newSet = new Set(selectedIds);
       visibleIds.forEach(id => newSet.add(id));
       setSelectedIds(newSet);
    }
  };

  const exportSelection = (format: 'json' | 'csv') => {
    const itemsToExport = data.filter(i => selectedIds.has(i.id));
    if (itemsToExport.length === 0) return;

    if (format === 'json') {
      const output = itemsToExport.reduce((acc, item) => {
        acc[item.name] = item.value;
        return acc;
      }, {} as Record<string, any>);
      downloadBlob(JSON.stringify(output, null, 2), 'tokens.json', 'application/json');
    } else {
      const csvContent = jsonToCSV(itemsToExport);
      downloadBlob(csvContent, 'tokens.csv', 'text/csv');
    }
    showToast(`Exported ${itemsToExport.length} items`);
  };

  const copySelectionJson = () => {
    const itemsToExport = data.filter(i => selectedIds.has(i.id));
    const output = itemsToExport.reduce((acc, item) => {
        acc[item.name] = item.displayValue;
        return acc;
      }, {} as Record<string, any>);
    copyToClipboard(JSON.stringify(output, null, 2));
  };

  const toggleTypeFilter = (type: string) => {
      const newSet = new Set(visibleTypes);
      if(newSet.has(type)) newSet.delete(type);
      else newSet.add(type);
      setVisibleTypes(newSet);
  };

  const toggleSubGroupFilter = (subGroup: string) => {
      const newSet = new Set(visibleSubGroups);
      if(newSet.has(subGroup)) newSet.delete(subGroup);
      else newSet.add(subGroup);
      setVisibleSubGroups(newSet);
  };

  // --- Filtering & Derived State ---

  const groups = useMemo(() => {
    const g = new Set(data.map(i => i.group));
    return ['ALL', ...Array.from(g)];
  }, [data]);

  const uniqueTypes = useMemo(() => Array.from(new Set(data.map(d => d.type))), [data]);
  
  // Update uniqueSubGroups to depend on visibleTypes
  const uniqueSubGroups = useMemo(() => {
    // 1. Filter by Active Tab (Group)
    let relevantItems = activeTab === 'ALL' ? data : data.filter(i => i.group === activeTab);
    
    // 2. Filter by Visible Types (Hides categories that don't match selected types)
    relevantItems = relevantItems.filter(i => visibleTypes.has(i.type));

    const subs = new Set(relevantItems.map(i => i.subGroup || 'General'));
    return Array.from(subs).sort();
  }, [data, activeTab, visibleTypes]);

  // Calculate if any active filter is applied for Badge Logic
  const hasActiveCategoryFilter = useMemo(() => {
      // Check if any of the CURRENTLY RELEVANT subgroups are unchecked
      return uniqueSubGroups.some(sg => !visibleSubGroups.has(sg));
  }, [uniqueSubGroups, visibleSubGroups]);

  const hasActiveTypeFilter = visibleTypes.size < uniqueTypes.length;
  const showFilterBadge = hasActiveCategoryFilter || hasActiveTypeFilter;


  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.displayValue.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'ALL' || item.group === activeTab;
      const matchesType = visibleTypes.has(item.type);
      const itemSubGroup = item.subGroup || 'General';
      const matchesSubGroup = visibleSubGroups.has(itemSubGroup);

      return matchesSearch && matchesTab && matchesType && matchesSubGroup;
    });
  }, [data, searchTerm, activeTab, visibleTypes, visibleSubGroups]);

  const groupedDisplayData = useMemo(() => {
    const sections: Record<string, TokenItem[]> = {};
    
    filteredData.forEach(item => {
        let key = '';
        if (activeTab === 'ALL') {
            key = item.group;
        } else {
            key = item.subGroup || 'General';
        }
        
        if (!sections[key]) sections[key] = [];
        sections[key].push(item);
    });

    const sortedKeys = Object.keys(sections).sort((a, b) => {
        if(a === 'General' || a === 'Other') return 1;
        if(b === 'General' || b === 'Other') return -1;
        return a.localeCompare(b);
    });

    return sortedKeys.map(key => ({
        title: key,
        items: sections[key]
    }));
  }, [filteredData, activeTab]);


  const toggleAllSubGroups = () => {
    const allRelevant = uniqueSubGroups;
    const allSelected = allRelevant.every(sg => visibleSubGroups.has(sg));
    const newSet = new Set(visibleSubGroups);
    if (allSelected) {
        allRelevant.forEach(sg => newSet.delete(sg));
    } else {
        allRelevant.forEach(sg => newSet.add(sg));
    }
    setVisibleSubGroups(newSet);
  };

  // --- Render ---

  return (
    <div 
      className="min-h-screen bg-zinc-950 flex flex-col"
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = (ev) => loadData(ev.target?.result as string);
            reader.readAsText(file);
        }
      }}
    >
      {/* Full screen Drop overlay */}
      {dragActive && (
          <div className="fixed inset-0 z-50 bg-blue-600/20 backdrop-blur-sm flex items-center justify-center border-4 border-blue-500 border-dashed m-4 rounded-3xl pointer-events-none">
              <div className="bg-zinc-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
                  <CloudUpload className="w-16 h-16 text-blue-500 mb-4" />
                  <h2 className="text-2xl font-bold text-white">Drop to Import</h2>
              </div>
          </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                 <Layers className="text-white h-4 w-4" />
              </div>
              <span className="font-bold text-lg hidden sm:block text-zinc-100">QuickToken</span>
           </div>
           
           <div className="flex items-center gap-3 flex-1 max-w-md mx-4">
              <div className="relative w-full group">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search tokens..." 
                  className="w-full h-9 rounded-md bg-zinc-900 border border-zinc-800 pl-9 pr-4 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-zinc-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
           </div>

           <div className="flex items-center gap-2">
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".json,.csv" 
                  onChange={handleFileUpload} 
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 rounded-md transition-all"
                title="Import JSON/CSV"
              >
                <CloudUpload size={16} />
                <span className="hidden md:inline">Import</span>
              </button>

              <button 
                onClick={handleReset}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                title="Reset to Demo Data"
              >
                <RefreshCcw size={18} />
              </button>
           </div>
        </div>
        
        {/* Tabs */}
        <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 border-b border-transparent">
             {groups.map(group => (
               <button
                 key={group}
                 onClick={() => setActiveTab(group)}
                 className={`
                   px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2
                   ${activeTab === group 
                     ? 'border-blue-500 text-blue-400' 
                     : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'}
                 `}
               >
                 {group === 'Color' && <Palette size={14} />}
                 {group === 'Font' && <Type size={14} />}
                 {group === 'Size' && <Ruler size={14} />}
                 {group}
               </button>
             ))}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between sticky top-32 z-20">
          <div className="flex items-center gap-4">
             <p className="text-sm text-zinc-500">
                Showing {filteredData.length} tokens
            </p>
          </div>

          <div className="flex gap-3 relative">
            <button 
              onClick={selectAll} 
              className="px-3 py-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
            >
              {selectedIds.size === filteredData.length && filteredData.length > 0 ? 'Deselect All' : 'Select All View'}
            </button>
            
            {/* Filter Dropdown Trigger */}
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border ${filterOpen ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-transparent border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'}`}
            >
                <Filter size={14} />
                Filters
                <div className={`w-4 h-4 rounded-full bg-blue-600 text-[10px] flex items-center justify-center text-white ${showFilterBadge ? 'opacity-100' : 'opacity-0'} transition-opacity`}>!</div>
                <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`}/>
            </button>

            {/* Filter Dropdown */}
            {filterOpen && (
                <div ref={filterRef} className="absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl shadow-black p-4 z-50">
                    
                    {/* Filter by Type */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                             {uniqueTypes.map(type => (
                                <button
                                    key={type}
                                    onClick={() => toggleTypeFilter(type)}
                                    className={`px-2 py-1 rounded text-xs border transition-colors ${visibleTypes.has(type) ? 'bg-blue-600/20 border-blue-600 text-blue-300' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                                >
                                    {type.toLowerCase()}
                                </button>
                             ))}
                        </div>
                    </div>
                    
                    <div className="border-t border-zinc-800 my-3"></div>

                    {/* Filter by Category (SubGroup) */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Categories</span>
                             <button onClick={toggleAllSubGroups} className="text-[10px] text-blue-400 hover:text-blue-300">
                                {uniqueSubGroups.every(sg => visibleSubGroups.has(sg)) ? 'Deselect All' : 'Select All'}
                             </button>
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            {uniqueSubGroups.length > 0 ? (
                                uniqueSubGroups.map(subGroup => (
                                 <label key={subGroup} className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800 p-1.5 rounded-lg transition-colors group">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${visibleSubGroups.has(subGroup) ? 'bg-blue-600 border-blue-600' : 'border-zinc-600 group-hover:border-zinc-500'}`}>
                                        {visibleSubGroups.has(subGroup) && <Check size={10} className="text-white"/>}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="hidden" 
                                        checked={visibleSubGroups.has(subGroup)}
                                        onChange={() => toggleSubGroupFilter(subGroup)}
                                    />
                                    <span className="text-sm text-zinc-300 truncate w-full" title={subGroup}>{subGroup}</span>
                                </label>
                                ))
                            ) : (
                                <p className="text-xs text-zinc-600 italic py-2">No categories available for selected types.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>

        <div className="pb-12 space-y-12 min-h-[50vh]">
           {groupedDisplayData.map((section) => (
             <div key={section.title} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {/* Section Header */}
                 <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-lg font-bold text-zinc-200 uppercase tracking-wider whitespace-nowrap">{section.title}</h3>
                    <div className="h-[1px] flex-1 bg-zinc-800"></div>
                 </div>
                 
                 {/* Section Grid */}
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {section.items.map(item => (
                        <Card 
                            key={item.id} 
                            item={item} 
                            selected={selectedIds.has(item.id)}
                            onSelect={toggleSelect}
                            onCopy={copyToClipboard}
                        />
                    ))}
                 </div>
             </div>
           ))}
           
           {groupedDisplayData.length === 0 && (
               <div className="flex flex-col items-center justify-center py-20 text-zinc-600 gap-4">
                   <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800">
                      <Search className="w-8 h-8 opacity-50"/>
                   </div>
                   <p>No tokens found matching your filters.</p>
               </div>
           )}
        </div>
      </main>

      {/* Floating Action Bar */}
      <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${selectedIds.size > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
         <div className="bg-zinc-900 border border-zinc-700 shadow-2xl shadow-black/50 rounded-2xl p-2 flex items-center gap-2 pl-4">
            <span className="text-sm font-medium text-zinc-100 mr-2 flex items-center gap-2">
              <div className="bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {selectedIds.size}
              </div>
              Selected
            </span>
            
            <div className="h-4 w-[1px] bg-zinc-700 mx-1"></div>

            <button 
              onClick={copySelectionJson}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 rounded-lg text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              <Copy size={16} />
              Copy JSON
            </button>

            <button 
               onClick={() => exportSelection('json')}
               className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 rounded-lg text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              <Download size={16} />
              JSON
            </button>
            
            <button 
               onClick={() => exportSelection('csv')}
               className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 rounded-lg text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              <Grid size={16} />
              CSV
            </button>

            <div className="h-4 w-[1px] bg-zinc-700 mx-1"></div>

             <button 
               onClick={() => setSelectedIds(new Set())}
               className="p-2 hover:bg-red-500/20 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
            >
              <Trash2 size={16} />
            </button>
         </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-zinc-900/50 bg-zinc-950/50 py-6">
        <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-zinc-600">
              QuickToken UI By <a href="https://bento.me/moslih84" target="_blank" rel="noopener noreferrer" className="text-blue-500/80 hover:text-blue-400 font-medium transition-colors hover:underline">Moslih84</a>
            </p>
        </div>
      </footer>

      {/* Toast Notification */}
      {toast && (
          <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 animate-in slide-in-from-right-5 fade-in duration-300 ${toast.type === 'error' ? 'bg-red-950/80 border-red-900 text-red-200' : 'bg-zinc-800/90 border-zinc-700 text-white'}`}>
            {toast.type === 'success' ? <Check size={16} className="text-emerald-500" /> : <div className="w-2 h-2 rounded-full bg-red-500" />}
            <span className="text-sm font-medium">{toast.msg}</span>
          </div>
      )}

    </div>
  );
};

export default App;