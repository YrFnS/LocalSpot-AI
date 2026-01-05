
import React from 'react';
import { SearchBar } from './features/search/SearchBar';
import { FilterBar } from './features/search/FilterBar';
import RadarMap from './features/visualization/RadarMap';
import { RealMap } from './features/visualization/RealMap';
import { BusinessGrid } from './features/visualization/BusinessGrid';
import { BusinessCard } from './features/business/BusinessCard';
import { BusinessDetailModal } from './features/business/BusinessDetailModal';
import { CategorySelector } from './features/discovery/CategorySelector';
import { AudioVisualizer } from './features/visualization/AudioVisualizer';
import { OracleOverlay } from './features/live/OracleOverlay';
import { CuratorPanel } from './features/curator/CuratorPanel';
import { useLiveSession } from './hooks/useLiveSession';
import { useAppController } from './hooks/useAppController';
import { Tab, ViewMode } from './types';

const App: React.FC = () => {
  const {
    state,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    isAudioPlaying,
    themeClass,
    isOracleOpen,
    setIsOracleOpen,
    isCuratorOpen,
    setIsCuratorOpen,
    aiSuggestions,
    filters,
    setFilters,
    showDetailModal,
    setShowDetailModal,
    uniqueTags,
    displayedList,
    selectedTag,
    setSelectedTag,
    favorites,
    hoveredBusinessId,
    setHoveredBusinessId,
    handlers
  } = useAppController();

  const handleLiveToolCall = async (name: string, args: any) => {
      if (name === 'searchMap' && args.query) {
          await handlers.handleSearch(args.query);
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

  const selectedBusiness = handlers.getSelectedBusiness();

  // Helper to render the main content based on view mode
  const renderMainContent = () => {
      if (viewMode === ViewMode.GRID) {
          return (
             <BusinessGrid 
                businesses={displayedList} 
                onSelect={handlers.handleSelectBusiness} 
                selectedId={state.selectedBusinessId} 
                onHover={setHoveredBusinessId}
             />
          );
      }
      if (viewMode === ViewMode.MAP) {
          return (
              <RealMap 
                userLocation={state.userLocation} 
                businesses={displayedList} 
                onSelect={handlers.handleSelectBusiness} 
                selectedId={state.selectedBusinessId} 
                hoveredId={hoveredBusinessId}
                setHoveredId={setHoveredBusinessId}
                onRescan={handlers.handleRescan}
              />
          );
      }
      return (
        <RadarMap 
            userLocation={state.userLocation} 
            businesses={displayedList} 
            selectedId={state.selectedBusinessId} 
            onSelect={handlers.handleSelectBusiness} 
            onRescan={handlers.handleRescan} 
            hoveredId={hoveredBusinessId}
            setHoveredId={setHoveredBusinessId}
        />
      );
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
        onSelectBusiness={handlers.handleOpenDetail}
      />

      <header className="z-50 border-b border-zinc-800 bg-background/80 backdrop-blur-md flex flex-col gap-0">
         <div className="px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-600 rounded-sm flex items-center justify-center font-bold text-black font-mono shadow-lg shadow-primary/20">LS</div>
                <h1 className="text-lg font-bold tracking-tighter hidden md:block">LOCALSPOT</h1>
            </div>
            <div className="flex-1 max-w-2xl">
                <SearchBar onSearch={handlers.handleSearch} isSearching={state.isSearching} suggestions={aiSuggestions} />
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
                    <button onClick={() => setViewMode(ViewMode.MAP)} className={`p-1.5 rounded font-mono text-[10px] tracking-wider transition-all ${viewMode === ViewMode.MAP ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`} title="Map View">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6v16l7-4 7 4 7-4V2l-7 4-7-4-7 4z"></path><line x1="8" y1="2" x2="8" y2="18"></line><line x1="15" y1="6" x2="15" y2="22"></line></svg>
                    </button>
                    <button onClick={() => setViewMode(ViewMode.GRID)} className={`p-1.5 rounded font-mono text-[10px] tracking-wider transition-all ${viewMode === ViewMode.GRID ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`} title="Grid View">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    </button>
                </div>
            </div>
         </div>
         <CategorySelector onSelect={handlers.handleSearch} disabled={state.isSearching} />
         {(state.results.length > 0 || activeTab === Tab.FAVORITES) && <FilterBar filters={filters} onChange={setFilters} />}
      </header>

      <main className="flex-1 flex relative overflow-hidden z-10">
        {/* Sidebar: List View */}
        <div 
            className={`
                absolute inset-0 z-20 bg-background/95 md:bg-background/80 backdrop-blur md:static md:w-[420px] md:border-r md:border-zinc-800 flex flex-col transition-transform duration-300 
                ${(viewMode === ViewMode.RADAR || viewMode === ViewMode.GRID || viewMode === ViewMode.MAP) ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
                ${viewMode === ViewMode.GRID ? 'md:hidden' : ''} 
            `}
        >
           <div className="grid grid-cols-2 border-b border-zinc-900 bg-zinc-950/50">
               <button onClick={() => setActiveTab(Tab.SEARCH)} className={`py-3 text-xs font-mono tracking-widest transition-colors ${activeTab === Tab.SEARCH ? 'text-white border-b-2 border-primary bg-zinc-900/50' : 'text-zinc-500 hover:bg-zinc-900/30'}`}>DISCOVERY ({activeTab === Tab.SEARCH ? displayedList.length : state.results.length})</button>
               <button onClick={() => setActiveTab(Tab.FAVORITES)} className={`py-3 text-xs font-mono tracking-widest transition-colors ${activeTab === Tab.FAVORITES ? 'text-white border-b-2 border-primary bg-zinc-900/50' : 'text-zinc-500 hover:bg-zinc-900/30'}`}>SAVED ({favorites.length})</button>
           </div>
           
           {/* Tags */}
           {activeTab === Tab.FAVORITES && uniqueTags.length > 0 && (
               <div className="flex gap-2 overflow-x-auto p-2 bg-zinc-900/50 border-b border-zinc-800 scrollbar-hide">
                   <button onClick={() => setSelectedTag(null)} className={`px-3 py-1 rounded text-[10px] font-mono whitespace-nowrap border ${!selectedTag ? 'bg-primary text-black border-primary' : 'bg-transparent text-zinc-500 border-zinc-700'}`}>ALL</button>
                   {uniqueTags.map(tag => (
                       <button key={tag} onClick={() => setSelectedTag(tag === selectedTag ? null : tag)} className={`px-3 py-1 rounded text-[10px] font-mono whitespace-nowrap border ${selectedTag === tag ? 'bg-primary text-black border-primary' : 'bg-transparent text-zinc-400 border-zinc-800'}`}>{tag}</button>
                   ))}
               </div>
           )}

           {/* Error Banner */}
           {state.error && (
             <div className="p-4 bg-red-900/20 border-b border-red-900/50 flex items-start gap-3">
               <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <div>
                 <p className="text-xs text-red-200 font-bold mb-1">SIGNAL INTERRUPTION</p>
                 <p className="text-[10px] text-red-300/70 font-mono">{state.error}</p>
                 <button onClick={handlers.handleRescan} className="mt-2 text-[10px] text-red-400 hover:text-white underline decoration-dotted">RETRY SCAN</button>
               </div>
             </div>
           )}

           <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
              {/* Loading State */}
              {state.isSearching && (
                 <div className="p-4 space-y-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="animate-pulse flex flex-col gap-2 p-4 border-b border-zinc-800/50">
                            <div className="flex justify-between">
                                <div className="h-4 bg-zinc-800 rounded w-2/3"></div>
                                <div className="h-4 bg-zinc-800 rounded w-8"></div>
                            </div>
                            <div className="h-3 bg-zinc-800/50 rounded w-1/3"></div>
                            <div className="h-10 bg-zinc-800/30 rounded w-full mt-1"></div>
                        </div>
                    ))}
                    <div className="text-center pt-2">
                        <span className="text-xs font-mono text-primary animate-pulse">DETECTING SIGNALS...</span>
                    </div>
                 </div>
              )}

              {/* List Content */}
              {!state.isSearching && displayedList.map(biz => (
                  <BusinessCard 
                    key={biz.id} 
                    business={biz} 
                    isSelected={state.selectedBusinessId === biz.id} 
                    isFavorite={handlers.isFavorite(biz.id)} 
                    onToggleFavorite={handlers.toggleFavorite} 
                    onClick={() => handlers.handleSelectBusiness(biz.id)} 
                    onSpeak={handlers.handleSpeak} 
                    onHover={setHoveredBusinessId}
                  />
              ))}
              
              {!state.isSearching && displayedList.length === 0 && !state.error && (
                  <div className="p-8 text-center text-zinc-600 text-xs font-mono flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                      {activeTab === Tab.SEARCH ? "START A SEARCH TO DETECT SIGNALS" : "NO FAVORITES SAVED"}
                  </div>
              )}
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative bg-transparent overflow-hidden">
            {renderMainContent()}
            
            {/* Global Scanning Overlay */}
            {state.isSearching && viewMode !== ViewMode.GRID && (
                <div className="absolute inset-0 pointer-events-none z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="relative">
                        <div className="w-64 h-64 border-2 border-primary/30 rounded-full animate-[spin_3s_linear_infinite] border-t-primary"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                             <div className="text-xs font-mono text-primary animate-pulse tracking-widest bg-black px-2">SCANNING</div>
                        </div>
                    </div>
                </div>
            )}
            
            <button onClick={toggleOracle} className="absolute bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary hover:bg-orange-500 text-black shadow-lg shadow-primary/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 group" title="Ask The Oracle">
                <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-[ping_3s_ease-in-out_infinite] pointer-events-none"></div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:animate-pulse"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            </button>
            
            {/* Popover Card for Radar/Map View Only */}
            {state.selectedBusinessId && (viewMode === ViewMode.RADAR || viewMode === ViewMode.MAP) && selectedBusiness && !showDetailModal && (
                <div onClick={() => handlers.handleOpenDetail(state.selectedBusinessId!)} className="absolute bottom-6 left-4 right-4 md:left-auto md:right-24 md:w-80 glass-panel rounded-lg p-5 border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 cursor-pointer hover:bg-zinc-900/80 transition-colors group">
                    <div className="flex justify-between items-start mb-2"><h2 className="font-bold text-white text-xl tracking-tight group-hover:text-primary transition-colors line-clamp-1">{selectedBusiness.name}</h2></div>
                    <p className="text-sm text-zinc-300 leading-relaxed line-clamp-2 font-light border-l-2 border-zinc-700 pl-3 mb-2">{selectedBusiness.description}</p>
                    <div className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">CLICK TO EXPAND DOSSIER</div>
                </div>
            )}
        </div>
        
        {showDetailModal && selectedBusiness && (
            <BusinessDetailModal 
                business={selectedBusiness} 
                onClose={() => setShowDetailModal(false)} 
                onSpeak={handlers.handleSpeak} 
                isFavorite={handlers.isFavorite(state.selectedBusinessId!)} 
                onToggleFavorite={handlers.toggleFavorite} 
                onUpdateNote={handlers.updateNote} 
                onAddTag={handlers.addTag} 
                onRemoveTag={handlers.removeTag} 
                userNote={selectedBusiness.userNote} 
                userTags={selectedBusiness.userTags} 
            />
        )}
      </main>
    </div>
  );
};

export default App;
