
import React, { useEffect, useRef } from 'react';
import { Tab, ViewMode, Business, Itinerary } from '../../types';
import { BusinessCard } from '../business/BusinessCard';
import { MissionLog } from '../missions/MissionLog';
import { SidebarTab } from './SidebarTab';

interface SidebarProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    viewMode: ViewMode;
    state: any; // SearchState
    displayedList: Business[];
    uniqueTags: string[];
    selectedTag: string | null;
    setSelectedTag: (tag: string | null) => void;
    favorites: Business[];
    missions: Itinerary[];
    comparisonList: Business[];
    hoveredBusinessId: string | null;
    setHoveredBusinessId: (id: string | null) => void;
    handlers: any;
    playFunctions: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    setActiveTab,
    viewMode,
    state,
    displayedList,
    uniqueTags,
    selectedTag,
    setSelectedTag,
    favorites,
    missions,
    comparisonList,
    hoveredBusinessId,
    setHoveredBusinessId,
    handlers,
    playFunctions
}) => {
    const { playClick, playHover, playScan } = playFunctions;
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedRef = useRef<HTMLDivElement>(null);

    const handleTabChange = (tab: Tab) => {
        if (tab !== activeTab) {
            playFunctions.playNav();
            setActiveTab(tab);
        }
    };

    // Auto-scroll to selected item
    useEffect(() => {
        if (state.selectedBusinessId && selectedRef.current && containerRef.current) {
            // Check if element is already visible
            const container = containerRef.current;
            const element = selectedRef.current;
            
            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [state.selectedBusinessId]);

    return (
        <div
            className={`
                absolute inset-0 z-20 bg-background/95 md:bg-background/80 backdrop-blur md:static md:w-[420px] md:border-r md:border-zinc-800 flex flex-col transition-transform duration-300 
                ${(viewMode === ViewMode.RADAR || viewMode === ViewMode.GRID || viewMode === ViewMode.MAP) ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
                ${viewMode === ViewMode.GRID ? 'md:hidden' : ''} 
            `}
        >
            {/* Navigation Tabs - Hardware Switch Style */}
            <div className="flex border-b border-zinc-900 bg-zinc-950 p-1">
                <SidebarTab 
                    isActive={activeTab === Tab.SEARCH}
                    onClick={() => handleTabChange(Tab.SEARCH)}
                    onMouseEnter={playHover}
                    label="DISCOVERY"
                    icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
                    origin="left"
                />
                
                <SidebarTab 
                    isActive={activeTab === Tab.FAVORITES}
                    onClick={() => handleTabChange(Tab.FAVORITES)}
                    onMouseEnter={playHover}
                    label="ARCHIVE"
                    subLabel={favorites.length.toString()}
                    icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>}
                    origin="bottom"
                />

                <SidebarTab 
                    isActive={activeTab === Tab.MISSIONS}
                    onClick={() => handleTabChange(Tab.MISSIONS)}
                    onMouseEnter={playHover}
                    label="MISSIONS"
                    subLabel={missions.length.toString()}
                    icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>}
                    origin="right"
                />
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-20" ref={containerRef}>

                {/* --- SEARCH TAB CONTENT --- */}
                {activeTab === Tab.SEARCH && (
                    <>
                        {state.error && (
                            <div className="p-4 bg-red-950/30 border-b border-red-900/50 flex items-start gap-3 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 animate-pulse"></div>
                                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <div>
                                    <p className="text-xs text-red-200 font-bold mb-1 font-mono tracking-wide">SIGNAL INTERRUPTION</p>
                                    <p className="text-[10px] text-red-300/70 font-mono">{state.error}</p>
                                    <button onClick={() => { playClick(); handlers.handleRescan(); }} className="mt-2 text-[10px] text-red-400 hover:text-white underline decoration-dotted font-mono uppercase">RE-ESTABLISH UPLINK</button>
                                </div>
                            </div>
                        )}

                        {state.isSearching && (
                            <div className="p-4 space-y-4">
                                {[1, 2, 3, 4].map(i => (
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

                        {!state.isSearching && displayedList.map(biz => (
                            <div key={biz.id} ref={state.selectedBusinessId === biz.id ? selectedRef : null}>
                                <BusinessCard
                                    business={biz}
                                    isSelected={state.selectedBusinessId === biz.id}
                                    isFavorite={handlers.isFavorite(biz.id)}
                                    onToggleFavorite={(b) => { playClick(); handlers.toggleFavorite(b); }}
                                    onClick={() => { playClick(); handlers.handleSelectBusiness(biz.id); }}
                                    onSpeak={(t) => { playClick(); handlers.handleSpeak(t); }}
                                    onHover={(id) => { if (id !== hoveredBusinessId) playHover(); setHoveredBusinessId(id); }}
                                    isInComparison={comparisonList.some(b => b.id === biz.id)}
                                    onToggleComparison={(b) => { playClick(); handlers.toggleComparison(b); }}
                                />
                            </div>
                        ))}

                        {!state.isSearching && displayedList.length === 0 && !state.error && (
                            <div className="p-8 text-center text-zinc-600 text-xs font-mono flex flex-col items-center gap-2 mt-10">
                                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2 animate-pulse">
                                    <svg className="w-6 h-6 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                START A SEARCH TO DETECT SIGNALS
                            </div>
                        )}
                    </>
                )}

                {/* --- FAVORITES TAB CONTENT --- */}
                {activeTab === Tab.FAVORITES && (
                    <>
                        {uniqueTags.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto p-2 bg-zinc-900/50 border-b border-zinc-800 scrollbar-hide">
                                <button onClick={() => { playClick(); setSelectedTag(null); }} className={`px-3 py-1 rounded-sm text-[10px] font-mono whitespace-nowrap border ${!selectedTag ? 'bg-primary/20 text-primary border-primary' : 'bg-transparent text-zinc-500 border-zinc-700'}`}>ALL</button>
                                {uniqueTags.map(tag => (
                                    <button key={tag} onClick={() => { playClick(); setSelectedTag(tag === selectedTag ? null : tag); }} className={`px-3 py-1 rounded-sm text-[10px] font-mono whitespace-nowrap border ${selectedTag === tag ? 'bg-primary/20 text-primary border-primary' : 'bg-transparent text-zinc-400 border-zinc-800'}`}>{tag}</button>
                                ))}
                            </div>
                        )}
                        {displayedList.map(biz => (
                            <div key={biz.id} ref={state.selectedBusinessId === biz.id ? selectedRef : null}>
                                <BusinessCard
                                    business={biz}
                                    isSelected={state.selectedBusinessId === biz.id}
                                    isFavorite={handlers.isFavorite(biz.id)}
                                    onToggleFavorite={(b) => { playClick(); handlers.toggleFavorite(b); }}
                                    onClick={() => { playClick(); handlers.handleSelectBusiness(biz.id); }}
                                    onSpeak={(t) => { playClick(); handlers.handleSpeak(t); }}
                                    onHover={(id) => { if (id !== hoveredBusinessId) playHover(); setHoveredBusinessId(id); }}
                                    isInComparison={comparisonList.some(b => b.id === biz.id)}
                                    onToggleComparison={(b) => { playClick(); handlers.toggleComparison(b); }}
                                />
                            </div>
                        ))}
                        {displayedList.length === 0 && (
                            <div className="p-8 text-center text-zinc-600 text-xs font-mono flex flex-col items-center gap-2 mt-10">
                                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
                                    <svg className="w-6 h-6 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                </div>
                                NO ARCHIVED ENTITIES
                            </div>
                        )}
                    </>
                )}

                {/* --- MISSIONS TAB CONTENT --- */}
                {activeTab === Tab.MISSIONS && (
                    <MissionLog
                        missions={missions}
                        onDelete={(id) => { playClick(); handlers.deleteMission(id); }}
                        onLoad={(m) => { playFunctions.playSuccess(); handlers.handlePlotItinerary(m); }}
                    />
                )}

            </div>
        </div>
    );
};
