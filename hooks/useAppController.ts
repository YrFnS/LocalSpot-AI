
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Business, SearchState, ViewMode, FilterState, Tab, SortOption, WeatherState, WeatherCondition, ComparisonResult, VibeState } from '../types';
import { searchLocalBusinesses, getFeaturedBusinesses } from '../services/searchService';
import { getAiSuggestions, analyzeImageAndSearch, compareBusinesses, generateVibeQuery } from '../services/insightService';
import { speakDescription } from '../services/audioGenService';
import { getRandomWeather } from '../services/weatherService';
import { useGeolocation } from './useGeolocation';
import { useFavorites } from './useFavorites';
import { getThemeForQuery, THEMES } from '../utils/themeUtils';
import { filterBusinesses } from '../utils/filterUtils';

export const useAppController = () => {
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

    const [showDetailModal, setShowDetailModal] = useState(false);

    // Comparisons State
    const [comparisonList, setComparisonList] = useState<Business[]>([]);
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const [isComparing, setIsComparing] = useState(false);

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

    const handleSearch = useCallback(async (query: string) => {
        setActiveTab(Tab.SEARCH);
        setState(s => ({ ...s, isSearching: true, query, error: null, selectedBusinessId: null }));
        setShowDetailModal(false);
        setThemeClass(getThemeForQuery(query));
        setAiAnalysisResult(null); 
        
        try {
            const { businesses } = await searchLocalBusinesses(query, state.userLocation, weather);
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

    const handleVibeSearch = async (vibes: VibeState) => {
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
    };

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

    const handleRescan = useCallback(() => {
        handleSearch(state.query || "hidden gems and cool spots");
    }, [state.query, handleSearch]);

    const handleWeatherToggle = (condition: WeatherCondition) => {
        setWeather(prev => ({ ...prev, condition }));
    };

    // --- Comparison Handlers ---
    const toggleComparison = (business: Business) => {
        setComparisonList(prev => {
            const exists = prev.find(b => b.id === business.id);
            if (exists) {
                return prev.filter(b => b.id !== business.id);
            }
            if (prev.length >= 2) {
                // Replace the oldest
                return [prev[1], business];
            }
            return [...prev, business];
        });
    };

    const removeFromComparison = (id: string) => {
        setComparisonList(prev => prev.filter(b => b.id !== id));
    };

    const runComparison = async () => {
        if (comparisonList.length < 2) return;
        setIsComparing(true);
        const result = await compareBusinesses(comparisonList[0], comparisonList[1]);
        setComparisonResult(result);
        setIsComparing(false);
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
        hoveredBusinessId,
        setHoveredBusinessId,
        weather,
        comparisonList,
        comparisonResult,
        isComparing,
        setComparisonResult,
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
            runComparison
        }
    };
};
