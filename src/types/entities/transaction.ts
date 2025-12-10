import { LINE_ITEMS } from '../../constants';
import { UUID, Money } from '../common/types';
import { Booking } from './booking';
import { Listing } from './listing';
import { Review } from './review';
import { User } from './user';

// Line item type
export type LineItemType = typeof LINE_ITEMS[number];

export interface Transition {
  createdAt: Date;
  by: string; // TX_TRANSITION_ACTORS
  transition: string; // from TRANSITIONS
  offerInSubunits?: number;
}

export interface LineItem {
  code: string; // Must match /^line-item\/.+/
  includeFor: ('customer' | 'provider')[];
  quantity?: number;
  unitPrice: Money;
  lineTotal: Money;
  reversal: boolean;
}

// Denormalised transaction object
export interface Transaction {
  id: UUID;
  type: 'transaction';
  attributes: {
    createdAt?: Date;
    processName: string;
    lastTransitionedAt: Date;
    lastTransition: string; // from TRANSITIONS
    payinTotal?: Money;
    payoutTotal?: Money;
    lineItems?: LineItem[];
    transitions: Transition[];
  };
  booking?: Booking;
  listing?: Listing;
  customer?: User;
  provider?: User;
  reviews?: Review[];
}

// Denormalised transaction message
export interface Message {
  id: UUID;
  type: 'message';
  attributes: {
    createdAt: Date;
    content: string;
  };
  sender?: User;
}
