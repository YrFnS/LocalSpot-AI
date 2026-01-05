import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SearchBar } from './features/search/SearchBar';
import { FilterBar } from './features/search/FilterBar';
import RadarMap from './features/visualization/RadarMap';
import { BusinessGrid } from './features/visualization/BusinessGrid';
import { BusinessCard } from './features/business/BusinessCard';
import { BusinessDetailModal } from './features/business/BusinessDetailModal';
import { CategorySelector } from './features/discovery/CategorySelector';
import { AudioVisualizer } from './features/visualization/AudioVisualizer';
import { OracleOverlay } from './features/live/OracleOverlay';
import { CuratorPanel } from './features/curator/CuratorPanel';
import { searchLocalBusinesses, getFeaturedBusinesses, speakDescription } from './services/geminiService';
import { useFavorites } from './hooks/useFavorites';
import { useLiveSession } from './hooks/useLiveSession';
import { Business, SearchState, ViewMode, FilterState } from './types';
import { filterBusinesses } from './utils/filterUtils';

enum Tab {
    SEARCH = 'SEARCH',
    FAVORITES = 'FAVORITES'
}

const THEMES: Record<string, string> = {
    default: 'from-orange-500/10 via-background to-background',
    coffee: 'from-amber-700/20 via-orange-900/10 to-background',
    food: 'from-red-900/20 via-orange-900/10 to-background',
    drinks: 'from-purple-900/20 via-blue-900/10 to-background',
    parks: 'from-emerald-900/20 via-green-900/10 to-background',
    art: 'from-pink-900/20 via-rose-900/10 to-background',
    shop: 'from-yellow-700/20 via-amber-900/10 to-background',
    music: 'from-indigo-900/20 via-violet-900/10 to-background'
};

