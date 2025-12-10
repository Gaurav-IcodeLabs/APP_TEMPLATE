export interface SortConfigOptionWithLabel {
  key: 'createdAt' | '-createdAt' | 'price' | '-price' | 'relevance';
  label: string;
  longLabel?: string;
}

export interface SortConfigOptionWithTranslationKey {
  key: 'createdAt' | '-createdAt' | 'price' | '-price' | 'relevance';
  labelTranslationKey: string;
  labelTranslationKeyLong?: string;
}

export type SortConfigOption = SortConfigOptionWithLabel | SortConfigOptionWithTranslationKey;

export interface SortConfig {
  active: boolean;
  queryParamName: 'sort';
  relevanceKey: string;
  conflictingFilters?: string[];
  options?: SortConfigOption[];
}
