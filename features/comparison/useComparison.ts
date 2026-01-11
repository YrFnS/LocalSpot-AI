
import { useState } from 'react';
import { Business, ComparisonResult } from '../../types';
import { compareBusinesses } from '../../services/insightService';

export const useComparison = () => {
    const [comparisonList, setComparisonList] = useState<Business[]>([]);
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const [isComparing, setIsComparing] = useState(false);

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

    return {
        comparisonList,
        comparisonResult,
        isComparing,
        setComparisonResult,
        toggleComparison,
        removeFromComparison,
        runComparison
    };
};
