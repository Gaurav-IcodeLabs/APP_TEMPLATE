import { types } from '../../util/sdkLoader';
import { LISTING_UNIT_TYPES, STOCK_TYPES, AVAILABILITY_TYPES, DATE_TYPES } from '../../constants/lineItems';

// SDK type instances
export type UUID = typeof types.UUID;
export type LatLng = typeof types.LatLng;
export type LatLngBounds = typeof types.LatLngBounds;
export type Money = typeof types.Money;

// Line item related types
export type ListingUnitType = typeof LISTING_UNIT_TYPES[number];
export type StockType = typeof STOCK_TYPES[number];
export type AvailabilityType = typeof AVAILABILITY_TYPES[number];
export type DateType = typeof DATE_TYPES[number];

// Configuration for currency formatting
export interface CurrencyConfig {
  style: string;
  currency: string;
  currencyDisplay?: string;
  useGrouping?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// Place object from LocationAutocompleteInput
export interface Place {
  address: string;
  origin?: LatLng;
  bounds?: LatLngBounds; // optional viewport bounds
}

// Time slot that covers one day, having a start and end date.
export const TIME_SLOT_TIME = 'time-slot/time';

export const DAYS_OF_WEEK = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type DayOfWeek = typeof DAYS_OF_WEEK[number];
