/**
 * Tab constants for EditListing wizard
 * These match the web-template tab structure
 */
export const DETAILS = 'details';
export const PRICING = 'pricing';
export const PRICING_AND_STOCK = 'pricing-and-stock';
export const DELIVERY = 'delivery';
export const LOCATION = 'location';
export const AVAILABILITY = 'availability';
export const PHOTOS = 'photos';
export const STYLE = 'style';

export type TabType =
  | typeof DETAILS
  | typeof PRICING
  | typeof PRICING_AND_STOCK
  | typeof DELIVERY
  | typeof LOCATION
  | typeof AVAILABILITY
  | typeof PHOTOS
  | typeof STYLE;

export const SUPPORTED_TABS: TabType[] = [
  DETAILS,
  PRICING,
  PRICING_AND_STOCK,
  DELIVERY,
  LOCATION,
  AVAILABILITY,
  PHOTOS,
  STYLE,
];
