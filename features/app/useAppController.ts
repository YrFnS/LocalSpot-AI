
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Tab, ViewMode, type Itinerary, type Coordinates } from '../../types';
import { speakDescription } from '../audio/audioGenService';
import { useFavorites } from '../business/useFavorites';
import { useMissions } from '../missions/useMissions';
import { useComparison } from '../comparison/useComparison';
import { getThemeForQuery, THEMES } from '../ui/themeUtils';
import { filterBusinesses } from '../search/filterUtils';

import { useSearchController } from '../search/useSearchController';
import { useUIController } from '../ui/useUIController';

export const useAppController = () => {
    // 1. Sub-Controllers
    const searchCtrl = useSearchController();
    const uiCtrl = useUIController();
    
    // 2. Data Hooks
    const { favorites, toggleFavorite, isFavorite, updateNote, addTag, removeTag, getFavorite } = useFavorites();
    const { missions, saveMission, deleteMission } = useMissions();
    const { 
        comparisonList, 
        comparisonResult, 
        isComparing, 
        setComparisonResult, 
        toggleComparison, 
        removeFromComparison, 
        runComparison 
    } = useComparison();

    // 3. Itinerary State (App Level)
    const [activeItinerary, setActiveItinerary] = useState<Itinerary | null>(null);
    
    // Boot Sequence Effect
    useEffect(() => {
        const timer = setTimeout(() => uiCtrl.setIsBooting(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    // --- Coordinators (Mediators between UI and Logic) ---

    const handleSearch = useCallback((query: string, customLocation?: Coordinates) => {
        // UI Updates
        uiCtrl.setActiveTab(Tab.SEARCH);
        uiCtrl.setShowDetailModal(false);
        setActiveItinerary(null);
        uiCtrl.setThemeClass(getThemeForQuery(query));
        
        // Logic execution
        searchCtrl.executeSearch(query, customLocation);
    }, [uiCtrl, searchCtrl]);

    const handleVisionAnalyze = useCallback(async (base64Image: string) => {
        const success = await searchCtrl.executeVisionAnalysis(base64Image);
        if (success) {
            uiCtrl.setIsVisionOpen(false);
            uiCtrl.setActiveTab(Tab.SEARCH);
            uiCtrl.setThemeClass(THEMES.default);
        }
    }, [searchCtrl, uiCtrl]);

    const handleVibeSearch = useCallback(async (vibes: any) => {
        const success = await searchCtrl.executeVibeAnalysis(vibes);
        if (success) {
            uiCtrl.setIsSynthesizerOpen(false);
        }
    }, [searchCtrl, uiCtrl]);

    const handleSelectBusiness = (id: string) => {
        searchCtrl.selectBusiness(id);
        if (uiCtrl.viewMode === ViewMode.GRID) {
            uiCtrl.setShowDetailModal(true);
        }
    };

    const handleOpenDetail = (id: string) => {
        searchCtrl.selectBusiness(id);
        uiCtrl.setShowDetailModal(true);
    };

    const handleRescan = useCallback((customLocation?: Coordinates) => {
        handleSearch(searchCtrl.state.query || "hidden gems and cool spots", customLocation);
    }, [searchCtrl.state.query, handleSearch]);

    const handleSpeak = (text: string) => {
        speakDescription(text, () => uiCtrl.setIsAudioPlaying(true), () => uiCtrl.setIsAudioPlaying(false));
    };

    const handlePlotItinerary = (itinerary: Itinerary) => {
        setActiveItinerary(itinerary);
        uiCtrl.setViewMode(ViewMode.MAP);
        uiCtrl.setIsCuratorOpen(false);
    };

    // --- Computed Data ---
    
    const uniqueTags = useMemo(() => {
        const tags = new Set<string>();
        favorites.forEach(f => f.userTags?.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [favorites]);

    const displayedList = useMemo(() => {
        const list = uiCtrl.activeTab === Tab.SEARCH ? searchCtrl.state.results : favorites;
        return filterBusinesses(list, searchCtrl.filters);
    }, [uiCtrl.activeTab, searchCtrl.state.results, favorites, searchCtrl.filters]);

    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Filter displayed list by tag if active
    const finalDisplayedList = useMemo(() => {
        if (uiCtrl.activeTab === Tab.FAVORITES && selectedTag) {
            return displayedList.filter(b => b.userTags?.includes(selectedTag));
        }
        return displayedList;
    }, [displayedList, uiCtrl.activeTab, selectedTag]);


    const getSelectedBusiness = () => {
        const biz = finalDisplayedList.find(b => b.id === searchCtrl.state.selectedBusinessId);
        if (biz && uiCtrl.activeTab === Tab.SEARCH && isFavorite(biz.id)) return getFavorite(biz.id) || biz;
        return biz;
    };

    return {
        // App State
        isBooting: uiCtrl.isBooting,
        activeItinerary,
        
        // Search Controller Exports
        state: searchCtrl.state,
        aiSuggestions: searchCtrl.aiSuggestions,
        aiAnalysisResult: searchCtrl.aiAnalysisResult,
        weather: searchCtrl.weather,
        filters: searchCtrl.filters,
        isVisionAnalyzing: searchCtrl.isVisionAnalyzing,
        isSynthesizing: searchCtrl.isSynthesizing,
        setFilters: searchCtrl.setFilters,

        // UI Controller Exports
        activeTab: uiCtrl.activeTab,
        setActiveTab: uiCtrl.setActiveTab,
        viewMode: uiCtrl.viewMode,
        setViewMode: uiCtrl.setViewMode,
        isAudioPlaying: uiCtrl.isAudioPlaying,
        themeClass: uiCtrl.themeClass,
        isCuratorOpen: uiCtrl.isCuratorOpen,
        setIsCuratorOpen: uiCtrl.setIsCuratorOpen,
        isVisionOpen: uiCtrl.isVisionOpen,
        setIsVisionOpen: uiCtrl.setIsVisionOpen,
        isSynthesizerOpen: uiCtrl.isSynthesizerOpen,
        setIsSynthesizerOpen: uiCtrl.setIsSynthesizerOpen,
        showDetailModal: uiCtrl.showDetailModal,
        setShowDetailModal: uiCtrl.setShowDetailModal,
        hoveredBusinessId: uiCtrl.hoveredBusinessId,
        setHoveredBusinessId: uiCtrl.setHoveredBusinessId,

        // Data / Domain Exports
        favorites,
        missions,
        uniqueTags,
        displayedList: finalDisplayedList,
        selectedTag,
        setSelectedTag,
        comparisonList,
        comparisonResult,
        isComparing,
        setComparisonResult,

        // Handlers
        handlers: {
            handleSearch,
            handleSpeak,
            handleSelectBusiness,
            handleOpenDetail,
            handleRescan,
            toggleFavorite,
            isFavorite,
            updateNote,
            addTag,
            removeTag,
            getSelectedBusiness,
            handleWeatherToggle: searchCtrl.toggleWeather,
            toggleComparison,
            removeFromComparison,
            runComparison,
            handlePlotItinerary,
            saveMission,
            deleteMission,
            handleVisionAnalyze,
            handleVibeSearch
        }
    };
};
