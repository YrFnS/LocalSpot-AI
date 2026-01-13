
import { useState, useEffect, useCallback } from 'react';
import { SearchState, Coordinates, WeatherState, FilterState, SortOption, WeatherCondition, VibeState } from '../../types';
import { searchLocalBusinesses, getFeaturedBusinesses } from './searchService';
import { getAiSuggestions, analyzeImageAndSearch, generateVibeQuery } from './searchInsights';
import { getRandomWeather } from '../context/weatherService';
import { useGeolocation } from '../location/useGeolocation';

export const useSearchController = () => {
    const { location: userLocation } = useGeolocation();
    
    const [state, setState] = useState<SearchState>({
        query: '',
        results: [],
        isSearching: false,
        selectedBusinessId: null,
        userLocation: null,
        error: null
    });

    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
    const [weather, setWeather] = useState<WeatherState>(getRandomWeather());
    const [filters, setFilters] = useState<FilterState>({
        minRating: 0,
        priceLevels: [],
        onlyOpen: false,
        sortBy: SortOption.RELEVANCE
    });

    const [isVisionAnalyzing, setIsVisionAnalyzing] = useState(false);
    const [isSynthesizing, setIsSynthesizing] = useState(false);

    // Initialize Location & Featured
    useEffect(() => {
        if (userLocation) {
            setState(s => ({ ...s, userLocation }));
            // Only fetch featured if we have no results and aren't searching
            if (state.results.length === 0 && !state.isSearching) {
                getFeaturedBusinesses(userLocation, weather)
                    .then(featured => setState(s => ({ ...s, results: featured })))
                    .catch(console.error);
            }
        }
    }, [userLocation]);

    // Initialize Suggestions
    useEffect(() => {
        if (userLocation) {
             getAiSuggestions(userLocation, weather)
                .then(setAiSuggestions)
                .catch(console.error);
        }
    }, [userLocation, weather.condition]);

    const executeSearch = useCallback(async (query: string, customLocation?: Coordinates) => {
        setState(s => ({ ...s, isSearching: true, query, error: null, selectedBusinessId: null }));
        setAiAnalysisResult(null); 
        
        try {
            const searchLocation = customLocation || state.userLocation;
            const { businesses } = await searchLocalBusinesses(query, searchLocation, weather);
            setState(s => ({ ...s, results: businesses, isSearching: false }));
        } catch (error) {
            setState(s => ({ ...s, isSearching: false, error: 'Connection failed.' }));
        }
    }, [state.userLocation, weather]);

    const executeVisionAnalysis = useCallback(async (base64Image: string) => {
        setIsVisionAnalyzing(true);
        try {
            const result = await analyzeImageAndSearch(base64Image, state.userLocation, weather);
            setState(s => ({ ...s, results: result.businesses, isSearching: false, query: "Visual Search Match" }));
            setAiAnalysisResult(result.analysis);
            return true; // Success
        } catch (e) {
            setState(s => ({ ...s, error: 'Visual Analysis Failed' }));
            return false;
        } finally {
            setIsVisionAnalyzing(false);
        }
    }, [state.userLocation, weather]);

    const executeVibeAnalysis = useCallback(async (vibes: VibeState) => {
        setIsSynthesizing(true);
        try {
            const query = await generateVibeQuery(vibes);
            await executeSearch(query);
            return true;
        } catch (e) {
            setState(s => ({ ...s, error: 'Synthesizer Failed' }));
            return false;
        } finally {
            setIsSynthesizing(false);
        }
    }, [executeSearch]);

    const selectBusiness = useCallback((id: string | null) => {
        setState(s => ({ ...s, selectedBusinessId: id }));
    }, []);

    const toggleWeather = useCallback((condition: WeatherCondition) => {
        setWeather(prev => ({ ...prev, condition }));
    }, []);

    return {
        state,
        userLocation,
        aiSuggestions,
        aiAnalysisResult,
        weather,
        filters,
        isVisionAnalyzing,
        isSynthesizing,
        setFilters,
        executeSearch,
        executeVisionAnalysis,
        executeVibeAnalysis,
        selectBusiness,
        toggleWeather
    };
};
