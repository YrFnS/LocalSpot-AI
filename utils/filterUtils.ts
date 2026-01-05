import { Business, FilterState } from '../types';

export const filterBusinesses = (businesses: Business[], filters: FilterState): Business[] => {
  return businesses.filter(biz => {
    // Rating Filter
    if (biz.rating && biz.rating < filters.minRating) {
      return false;
    }

    // Price Filter
    // If no price filters selected, show all.
    if (filters.priceLevels.length > 0) {
       // Normalize price level to length of '$' signs if needed, or exact string match
       // Our service returns "$", "$$", etc.
       if (!biz.priceLevel || !filters.priceLevels.includes(biz.priceLevel)) {
         return false;
       }
    }

    // Open Now Filter
    // Note: Since we mock 'openNow' in the service usually, this depends on that data being present.
    // If data is missing, we assume true to avoid hiding everything in demo mode.
    if (filters.onlyOpen && biz.openNow === false) {
      return false;
    }

    return true;
  });
};
