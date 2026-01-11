
import { useState, useEffect, useCallback, useMemo } from 'react';
import { SearchState, ViewMode, FilterState, Tab, SortOption, WeatherState, WeatherCondition, VibeState, Coordinates, Itinerary } from '../types';
import { searchLocalBusinesses, getFeaturedBusinesses } from '../services/searchService';
import { getAiSuggestions, analyzeImageAndSearch, generateVibeQuery } from '../services/insightService';
import { speakDescription } from '../services/audioGenService';
import { getRandomWeather } from '../services/weatherService';
import { useGeolocation } from './useGeolocation';
import { useFavorites } from '../features/business/useFavorites';
import { useMissions } from '../features/missions/useMissions';
import { useComparison } from '../features/comparison/useComparison';
import { getThemeForQuery, THEMES } from '../utils/themeUtils';
import { filterBusinesses } from '../utils/filterUtils';

export const useAppController = () => {
    const [isBooting, setIsBooting] = useState(true);
    const [state, setState] = useState<SearchState>({
        query: '',
        results: [],
        isSearching: false,
        selectedBusinessId: null,
        userLocation: null,
        error: null
    });

    const { location: userLocation } = useGeolocation();
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

    const [activeTab, setActiveTab] = useState<Tab>(Tab.SEARCH);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [themeClass, setThemeClass] = useState(THEMES.default);
    
    // UI States
    const [isOracleOpen, setIsOracleOpen] = useState(false);
    const [isCuratorOpen, setIsCuratorOpen] = useState(false);
    const [isVisionOpen, setIsVisionOpen] = useState(false); 
    const [isVisionAnalyzing, setIsVisionAnalyzing] = useState(false);
    
    // Vibe Synthesizer
    const [isSynthesizerOpen, setIsSynthesizerOpen] = useState(false);
    const [isSynthesizing, setIsSynthesizing] = useState(false);

    // Itinerary / Mission
    const [activeItinerary, setActiveItinerary] = useState<Itinerary | null>(null);

    const [showDetailModal, setShowDetailModal] = useState(false);

    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null); 
    
    const [hoveredBusinessId, setHoveredBusinessId] = useState<string | null>(null);
    
    const [weather, setWeather] = useState<WeatherState>(getRandomWeather());

    const [filters, setFilters] = useState<FilterState>({
        minRating: 0,
        priceLevels: [],
        onlyOpen: false,
        sortBy: SortOption.RELEVANCE
    });

    // Boot Sequence Simulation
    useEffect(() => {
        const timer = setTimeout(() => setIsBooting(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    // Initial Data Fetch
    useEffect(() => {
        if (userLocation) {
            setState(s => ({ ...s, userLocation }));
            if (state.results.length === 0 && !state.isSearching) {
                getFeaturedBusinesses(userLocation)
                    .then(featured => setState(s => ({ ...s, results: featured })))
                    .catch(console.error);
            }
        }
    }, [userLocation]);

    useEffect(() => {
        if (userLocation) {
             getAiSuggestions(userLocation, weather)
                .then(setAiSuggestions)
                .catch(console.error);
        }
    }, [userLocation, weather.condition]);

    const handleSearch = useCallback(async (query: string, customLocation?: Coordinates) => {
        setActiveTab(Tab.SEARCH);
        setState(s => ({ ...s, isSearching: true, query, error: null, selectedBusinessId: null }));
        setShowDetailModal(false);
        setActiveItinerary(null); // Clear itinerary on new search
        setThemeClass(getThemeForQuery(query));
        setAiAnalysisResult(null); 
        
        try {
            const searchLocation = customLocation || state.userLocation;
            const { businesses } = await searchLocalBusinesses(query, searchLocation, weather);
            setState(s => ({ ...s, results: businesses, isSearching: false }));
        } catch (error) {
            setState(s => ({ ...s, isSearching: false, error: 'Connection failed.' }));
        }
    }, [state.userLocation, weather]);

    const handleVisionAnalyze = useCallback(async (base64Image: string) => {
        setIsVisionAnalyzing(true);
        try {
            const result = await analyzeImageAndSearch(base64Image, state.userLocation, weather);
            setIsVisionOpen(false);
            setActiveTab(Tab.SEARCH);
            setState(s => ({ ...s, results: result.businesses, isSearching: false, query: "Visual Search Match" }));
            setAiAnalysisResult(result.analysis);
            setThemeClass(THEMES.default); 

        } catch (e) {
            setState(s => ({ ...s, error: 'Visual Analysis Failed' }));
        } finally {
            setIsVisionAnalyzing(false);
        }
    }, [state.userLocation, weather]);

    const handleVibeSearch = useCallback(async (vibes: VibeState) => {
        setIsSynthesizing(true);
        try {
            const query = await generateVibeQuery(vibes);
            setIsSynthesizerOpen(false);
            await handleSearch(query);
        } catch (e) {
            setState(s => ({ ...s, error: 'Synthesizer Failed' }));
        } finally {
            setIsSynthesizing(false);
        }
    }, [handleSearch]);

    const handleSpeak = (text: string) => {
        speakDescription(text, () => setIsAudioPlaying(true), () => setIsAudioPlaying(false));
    };

    const handleSelectBusiness = (id: string) => {
        setState(s => ({ ...s, selectedBusinessId: id }));
        if (viewMode === ViewMode.GRID) {
            setShowDetailModal(true);
        }
    };

    const handleOpenDetail = (id: string) => {
        setState(s => ({ ...s, selectedBusinessId: id }));
        setShowDetailModal(true);
    };

    const handlePlotItinerary = (itinerary: Itinerary) => {
        setActiveItinerary(itinerary);
        setViewMode(ViewMode.MAP); // Force map view
        setIsCuratorOpen(false); // Close panel to show map
    };

    const handleRescan = useCallback((customLocation?: Coordinates) => {
        handleSearch(state.query || "hidden gems and cool spots", customLocation);
    }, [state.query, handleSearch]);

    const handleWeatherToggle = (condition: WeatherCondition) => {
        setWeather(prev => ({ ...prev, condition }));
    };

    // Computed Data
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

    return {
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
        handleVisionAnalyze,
        isSynthesizerOpen,
        setIsSynthesizerOpen,
        isSynthesizing,
        handleVibeSearch,
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
            handleWeatherToggle,
            toggleComparison,
            removeFromComparison,
            runComparison,
            handlePlotItinerary,
            saveMission,
            deleteMission
        }
    };
};
