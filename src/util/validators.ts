/**
 * Validation constants and patterns for form validation
 * Used with React Hook Form in the mobile app
 */

// Password constraints
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 256;

// Email validation pattern
// Source: http://www.regular-expressions.info/email.html
// See the link above for an explanation of the tradeoffs.
export const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// Utility function for checking non-empty strings
export const isNonEmptyString = (val: any): boolean => {
  return typeof val === 'string' && val.trim().length > 0;
};
