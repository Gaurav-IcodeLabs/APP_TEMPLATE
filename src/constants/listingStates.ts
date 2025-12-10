// Listing state constants
export const LISTING_STATE_DRAFT = 'draft';
export const LISTING_STATE_PENDING_APPROVAL = 'pendingApproval';
export const LISTING_STATE_PUBLISHED = 'published';
export const LISTING_STATE_CLOSED = 'closed';

export const LISTING_STATES = [
  LISTING_STATE_DRAFT,
  LISTING_STATE_PENDING_APPROVAL,
  LISTING_STATE_PUBLISHED,
  LISTING_STATE_CLOSED,
] as const;
