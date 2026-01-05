
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Business, SearchState, ViewMode, FilterState, Tab } from '../types';
import { searchLocalBusinesses, getFeaturedBusinesses, speakDescription, getAiSuggestions } from '../services/geminiService';
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
    const [isOracleOpen, setIsOracleOpen] = useState(false);
    const [isCuratorOpen, setIsCuratorOpen] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    
    // New Global Hover State
    const [hoveredBusinessId, setHoveredBusinessId] = useState<string | null>(null);
    
    const [filters, setFilters] = useState<FilterState>({
        minRating: 0,
        priceLevels: [],
        onlyOpen: false
    });
    
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        if (userLocation) {
            setState(s => ({ ...s, userLocation }));
            if (state.results.length === 0 && !state.isSearching) {
                getFeaturedBusinesses(userLocation)
                    .then(featured => setState(s => ({ ...s, results: featured })))
                    .catch(console.error);
                getAiSuggestions(userLocation)
                    .then(setAiSuggestions)
                    .catch(console.error);
            }
        }
    }, [userLocation, state.results.length, state.isSearching]);

    const handleSearch = useCallback(async (query: string) => {
        setActiveTab(Tab.SEARCH);
        setState(s => ({ ...s, isSearching: true, query, error: null, selectedBusinessId: null }));
        setShowDetailModal(false);
        setThemeClass(getThemeForQuery(query));
        
        try {
            const { businesses } = await searchLocalBusinesses(query, state.userLocation);
            setState(s => ({ ...s, results: businesses, isSearching: false }));
        } catch (error) {
            setState(s => ({ ...s, isSearching: false, error: 'Connection failed.' }));
        }
    }, [state.userLocation]);

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
            getSelectedBusiness
        }
    };
};
