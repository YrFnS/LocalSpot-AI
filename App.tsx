
import React from 'react';
import { BusinessDetailModal } from './features/business/BusinessDetailModal';
import { OracleOverlay } from './features/live/OracleOverlay';
import { CuratorPanel } from './features/curator/CuratorPanel';
import { VisionModal } from './features/search/VisionModal';
import { CompareTray } from './features/comparison/CompareTray';
import { ComparisonModal } from './features/comparison/ComparisonModal';
import { VibeSynthesizer } from './features/search/VibeSynthesizer';
import { SignalBoot } from './features/visualization/SignalBoot';
import { Header } from './features/layout/Header';
import { Sidebar } from './features/layout/Sidebar';
import { Footer } from './features/layout/Footer';
import { Viewport } from './features/visualization/Viewport';
import { useLiveSession } from './features/live/useLiveSession';
import { useAppController } from './features/app/useAppController';
import { useSoundFX } from './features/audio/useSoundFX';
import { ViewMode } from './types';

const App: React.FC = () => {
  const {
    isBooting,
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
    isVisionOpen,
    setIsVisionOpen,
    isVisionAnalyzing,
    isSynthesizerOpen,
    setIsSynthesizerOpen,
    isSynthesizing,
    aiSuggestions,
    aiAnalysisResult,
    filters,
    setFilters,
    showDetailModal,
    setShowDetailModal,
    uniqueTags,
    displayedList,
    selectedTag,
    setSelectedTag,
    favorites,
    missions,
    hoveredBusinessId,
    setHoveredBusinessId,
    weather,
    comparisonList,
    comparisonResult,
    isComparing,
    setComparisonResult,
    activeItinerary,
    handlers
  } = useAppController();

  const playFunctions = useSoundFX();
  const { playClick, playSuccess } = playFunctions;

  const handleLiveToolCall = async (name: string, args: any) => {
      if (name === 'searchMap' && args.query) {
          await handlers.handleSearch(args.query);
          return { success: true };
      }
      return { success: false };
  };

  const { 
      connect: connectLive, 
      disconnect: disconnectLive, 
      isConnected: isLiveConnected, 
      isSpeaking: isLiveSpeaking, 
      volume: liveVolume,
      transcripts,
      realtimeText,
      sendVideoFrame
  } = useLiveSession({
      onToolCall: handleLiveToolCall
  });

  const toggleOracle = () => {
      playClick();
      if (isOracleOpen) { disconnectLive(); setIsOracleOpen(false); } 
      else { setIsOracleOpen(true); connectLive(); }
  };

  const selectedBusiness = handlers.getSelectedBusiness();

  const formatCoord = (val: number, type: 'lat' | 'lng') => {
    const abs = Math.abs(val).toFixed(3);
    if (type === 'lat') return val >= 0 ? `${abs}°N` : `${abs}°S`;
    return val >= 0 ? `${abs}°E` : `${abs}°W`;
  };

  const locationLabel = state.userLocation 
      ? `${formatCoord(state.userLocation.latitude, 'lat')} / ${formatCoord(state.userLocation.longitude, 'lng')}`
      : "ACQUIRING SIGNAL...";

  if (isBooting) return <SignalBoot />;

  return (
    <div className="flex flex-col h-screen w-full bg-background text-zinc-100 overflow-hidden font-sans relative">
      {/* GLOBAL ATMOSPHERE LAYERS */}
      <div className={`absolute inset-0 bg-gradient-to-br ${themeClass} transition-colors duration-1000 z-0 pointer-events-none opacity-40`} />
      <div className="absolute inset-0 z-[1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none"></div>
      <div className="absolute inset-0 z-[1] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none"></div>
      
      <OracleOverlay 
        isOpen={isOracleOpen} 
        onClose={toggleOracle} 
        isConnected={isLiveConnected} 
        isSpeaking={isLiveSpeaking} 
        volume={liveVolume}
        transcripts={transcripts}
        realtimeText={realtimeText}
        onSendFrame={sendVideoFrame}
      />
      
      <CuratorPanel 
        isOpen={isCuratorOpen} 
        onClose={() => setIsCuratorOpen(false)} 
        availableBusinesses={state.results}
        onSelectBusiness={(id) => { playClick(); handlers.handleOpenDetail(id); }}
        onPlotCourse={(it) => { playSuccess(); handlers.handlePlotItinerary(it); }}
        onSaveMission={(it) => { playSuccess(); handlers.saveMission(it); }}
      />

      <VisionModal 
         isOpen={isVisionOpen} 
         onClose={() => setIsVisionOpen(false)} 
         onAnalyze={(img) => { playFunctions.playScan(); handlers.handleVisionAnalyze(img); }}
         isAnalyzing={isVisionAnalyzing}
      />

      <VibeSynthesizer 
         isOpen={isSynthesizerOpen} 
         onClose={() => setIsSynthesizerOpen(false)} 
         onSynthesize={(v) => { playFunctions.playScan(); handlers.handleVibeSearch(v); }}
         isProcessing={isSynthesizing} 
      />

      {comparisonList.length > 0 && (
          <CompareTray 
             items={comparisonList} 
             onRemove={handlers.removeFromComparison} 
             onAnalyze={() => { playFunctions.playScan(); handlers.runComparison(); }}
             isAnalyzing={isComparing} 
          />
      )}

      {comparisonResult && comparisonList.length >= 2 && (
          <ComparisonModal 
            b1={comparisonList[0]} 
            b2={comparisonList[1]} 
            result={comparisonResult} 
            onClose={() => setComparisonResult(null)} 
          />
      )}

      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isAudioPlaying={isAudioPlaying}
        setIsSynthesizerOpen={setIsSynthesizerOpen}
        setIsCuratorOpen={setIsCuratorOpen}
        setIsVisionOpen={setIsVisionOpen}
        weather={weather}
        locationLabel={locationLabel}
        state={state}
        aiSuggestions={aiSuggestions}
        aiAnalysisResult={aiAnalysisResult}
        filters={filters}
        setFilters={setFilters}
        handlers={handlers}
        playFunctions={playFunctions}
      />

      <main className="flex-1 flex relative overflow-hidden z-10">
        <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            viewMode={viewMode}
            state={state}
            displayedList={displayedList}
            uniqueTags={uniqueTags}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            favorites={favorites}
            missions={missions}
            comparisonList={comparisonList}
            hoveredBusinessId={hoveredBusinessId}
            setHoveredBusinessId={setHoveredBusinessId}
            handlers={handlers}
            playFunctions={playFunctions}
        />

        <div className="flex-1 relative bg-transparent overflow-hidden">
            <Viewport
                viewMode={viewMode}
                displayedList={displayedList}
                state={state}
                hoveredBusinessId={hoveredBusinessId}
                activeItinerary={activeItinerary}
                handlers={handlers}
                setHoveredBusinessId={setHoveredBusinessId}
                playFunctions={playFunctions}
                weather={weather}
            />
            
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
            
            <button onClick={toggleOracle} className="absolute bottom-16 right-6 z-40 w-14 h-14 rounded-full bg-primary hover:bg-orange-500 text-black shadow-lg shadow-primary/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 group" title="Ask The Oracle">
                <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-[ping_3s_ease-in-out_infinite] pointer-events-none"></div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:animate-pulse"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            </button>
            
            {state.selectedBusinessId && (viewMode === ViewMode.RADAR || viewMode === ViewMode.MAP) && selectedBusiness && !showDetailModal && (
                <div onClick={() => { playClick(); handlers.handleOpenDetail(state.selectedBusinessId!); }} className="absolute bottom-16 left-4 right-4 md:left-auto md:right-24 md:w-80 glass-panel rounded-sm p-5 border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 cursor-pointer hover:bg-zinc-900/80 transition-colors group">
                    <div className="flex justify-between items-start mb-2"><h2 className="font-bold text-white text-xl tracking-tight group-hover:text-primary transition-colors line-clamp-1">{selectedBusiness.name}</h2></div>
                    <p className="text-sm text-zinc-300 leading-relaxed line-clamp-2 font-light border-l-2 border-zinc-700 pl-3 mb-2">{selectedBusiness.description}</p>
                    <div className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">CLICK TO EXPAND DOSSIER</div>
                </div>
            )}
        </div>
      </main>

      {showDetailModal && selectedBusiness && (
        <BusinessDetailModal 
            business={selectedBusiness} 
            onClose={() => { playClick(); setShowDetailModal(false); }} 
            onSpeak={(t) => { playClick(); handlers.handleSpeak(t); }} 
            isFavorite={handlers.isFavorite(state.selectedBusinessId!)} 
            onToggleFavorite={(b) => { playClick(); handlers.toggleFavorite(b); }} 
            onUpdateNote={handlers.updateNote} 
            onAddTag={handlers.addTag} 
            onRemoveTag={handlers.removeTag} 
            userNote={selectedBusiness.userNote} 
            userTags={selectedBusiness.userTags} 
        />
      )}

      <Footer />
    </div>
  );
};
export default App;
