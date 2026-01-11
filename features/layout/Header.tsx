
import React from 'react';
import { SearchBar } from '../search/SearchBar';
import { FilterBar } from '../search/FilterBar';
import { CategorySelector } from '../discovery/CategorySelector';
import { AudioVisualizer } from '../visualization/AudioVisualizer';
import { ContextHud } from '../context/ContextHud';
import { Tab, ViewMode, WeatherState, FilterState } from '../../types';

interface HeaderProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    isAudioPlaying: boolean;
    setIsSynthesizerOpen: (open: boolean) => void;
    setIsCuratorOpen: (open: boolean) => void;
    setIsVisionOpen: (open: boolean) => void;
    weather: WeatherState;
    locationLabel: string;
    state: any; // SearchState
    aiSuggestions: string[];
    aiAnalysisResult: string | null;
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
    handlers: any; // App handlers
    playFunctions: any; // SoundFX
}

export const Header: React.FC<HeaderProps> = ({
    activeTab,
    viewMode,
    setViewMode,
    isAudioPlaying,
    setIsSynthesizerOpen,
    setIsCuratorOpen,
    setIsVisionOpen,
    weather,
    locationLabel,
    state,
    aiSuggestions,
    aiAnalysisResult,
    filters,
    setFilters,
    handlers,
    playFunctions
}) => {
    const { playClick, playHover, playScan } = playFunctions;

    const handleViewModeChange = (mode: ViewMode) => {
        if (mode !== viewMode) {
            playClick();
            setViewMode(mode);
        }
    };

    return (
        <header className="z-50 border-b border-zinc-800 bg-background/80 backdrop-blur-md flex flex-col gap-0 relative shadow-2xl">
            {/* Top Bar: Logo & Status HUD */}
            <div className="flex h-12 border-b border-zinc-800 bg-zinc-950/50">
                <div className="flex items-center gap-3 px-4 border-r border-zinc-800 min-w-fit">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary to-orange-600 rounded-sm flex items-center justify-center font-bold text-black text-xs font-mono shadow-[0_0_15px_rgba(249,115,22,0.5)] border border-white/20">LS</div>
                    <h1 className="text-sm font-bold tracking-tighter hidden md:block text-white font-mono uppercase">LOCALSPOT_OS</h1>
                </div>
                
                {/* Context HUD occupies the middle/right of top bar */}
                <div className="flex-1 overflow-hidden">
                    <ContextHud 
                        weather={weather} 
                        onWeatherToggle={handlers.handleWeatherToggle} 
                        locationName={locationLabel} 
                    />
                </div>
            </div>

            {/* Main Control Bar */}
            <div className="px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex-1 max-w-3xl flex items-stretch h-10 gap-2">
                    <div className="flex-1">
                        <SearchBar
                            onSearch={(q) => { playScan(); handlers.handleSearch(q); }}
                            isSearching={state.isSearching}
                            suggestions={aiSuggestions}
                            onOpenVision={() => { playClick(); setIsVisionOpen(true); }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <AudioVisualizer isPlaying={isAudioPlaying} />
                    
                    <button
                        onClick={() => { playClick(); setIsSynthesizerOpen(true); }}
                        onMouseEnter={playHover}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-sm bg-zinc-900 border border-zinc-700 text-xs font-mono text-cyan-400 hover:text-white hover:border-cyan-500 transition-colors shadow-sm"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18"></path><path d="M6 8v8"></path><path d="M18 8v8"></path><path d="M2 12h20"></path></svg>
                        SYNTH
                    </button>
                    <button
                        onClick={() => { playClick(); setIsCuratorOpen(true); }}
                        onMouseEnter={playHover}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-sm bg-zinc-900 border border-zinc-700 text-xs font-mono text-purple-400 hover:text-white hover:border-purple-500 transition-colors shadow-sm"
                    >
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                        CURATE
                    </button>
                    
                    <div className="h-6 w-[1px] bg-zinc-800 mx-2"></div>
                    
                    <div className="flex bg-zinc-900 rounded-sm p-0.5 gap-0.5 border border-zinc-800">
                        <button onClick={() => handleViewModeChange(ViewMode.LIST)} onMouseEnter={playHover} className={`p-1.5 rounded-sm font-mono text-[10px] tracking-wider transition-all ${viewMode === ViewMode.LIST ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`} title="List View">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                        </button>
                        <button onClick={() => handleViewModeChange(ViewMode.RADAR)} onMouseEnter={playHover} className={`p-1.5 rounded-sm font-mono text-[10px] tracking-wider transition-all ${viewMode === ViewMode.RADAR ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`} title="Radar View">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                        </button>
                        <button onClick={() => handleViewModeChange(ViewMode.MAP)} onMouseEnter={playHover} className={`p-1.5 rounded-sm font-mono text-[10px] tracking-wider transition-all ${viewMode === ViewMode.MAP ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`} title="Map View">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6v16l7-4 7 4 7-4V2l-7 4-7-4-7 4z"></path><line x1="8" y1="2" x2="8" y2="18"></line><line x1="15" y1="6" x2="15" y2="22"></line></svg>
                        </button>
                        <button onClick={() => handleViewModeChange(ViewMode.GRID)} onMouseEnter={playHover} className={`p-1.5 rounded-sm font-mono text-[10px] tracking-wider transition-all ${viewMode === ViewMode.GRID ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`} title="Grid View">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        </button>
                    </div>
                </div>
            </div>
            
            <CategorySelector
                onSelect={(q) => { playScan(); handlers.handleSearch(q); }}
                disabled={state.isSearching}
                currentQuery={state.query}
            />
            
            {(state.results.length > 0 || activeTab === Tab.FAVORITES) && <FilterBar filters={filters} onChange={setFilters} />}

            {aiAnalysisResult && (
                <div className="bg-primary/10 border-b border-primary/20 p-2 flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    <span className="text-[10px] font-mono text-primary-200 uppercase tracking-wide">
                        VISION ANALYSIS: "{aiAnalysisResult}"
                    </span>
                    <button onClick={() => { playClick(); handlers.handleSearch("local favorites"); }} className="ml-2 text-[10px] underline decoration-dotted text-zinc-500 hover:text-white">CLEAR</button>
                </div>
            )}
        </header>
    );
};
