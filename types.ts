
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface BookingSlot {
  time: string;
  available: boolean;
}

export interface Business {
  id: string;
  name: string;
  address: string;
  rating?: number;
  ratingCount?: number;
  websiteUri?: string;
  googleMapsUri?: string;
  priceLevel?: string; // e.g. "$", "$$", "$$$"
  types?: string[];
  location?: Coordinates;
  photos?: {
    name: string;
    widthPx: number;
    heightPx: number;
    authorAttributions: any[];
  }[];
  reviews?: {
    name: string;
    relativePublishTimeDescription: string;
    rating: number;
    text: {
      text: string;
      languageCode: string;
    };
    authorAttribution: {
      displayName: string;
      photoUri: string;
    };
  }[];
  distanceMeters?: number; // Calculated field
  description?: string; // AI generated
  
  // New Enhanced Fields
  verified?: boolean; // Premium feature
  vibe?: string; // e.g., "Cozy", "Industrial", "Romantic"
  bestFor?: string[]; // e.g., ["Date Night", "Remote Work"]
  openNow?: boolean;
  phoneNumber?: string;
  hours?: string;
  
  // Booking Data
  bookingAvailable?: boolean;
  slots?: BookingSlot[];
  
  // User Data
  userNote?: string;
  userTags?: string[];
}

export interface SearchState {
  query: string;
  results: Business[];
  isSearching: boolean;
  selectedBusinessId: string | null;
  userLocation: Coordinates | null;
  error: string | null;
}

export enum SortOption {
  RELEVANCE = 'RELEVANCE',
  RATING = 'RATING',
  DISTANCE = 'DISTANCE'
}

export interface FilterState {
  minRating: number; // 0-5
  priceLevels: string[]; // ["FREE", "$", "$$", "$$$", "$$$$"]
  onlyOpen: boolean;
  sortBy: SortOption;
}

export enum ViewMode {
  LIST = 'LIST',
  RADAR = 'RADAR',
  GRID = 'GRID',
  MAP = 'MAP',
}

export enum Tab {
  SEARCH = 'SEARCH',
  FAVORITES = 'FAVORITES',
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
}

export interface ItineraryItem {
  id: string;
  timeOffset: string; // e.g. "6:00 PM"
  title: string;
  description: string; // Why this spot?
  businessId?: string; // Link to actual business if available
  business?: Business;
  type: 'FOOD' | 'ACTIVITY' | 'DRINK' | 'OTHER';
}

export interface Itinerary {
  title: string;
  items: ItineraryItem[];
  totalCostEstimate: string;
}

export type WeatherCondition = 'Sunny' | 'Rainy' | 'Cloudy' | 'Foggy' | 'Night';

export interface WeatherState {
    condition: WeatherCondition;
    temperature: number;
    isSimulated: boolean;
}

export interface ComparisonAspect {
    name: string;
    winnerId: string | null; // null for tie
    description: string;
}

export interface ComparisonResult {
    headline: string;
    summary: string;
    winnerId: string | null;
    winnerReason: string;
    aspects: ComparisonAspect[];
}

export interface VibeState {
    entropy: number;   // 0 (Order) - 100 (Chaos)
    grit: number;      // 0 (Polished) - 100 (Raw)
    epoch: number;     // 0 (Historic) - 100 (Future)
    obscurity: number; // 0 (Popular) - 100 (Secret)
}