const App: React.FC = () => {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    isSearching: false,
    selectedBusinessId: null,
    userLocation: null,
    error: null
  });

  const [activeTab, setActiveTab] = useState<Tab>(Tab.SEARCH);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [weather] = useState<string>("Sunny, 22°C");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [themeClass, setThemeClass] = useState(THEMES.default);
  const [isOracleOpen, setIsOracleOpen] = useState(false);
  const [isCuratorOpen, setIsCuratorOpen] = useState(false);

  const { favorites, toggleFavorite, isFavorite, updateNote, addTag, removeTag, getFavorite } = useFavorites();
  
  const [filters, setFilters] = useState<FilterState>({
    minRating: 0,
    priceLevels: [],
    onlyOpen: false
  });
  
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setState(s => ({ ...s, userLocation: loc }));
        if (state.results.length === 0 && !state.isSearching) {
            getFeaturedBusinesses(loc, weather).then(featured => setState(s => ({ ...s, results: featured }))).catch(console.error);
        }
      },
      (err) => {
        const defaultLoc = { latitude: 37.7749, longitude: -122.4194 };
        setState(s => ({ ...s, userLocation: defaultLoc }));
        if (state.results.length === 0 && !state.isSearching) {
            getFeaturedBusinesses(defaultLoc, weather).then(featured => setState(s => ({ ...s, results: featured }))).catch(console.error);
        }
      }
    );
  }, []);

  const updateThemeFromQuery = (query: string) => {
      const q = query.toLowerCase();
      let found = false;
      for (const key of Object.keys(THEMES)) {
          if (q.includes(key)) { setThemeClass(THEMES[key]); found = true; break; }
      }
      if (!found) setThemeClass(THEMES.default);
  };

  const handleSearch = useCallback(async (query: string) => {
    setActiveTab(Tab.SEARCH);
    setState(s => ({ ...s, isSearching: true, query, error: null, selectedBusinessId: null }));
    setShowDetailModal(false);
    updateThemeFromQuery(query);
    try {
      const { businesses } = await searchLocalBusinesses(query, state.userLocation, weather);
      setState(s => ({ ...s, results: businesses, isSearching: false }));
    } catch (error) {
      setState(s => ({ ...s, isSearching: false, error: 'Connection failed.' }));
    }
  }, [state.userLocation, weather]);

  const handleLiveToolCall = async (name: string, args: any) => {
      if (name === 'searchMap' && args.query) {
          await handleSearch(args.query);
          return { success: true };
      }
      return { success: false };
  };

  const { connect: connectLive, disconnect: disconnectLive, isConnected: isLiveConnected, isSpeaking: isLiveSpeaking, volume: liveVolume } = useLiveSession({
      onToolCall: handleLiveToolCall
  });

  const toggleOracle = () => {
      if (isOracleOpen) { disconnectLive(); setIsOracleOpen(false); } 
      else { setIsOracleOpen(true); connectLive(); }
  };

  const handleRescan = useCallback(() => {
    handleSearch(state.query || "hidden gems and cool spots");
  }, [state.query, handleSearch]);

  const handleSpeak = (text: string) => {
      speakDescription(text, () => setIsAudioPlaying(true), () => setIsAudioPlaying(false));
  };

  const handleSelectBusiness = (id: string) => {
    setState(s => ({ ...s, selectedBusinessId: id }));
    // In GRID mode, allow selection to highlight, but maybe we want to open modal?
    // Let's open modal for GRID mode clicks as it feels more app-like
    if (viewMode === ViewMode.GRID) {
        setShowDetailModal(true);
    }
  };
  
  const handleOpenDetail = (id: string) => {
      setState(s => ({ ...s, selectedBusinessId: id }));
      setShowDetailModal(true);
  };

  const uniqueTags = useMemo(() => {
      const tags = new Set<string>();
      favorites.forEach(f => f.userTags?.forEach(t => tags.add(t)));
      return Array.from(tags).sort();
  }, [favorites]);

  const displayedList = useMemo(() => {
      let list = activeTab === Tab.SEARCH ? state.results : favorites;
      if (activeTab === Tab.FAVORITES && selectedTag) list = list.filter(b => b.userTags?.includes(selectedTag));
      return filterBusinesses(list, filters);
  }, [activeTab, state.results, favorites, filters, selectedTag]);

  const getSelectedBusiness = () => {
    const biz = displayedList.find(b => b.id === state.selectedBusinessId);
    if (biz && activeTab === Tab.SEARCH && isFavorite(biz.id)) return getFavorite(biz.id) || biz;
    return biz;
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background text-zinc-100 overflow-hidden font-sans relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${themeClass} transition-colors duration-1000 z-0 pointer-events-none opacity-40`} />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none brightness-100 contrast-150 mix-blend-overlay"></div>

      <OracleOverlay isOpen={isOracleOpen} onClose={toggleOracle} isConnected={isLiveConnected} isSpeaking={isLiveSpeaking} volume={liveVolume} />
      
      <CuratorPanel 
        isOpen={isCuratorOpen} 
        onClose={() => setIsCuratorOpen(false)} 
        availableBusinesses={state.results}
        onSelectBusiness={handleOpenDetail}
      />

      <header className="z-50 border-b border-zinc-800 bg-background/80 backdrop-blur-md flex flex-col gap-0">
         <div className="px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-600 rounded-sm flex items-center justify-center font-bold text-black font-mono shadow-lg shadow-primary/20">LS</div>
                <h1 className="text-lg font-bold tracking-tighter hidden md:block">LOCALSPOT</h1>
            </div>
            <div className="flex-1 max-w-2xl">
                <SearchBar onSearch={handleSearch} isSearching={state.isSearching} />
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <AudioVisualizer isPlaying={isAudioPlaying} />
                <button 
                    onClick={() => setIsCuratorOpen(true)}
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-mono text-purple-400 hover:text-white hover:border-purple-500 transition-colors"
                >
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                    CURATE
                </button>
                <div className="h-6 w-[1px] bg-zinc-800 mx-2"></div>
                <div className="flex bg-zinc-900 rounded p-1 gap-1">
                    <button onClick={() => setViewMode(ViewMode.LIST)} className={`p-1.5 rounded font-mono text-[10px] tracking-wider transition-all ${viewMode === ViewMode.LIST ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`} title="List View">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    </button>
                    <button onClick={() => setViewMode(ViewMode.RADAR)} className={`p-1.5 rounded font-mono text-[10px] tracking-wider transition-all ${viewMode === ViewMode.RADAR ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`} title="Radar View">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    </button>
                    <button onClick={() => setViewMode(ViewMode.GRID)} className={`p-1.5 rounded font-mono text-[10px] tracking-wider transition-all ${viewMode === ViewMode.GRID ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`} title="Grid View">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    </button>
                </div>
            </div>
         </div>
         <CategorySelector onSelect={handleSearch} disabled={state.isSearching} />
         {(state.results.length > 0 || activeTab === Tab.FAVORITES) && <FilterBar filters={filters} onChange={setFilters} />}
      </header>

      <main className="flex-1 flex relative overflow-hidden z-10">
        {/* Sidebar: List View */}
        <div 
            className={`
                absolute inset-0 z-20 bg-background/95 md:bg-background/80 backdrop-blur md:static md:w-[420px] md:border-r md:border-zinc-800 flex flex-col transition-transform duration-300 
                ${(viewMode === ViewMode.RADAR || viewMode === ViewMode.GRID) ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
                ${viewMode === ViewMode.GRID ? 'md:hidden' : ''} 
            `}
        >
           <div className="grid grid-cols-2 border-b border-zinc-900 bg-zinc-950/50">
               <button onClick={() => setActiveTab(Tab.SEARCH)} className={`py-3 text-xs font-mono tracking-widest transition-colors ${activeTab === Tab.SEARCH ? 'text-white border-b-2 border-primary bg-zinc-900/50' : 'text-zinc-500 hover:bg-zinc-900/30'}`}>DISCOVERY ({activeTab === Tab.SEARCH ? displayedList.length : state.results.length})</button>
               <button onClick={() => setActiveTab(Tab.FAVORITES)} className={`py-3 text-xs font-mono tracking-widest transition-colors ${activeTab === Tab.FAVORITES ? 'text-white border-b-2 border-primary bg-zinc-900/50' : 'text-zinc-500 hover:bg-zinc-900/30'}`}>SAVED ({favorites.length})</button>
           </div>
           {activeTab === Tab.FAVORITES && uniqueTags.length > 0 && (
               <div className="flex gap-2 overflow-x-auto p-2 bg-zinc-900/50 border-b border-zinc-800 scrollbar-hide">
                   <button onClick={() => setSelectedTag(null)} className={`px-3 py-1 rounded text-[10px] font-mono whitespace-nowrap border ${!selectedTag ? 'bg-primary text-black border-primary' : 'bg-transparent text-zinc-500 border-zinc-700'}`}>ALL</button>
                   {uniqueTags.map(tag => (
                       <button key={tag} onClick={() => setSelectedTag(tag === selectedTag ? null : tag)} className={`px-3 py-1 rounded text-[10px] font-mono whitespace-nowrap border ${selectedTag === tag ? 'bg-primary text-black border-primary' : 'bg-transparent text-zinc-400 border-zinc-800'}`}>{tag}</button>
                   ))}
               </div>
           )}
           <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
              {displayedList.map(biz => (
                  <BusinessCard key={biz.id} business={biz} isSelected={state.selectedBusinessId === biz.id} isFavorite={isFavorite(biz.id)} onToggleFavorite={toggleFavorite} onClick={() => handleSelectBusiness(biz.id)} onSpeak={handleSpeak} />
              ))}
              {displayedList.length === 0 && (
                  <div className="p-8 text-center text-zinc-600 text-xs font-mono">
                      {activeTab === Tab.SEARCH ? "START A SEARCH TO DETECT SIGNALS" : "NO FAVORITES SAVED"}
                  </div>
              )}
           </div>
        </div>

        {/* Main Content Area: Radar or Grid */}
        <div className="flex-1 relative bg-transparent overflow-hidden">
            {viewMode === ViewMode.GRID ? (
                 <BusinessGrid businesses={displayedList} onSelect={handleSelectBusiness} selectedId={state.selectedBusinessId} />
            ) : (
                <RadarMap userLocation={state.userLocation} businesses={displayedList} selectedId={state.selectedBusinessId} onSelect={handleSelectBusiness} onRescan={handleRescan} />
            )}
            
            <button onClick={toggleOracle} className="absolute bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary hover:bg-orange-500 text-black shadow-lg shadow-primary/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 group" title="Ask The Oracle">
                <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-[ping_3s_ease-in-out_infinite] pointer-events-none"></div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:animate-pulse"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            </button>
            
            {/* Popover Card for Radar View Only */}
            {state.selectedBusinessId && viewMode === ViewMode.RADAR && getSelectedBusiness() && !showDetailModal && (
                <div onClick={() => handleOpenDetail(state.selectedBusinessId!)} className="absolute bottom-6 left-4 right-4 md:left-auto md:right-24 md:w-80 glass-panel rounded-lg p-5 border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 cursor-pointer hover:bg-zinc-900/80 transition-colors group">
                    <div className="flex justify-between items-start mb-2"><h2 className="font-bold text-white text-xl tracking-tight group-hover:text-primary transition-colors line-clamp-1">{getSelectedBusiness()?.name}</h2></div>
                    <p className="text-sm text-zinc-300 leading-relaxed line-clamp-2 font-light border-l-2 border-zinc-700 pl-3 mb-2">{getSelectedBusiness()?.description}</p>
                    <div className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">CLICK TO EXPAND DOSSIER</div>
                </div>
            )}
        </div>
        
        {showDetailModal && getSelectedBusiness() && (
            <BusinessDetailModal business={getSelectedBusiness()!} onClose={() => setShowDetailModal(false)} onSpeak={handleSpeak} isFavorite={isFavorite(state.selectedBusinessId!)} onToggleFavorite={toggleFavorite} onUpdateNote={updateNote} onAddTag={addTag} onRemoveTag={removeTag} userNote={getSelectedBusiness()?.userNote} userTags={getSelectedBusiness()?.userTags} />
        )}
      </main>
    </div>
  );
};

export default App;