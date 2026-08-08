
import { useState } from 'react';
import { Tab, ViewMode } from '../../types';
import { THEMES } from './themeUtils';

export const useUIController = () => {
    // Navigation & View
    const [activeTab, setActiveTab] = useState<Tab>(Tab.SEARCH);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
    const [themeClass, setThemeClass] = useState(THEMES.default);
    
    // Audio State
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    
    // Interaction State
    const [hoveredBusinessId, setHoveredBusinessId] = useState<string | null>(null);

    // Modal/Overlay States
    const [isCuratorOpen, setIsCuratorOpen] = useState(false);
    const [isVisionOpen, setIsVisionOpen] = useState(false);
    const [isSynthesizerOpen, setIsSynthesizerOpen] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Boot Sequence
    const [isBooting, setIsBooting] = useState(true);

    return {
        // State
        activeTab,
        viewMode,
        themeClass,
        isAudioPlaying,
        hoveredBusinessId,
        isCuratorOpen,
        isVisionOpen,
        isSynthesizerOpen,
        showDetailModal,
        isBooting,

        // Setters
        setActiveTab,
        setViewMode,
        setThemeClass,
        setIsAudioPlaying,
        setHoveredBusinessId,
        setIsCuratorOpen,
        setIsVisionOpen,
        setIsSynthesizerOpen,
        setShowDetailModal,
        setIsBooting
    };
};
