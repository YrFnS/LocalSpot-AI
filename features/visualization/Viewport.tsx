
import React from 'react';
import { ViewMode, Business, Itinerary, WeatherState } from '../../types';
import { RadarMap } from './RadarMap';
import { RealMap } from './RealMap';
import { BusinessGrid } from './BusinessGrid';

interface ViewportProps {
    viewMode: ViewMode;
    displayedList: Business[];
    state: any;
    hoveredBusinessId: string | null;
    activeItinerary: Itinerary | null;
    handlers: any;
    setHoveredBusinessId: (id: string | null) => void;
    playFunctions: any;

}

export const Viewport: React.FC<ViewportProps> = ({
    viewMode,
    displayedList,
    state,
    hoveredBusinessId,
    activeItinerary,
    handlers,
    setHoveredBusinessId,
    playFunctions,

}) => {
    const { playClick, playHover, playScan } = playFunctions;

    if (viewMode === ViewMode.GRID) {
        return (
            <BusinessGrid
                businesses={displayedList}
                onSelect={(id) => { playClick(); handlers.handleSelectBusiness(id); }}
                selectedId={state.selectedBusinessId}
                onHover={(id) => { if (id && id !== hoveredBusinessId) playHover(); setHoveredBusinessId(id); }}
                isLoading={state.isSearching}
            />
        );
    }
    if (viewMode === ViewMode.MAP) {
        return (
            <RealMap
                userLocation={state.userLocation}
                businesses={displayedList}
                onSelect={(id) => { playClick(); handlers.handleSelectBusiness(id); }}
                selectedId={state.selectedBusinessId}
                hoveredId={hoveredBusinessId}
                setHoveredId={(id) => { if (id && id !== hoveredBusinessId) playHover(); setHoveredBusinessId(id); }}
                onRescan={() => { playScan(); handlers.handleRescan(); }}
                activeItinerary={activeItinerary}
            />
        );
    }
    return (
        <RadarMap
            userLocation={state.userLocation}
            businesses={displayedList}
            selectedId={state.selectedBusinessId}
            onSelect={(id) => { playClick(); handlers.handleSelectBusiness(id); }}
            onRescan={() => { playScan(); handlers.handleRescan(); }}
            hoveredId={hoveredBusinessId}
            setHoveredId={(id) => { if (id && id !== hoveredBusinessId) playHover(); setHoveredBusinessId(id); }}
        />
    );
};
