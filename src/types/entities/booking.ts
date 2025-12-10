import { UUID } from '../common/types';

// Possible amount of stars in a review
export const BOOKING_STATE_PENDING = 'pending';
export const BOOKING_STATE_ACCEPTED = 'accepted';
export const BOOKING_STATE_DECLINED = 'declined';
export const BOOKING_STATE_CANCELLED = 'cancelled';
export const BOOKING_STATES = [
  BOOKING_STATE_PENDING,
  BOOKING_STATE_ACCEPTED,
  BOOKING_STATE_DECLINED,
  BOOKING_STATE_CANCELLED,
] as const;

export type BookingState = typeof BOOKING_STATES[number];

// Denormalised booking object
export interface Booking {
  id: UUID;
  type: 'booking';
  attributes: {
    end: Date;
    start: Date;
    displayStart?: Date;
    displayEnd?: Date;
    state?: BookingState;
  };
}

// Denormalised time slot object
export interface TimeSlot {
  id: UUID;
  type: 'timeSlot';
  attributes: {
    type: 'time-slot/time';
    end: Date;
    start: Date;
  };
}

// Denormalised availability exception object
export interface AvailabilityException {
  id: UUID;
  type: 'availabilityException';
  attributes: {
    end: Date;
    seats: number;
    start: Date;
  };
}
