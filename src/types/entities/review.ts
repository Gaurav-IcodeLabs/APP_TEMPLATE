import { REVIEW_RATINGS, REVIEW_TYPES } from '../../constants';
import { UUID } from '../common/types';
import { User } from './user';

// Review types
export type ReviewType = typeof REVIEW_TYPES[number];
export type ReviewRating = typeof REVIEW_RATINGS[number];

// A review on a user
export interface Review {
  id: UUID;
  attributes: {
    createdAt: Date;
    content?: string;
    rating?: ReviewRating;
    state: string;
    type: ReviewType;
  };
  author?: User;
  subject?: User;
}
