import { UUID, LatLng, Money, DayOfWeek } from '../common/types';
import { Image } from '../common/images';
import { User, CurrentUser } from './user';
import { LISTING_STATES } from '../../constants';

// Listing state type
export type ListingState = typeof LISTING_STATES[number];

export interface ListingAttributes {
  title: string;
  description?: string;
  geolocation?: LatLng;
  deleted?: boolean;
  state?: ListingState;
  price?: Money;
  publicData?: Record<string, any>;
}

export interface OwnListingAttributes {
  title: string;
  description?: string;
  geolocation?: LatLng;
  deleted: boolean;
  state: ListingState;
  price?: Money;
  availabilityPlan?: AvailabilityPlan;
  publicData: Record<string, any>;
}

export interface DeletedListingAttributes {
  deleted: boolean;
}

export interface AvailabilityPlan {
  type: 'availability-plan/day' | 'availability-plan/time';
  timezone?: string;
  entries?: AvailabilityEntry[];
}

export interface AvailabilityEntry {
  dayOfWeek: DayOfWeek;
  seats: number;
  start?: string;
  end?: string;
}

// Denormalised listing object
export interface Listing {
  id: UUID;
  type: 'listing';
  attributes: ListingAttributes | DeletedListingAttributes;
  author?: User;
  images?: Image[];
}

// Denormalised ownListing object
export interface OwnListing {
  id: UUID;
  type: 'ownListing';
  attributes: OwnListingAttributes | DeletedListingAttributes;
  author?: CurrentUser;
  images?: Image[];
}
