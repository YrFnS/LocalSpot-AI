import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SearchBar } from './features/search/SearchBar';
import { FilterBar } from './features/search/FilterBar';
import RadarMap from './features/visualization/RadarMap';
import { BusinessCard } from './features/business/BusinessCard';
import { BusinessDetailModal } from './features/business/BusinessDetailModal';
import { CategorySelector } from './features/discovery/CategorySelector';
import { AudioVisualizer } from './features/visualization/AudioVisualizer';
import { searchLocalBusinesses, getFeaturedBusinesses, speakDescription } from './services/geminiService';
import { useFavorites } from './hooks/useFavorites';
import { Business, SearchState, ViewMode, FilterState } from './types';
import { filterBusinesses } from './utils/filterUtils';

enum Tab {
    SEARCH = 'SEARCH',
    FAVORITES = 'FAVORITES'
}

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

  const { favorites, toggleFavorite, isFavorite, updateNote, addTag, removeTag, getFavorite } = useFavorites();
  
  const [filters, setFilters] = useState<FilterState>({
    minRating: 0,
    priceLevels: [],
    onlyOpen: false
  });
  
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Initialize Location & Featured Content
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        
        setState(s => ({ ...s, userLocation: loc }));

        // Load Featured Businesses once location is found
        if (state.results.length === 0 && !state.isSearching) {
            getFeaturedBusinesses(loc, weather).then(featured => {
                 setState(s => ({ ...s, results: featured }));
            }).catch(console.error);
        }
      },
      (err) => {
        console.warn("Location denied, using default");
        const defaultLoc = { latitude: 37.7749, longitude: -122.4194 };
        setState(s => ({ ...s, userLocation: defaultLoc }));
        
        // Load Featured for default location
        if (state.results.length === 0 && !state.isSearching) {
            getFeaturedBusinesses(defaultLoc, weather).then(featured => {
                 setState(s => ({ ...s, results: featured }));
            }).catch(console.error);
        }
      }
    );
  }, []); // Run once on mount

  const handleSearch = useCallback(async (query: string) => {
    setActiveTab(Tab.SEARCH);
    setState(s => ({ ...s, isSearching: true, query, error: null, selectedBusinessId: null }));
    setShowDetailModal(false);
    try {
      const { businesses } = await searchLocalBusinesses(query, state.userLocation, weather);
      setState(s => ({ ...s, results: businesses, isSearching: false }));
    } catch (error) {
      console.error(error);
      setState(s => ({ ...s, isSearching: false, error: 'Connection failed. Try again.' }));
    }
  }, [state.userLocation, weather]);

  const handleSpeak = (text: string) => {
      speakDescription(
          text, 
          () => setIsAudioPlaying(true), 
          () => setIsAudioPlaying(false)
      );
  };

  const handleSelectBusiness = (id: string) => {
    setState(s => ({ ...s, selectedBusinessId: id }));
  };
  
  const handleOpenDetail = (id: string) => {
      setState(s => ({ ...s, selectedBusinessId: id }));
      setShowDetailModal(true);
  };

  // Calculate unique tags from favorites
  const uniqueTags = useMemo(() => {
      const tags = new Set<string>();
      favorites.forEach(f => f.userTags?.forEach(t => tags.add(t)));
      return Array.from(tags).sort();
  }, [favorites]);

  // Determine base list & Apply Filters
  const displayedList = useMemo(() => {
      let list = activeTab === Tab.SEARCH ? state.results : favorites;
      
      // Filter by collection tag if in favorites mode
      if (activeTab === Tab.FAVORITES && selectedTag) {
          list = list.filter(b => b.userTags?.includes(selectedTag));
      }

      return filterBusinesses(list, filters);
  }, [activeTab, state.results, favorites, filters, selectedTag]);

  const getSelectedBusiness = () => {
    const biz = displayedList.find(b => b.id === state.selectedBusinessId);
    if (biz && activeTab === Tab.SEARCH && isFavorite(biz.id)) {
        const fav = getFavorite(biz.id);
        if (fav) return fav;
    }
    return biz;
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background text-zinc-100 overflow-hidden font-sans">
      {/* Top Navigation */}
      <header className="z-50 border-b border-zinc-800 bg-background/90 backdrop-blur-md flex flex-col gap-0">
         <div className="px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-600 rounded-sm flex items-center justify-center font-bold text-black font-mono shadow-lg shadow-primary/20">
                    LS
                </div>
                <h1 className="text-lg font-bold tracking-tighter hidden md:block">LOCALSPOT</h1>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                    <span>{weather.toUpperCase()}</span>
                </div>
            </div>
            
            <div className="flex-1 max-w-2xl">
                <SearchBar onSearch={handleSearch} isSearching={state.isSearching} />
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <AudioVisualizer isPlaying={isAudioPlaying} />
                <div className="h-6 w-[1px] bg-zinc-800 mx-2"></div>
                <button 
                    onClick={() => setViewMode(ViewMode.LIST)}
                    className={`p-2 font-mono text-[10px] tracking-wider transition-colors ${viewMode === ViewMode.LIST ? 'text-primary' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    LIST
                </button>
                <button 
                    onClick={() => setViewMode(ViewMode.RADAR)}
                    className={`p-2 font-mono text-[10px] tracking-wider transition-colors ${viewMode === ViewMode.RADAR ? 'text-primary' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    RADAR
                </button>
            </div>
         </div>
         
         <CategorySelector onSelect={handleSearch} disabled={state.isSearching} />
         
         {(state.results.length > 0 || activeTab === Tab.FAVORITES) && (
             <FilterBar filters={filters} onChange={setFilters} />
         )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex relative overflow-hidden">
        
        {/* Left Panel - List View */}
        <div className={`
            absolute inset-0 z-20 bg-background md:static md:w-[420px] md:border-r md:border-zinc-800 flex flex-col transition-transform duration-300
            ${viewMode === ViewMode.RADAR ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
        `}>
           <div className="grid grid-cols-2 border-b border-zinc-900 bg-zinc-950">
               <button 
                onClick={() => setActiveTab(Tab.SEARCH)}
                className={`py-3 text-xs font-mono tracking-widest transition-colors ${activeTab === Tab.SEARCH ? 'text-white border-b-2 border-primary bg-zinc-900' : 'text-zinc-500 hover:bg-zinc-900/50'}`}
               >
                   DISCOVERY ({activeTab === Tab.SEARCH ? displayedList.length : state.results.length})
               </button>
               <button 
                onClick={() => setActiveTab(Tab.FAVORITES)}
                className={`py-3 text-xs font-mono tracking-widest transition-colors ${activeTab === Tab.FAVORITES ? 'text-white border-b-2 border-primary bg-zinc-900' : 'text-zinc-500 hover:bg-zinc-900/50'}`}
               >
                   SAVED ({favorites.length})
               </button>
           </div>
           
           {/* Tags Filter for Favorites */}
           {activeTab === Tab.FAVORITES && uniqueTags.length > 0 && (
               <div className="flex gap-2 overflow-x-auto p-2 bg-zinc-900/50 border-b border-zinc-800 scrollbar-hide">
                   <button
                       onClick={() => setSelectedTag(null)}
                       className={`px-3 py-1 rounded text-[10px] font-mono whitespace-nowrap border ${!selectedTag ? 'bg-primary text-black border-primary' : 'bg-transparent text-zinc-500 border-zinc-700'}`}
                   >
                       ALL
                   </button>
                   {uniqueTags.map(tag => (
                       <button
                           key={tag}
                           onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                           className={`px-3 py-1 rounded text-[10px] font-mono whitespace-nowrap border ${selectedTag === tag ? 'bg-primary text-black border-primary' : 'bg-transparent text-zinc-400 border-zinc-800'}`}
                       >
                           {tag}
                       </button>
                   ))}
               </div>
           )}
           
           <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
              {activeTab === Tab.SEARCH && state.results.length === 0 && !state.isSearching && (
                  <div className="flex flex-col items-center justify-center h-64 text-zinc-600 font-mono text-xs px-8 text-center opacity-50">
                      <svg className="w-8 h-8 mb-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      <p>INITIALIZE SCAN SEQUENCE...</p>
                  </div>
              )}
              
              {activeTab === Tab.FAVORITES && favorites.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-64 text-zinc-600 font-mono text-xs px-8 text-center opacity-50">
                      <p>NO SAVED LOCATIONS</p>
                  </div>
              )}
              
              {displayedList.length === 0 && (state.results.length > 0 || favorites.length > 0) && (
                   <div className="flex flex-col items-center justify-center h-32 text-zinc-500 font-mono text-xs">
                      <p>NO MATCHES WITH CURRENT FILTERS</p>
                   </div>
              )}

              {displayedList.map(biz => (
                  <BusinessCard 
                      key={biz.id} 
                      business={biz} 
                      isSelected={state.selectedBusinessId === biz.id}
                      isFavorite={isFavorite(biz.id)}
                      onToggleFavorite={toggleFavorite}
                      onClick={() => handleSelectBusiness(biz.id)}
                      onSpeak={handleSpeak}
                  />
              ))}
           </div>
        </div>

        {/* Right Panel - Map/Radar */}
        <div className="flex-1 relative bg-zinc-950 overflow-hidden">
            <RadarMap 
                userLocation={state.userLocation} 
                businesses={displayedList}
                selectedId={state.selectedBusinessId}
                onSelect={handleSelectBusiness}
            />
            
            {state.selectedBusinessId && viewMode === ViewMode.RADAR && getSelectedBusiness() && !showDetailModal && (
                <div 
                    onClick={() => handleOpenDetail(state.selectedBusinessId!)}
                    className="absolute bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-96 glass-panel rounded-lg p-5 border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 cursor-pointer hover:bg-zinc-900/80 transition-colors group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="font-bold text-white text-xl tracking-tight group-hover:text-primary transition-colors">{getSelectedBusiness()?.name}</h2>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setState(s => ({...s, selectedBusinessId: null})); }} 
                            className="text-zinc-500 hover:text-white transition-colors"
                        >
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-primary text-xs font-mono font-bold bg-primary/10 px-2 py-1 rounded">
                             ★ {getSelectedBusiness()?.rating?.toFixed(1)}
                        </span>
                        <span className="text-zinc-500 text-xs font-mono uppercase">
                             {getSelectedBusiness()?.types?.[0]}
                        </span>
                        {getSelectedBusiness()?.openNow && (
                            <span className="text-green-500 text-xs font-mono font-bold">OPEN</span>
                        )}
                    </div>
                    
                    <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3 font-light border-l-2 border-zinc-700 pl-3 mb-4">
                        {getSelectedBusiness()?.description}
                    </p>
                    
                    <div className="text-center text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">
                        CLICK TO EXPAND DOSSIER
                    </div>
                </div>
            )}
        </div>
        
        {showDetailModal && getSelectedBusiness() && (
            <BusinessDetailModal 
                business={getSelectedBusiness()!} 
                onClose={() => setShowDetailModal(false)}
                onSpeak={handleSpeak}
                isFavorite={isFavorite(state.selectedBusinessId!)}
                onToggleFavorite={toggleFavorite}
                onUpdateNote={updateNote}
                onAddTag={addTag}
                onRemoveTag={removeTag}
                userNote={getSelectedBusiness()?.userNote}
                userTags={getSelectedBusiness()?.userTags}
            />
        )}

      </main>
    </div>
  );
};

export default App;