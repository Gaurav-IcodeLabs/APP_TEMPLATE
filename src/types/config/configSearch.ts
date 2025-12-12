// ----------------------
//  FILTER TYPES
// ----------------------

// export type SchemaType =
//   | "category"
//   | "dates"
//   | "price"
//   | "listingType"
//   | "seats"
//   | string;

// --- Category filter ---
export interface CategoryFilter {
  enabled?: boolean;
  key: string; // "categoryLevel"
  schemaType: 'category';
  scope: string; // "public"
  isNestedEnum: boolean;
  nestedParams: string[]; // ["categoryLevel1", "categoryLevel2", ...]
}

// --- Dates filter ---
export interface DatesFilter {
  key?: string; // "dates"
  schemaType: 'dates';
  label?: string;
  availability?: string; // "time-full"
  dateRangeMode?: string; // "day"
  enabled?: boolean;
}

// --- Price filter ---
export interface PriceFilter {
  enabled?: boolean;
  key?: string; // "price"
  schemaType: 'price';
  label?: string;
  min: number;
  max: number;
  step: number;
}

export interface KeywordsFilter {
  enabled?: boolean;
  key: string; // "keywords"
  schemaType: 'keywords';
  label?: string;
}

// Union of default filters
export type DefaultFilter = CategoryFilter | DatesFilter | PriceFilter | KeywordsFilter | SeatsFilter | ListingTypeFilter;

// ----------------------
//  SORTING CONFIG
// ----------------------

export interface SortOption {
  key: 'createdAt' | '-createdAt' | 'price' | '-price' | 'relevance'; // e.g. "createdAt", "-price", "relevance"
  labelTranslationKey: string;
  labelTranslationKeyLong?: string;
}

export interface SortConfig {
  active: boolean;
  queryParamName: string; // "sort"
  relevanceKey: string; // "relevance"
  relevanceFilter: string; // "keywords"
  conflictingFilters: string[];
  options: SortOption[];
}

// ----------------------
//  OTHER SEARCH CONFIG
// ----------------------

export interface ListingTypeFilter {
  enabled?: boolean;
  key: string; // "listingType"
  schemaType: 'listingType';
  label?: string;
}

export interface SeatsFilter {
  enabled?: boolean;
  key: string; // "seats"
  schemaType: 'seats';
  label?: string;
}

export interface MainSearch {
  searchType: string; // "location"
}

// ----------------------
// FINAL Search Config
// ----------------------

export interface SearchConfig {
  mainSearch: MainSearch;
  // defaultFilters: DefaultFilter[];
  dateRangeFilter?: DatesFilter;
  priceFilter?: PriceFilter;
  categoryFilter?: CategoryFilter;
  keywordsFilter?: KeywordsFilter;
  sortConfig?: SortConfig;
  listingTypeFilter?: ListingTypeFilter;
  seatsFilter?: SeatsFilter;
}
