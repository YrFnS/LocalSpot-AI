
import { Business, FilterState, SortOption } from '../types';

export const filterBusinesses = (businesses: Business[], filters: FilterState): Business[] => {
  // 1. Filter
  const filtered = businesses.filter(biz => {
    // Rating Filter
    if (biz.rating && biz.rating < filters.minRating) {
      return false;
    }

    // Price Filter
    if (filters.priceLevels.length > 0) {
       if (!biz.priceLevel || !filters.priceLevels.includes(biz.priceLevel)) {
         return false;
       }
    }

    // Open Now Filter
    if (filters.onlyOpen && biz.openNow === false) {
      return false;
    }

    return true;
  });

  // 2. Sort
  return filtered.sort((a, b) => {
    switch (filters.sortBy) {
        case SortOption.RATING:
            return (b.rating || 0) - (a.rating || 0);
        case SortOption.DISTANCE:
            // Treat undefined distance as infinity (put at bottom)
            const distA = a.distanceMeters ?? Number.MAX_VALUE;
            const distB = b.distanceMeters ?? Number.MAX_VALUE;
            return distA - distB;
        case SortOption.RELEVANCE:
        default:
            // Maintain original index order from AI/Search result
            return 0;
    }
  });
};
