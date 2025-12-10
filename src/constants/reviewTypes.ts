// Review types: review of a provider and of a customer
export const REVIEW_TYPE_OF_PROVIDER = 'ofProvider';
export const REVIEW_TYPE_OF_CUSTOMER = 'ofCustomer';

export const REVIEW_TYPES = [REVIEW_TYPE_OF_PROVIDER, REVIEW_TYPE_OF_CUSTOMER] as const;

// Possible amount of stars in a review
export const REVIEW_RATINGS = [1, 2, 3, 4, 5] as const;
