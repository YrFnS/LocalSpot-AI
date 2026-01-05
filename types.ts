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

export interface FilterState {
  minRating: number; // 0-5
  priceLevels: string[]; // ["FREE", "$", "$$", "$$$", "$$$$"]
  onlyOpen: boolean;
}

export enum ViewMode {
  LIST = 'LIST',
  RADAR = 'RADAR',
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
}