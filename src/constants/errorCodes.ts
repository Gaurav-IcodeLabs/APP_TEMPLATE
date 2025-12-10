// API Error codes
export const ERROR_CODE_TRANSACTION_LISTING_NOT_FOUND = 'transaction-listing-not-found';
export const ERROR_CODE_TRANSACTION_INVALID_TRANSITION = 'transaction-invalid-transition';
export const ERROR_CODE_TRANSACTION_ALREADY_REVIEWED_BY_CUSTOMER =
  'transaction-already-reviewed-by-customer';
export const ERROR_CODE_TRANSACTION_ALREADY_REVIEWED_BY_PROVIDER =
  'transaction-already-reviewed-by-provider';
export const ERROR_CODE_TRANSACTION_BOOKING_TIME_NOT_AVAILABLE =
  'transaction-booking-time-not-available';
export const ERROR_CODE_TRANSACTION_LISTING_INSUFFICIENT_STOCK =
  'transaction-listing-insufficient-stock';
export const ERROR_CODE_PAYMENT_FAILED = 'transaction-payment-failed';
export const ERROR_CODE_CHARGE_ZERO_PAYIN = 'transaction-charge-zero-payin';
export const ERROR_CODE_CHARGE_ZERO_PAYOUT = 'transaction-charge-zero-payout';
export const ERROR_CODE_EMAIL_TAKEN = 'email-taken';
export const ERROR_CODE_EMAIL_NOT_FOUND = 'email-not-found';
export const ERROR_CODE_TOO_MANY_VERIFICATION_REQUESTS = 'email-too-many-verification-requests';
export const ERROR_CODE_UPLOAD_OVER_LIMIT = 'request-upload-over-limit';
export const ERROR_CODE_VALIDATION_INVALID_PARAMS = 'validation-invalid-params';
export const ERROR_CODE_VALIDATION_INVALID_VALUE = 'validation-invalid-value';
export const ERROR_CODE_NOT_FOUND = 'not-found';
export const ERROR_CODE_FORBIDDEN = 'forbidden';
export const ERROR_CODE_MISSING_STRIPE_ACCOUNT = 'transaction-missing-stripe-account';
export const ERROR_CODE_STOCK_OLD_TOTAL_MISMATCH = 'old-total-mismatch';
export const ERROR_CODE_PERMISSION_DENIED_POST_LISTINGS = 'permission-denied-post-listings';
export const ERROR_CODE_PERMISSION_DENIED_PENDING_APPROVAL = 'permission-denied-pending-approval';
export const ERROR_CODE_USER_PENDING_APPROVAL = 'user-pending-approval';
export const ERROR_CODE_PERMISSION_DENIED_INITIATE_TRANSACTIONS =
  'permission-denied-initiate-transactions';
export const ERROR_CODE_PERMISSION_DENIED_READ = 'permission-denied-read';

export const ERROR_CODES = [
  ERROR_CODE_TRANSACTION_LISTING_NOT_FOUND,
  ERROR_CODE_TRANSACTION_INVALID_TRANSITION,
  ERROR_CODE_TRANSACTION_ALREADY_REVIEWED_BY_CUSTOMER,
  ERROR_CODE_TRANSACTION_ALREADY_REVIEWED_BY_PROVIDER,
  ERROR_CODE_PAYMENT_FAILED,
  ERROR_CODE_CHARGE_ZERO_PAYIN,
  ERROR_CODE_CHARGE_ZERO_PAYOUT,
  ERROR_CODE_EMAIL_TAKEN,
  ERROR_CODE_EMAIL_NOT_FOUND,
  ERROR_CODE_TOO_MANY_VERIFICATION_REQUESTS,
  ERROR_CODE_UPLOAD_OVER_LIMIT,
  ERROR_CODE_VALIDATION_INVALID_PARAMS,
  ERROR_CODE_VALIDATION_INVALID_VALUE,
  ERROR_CODE_NOT_FOUND,
  ERROR_CODE_FORBIDDEN,
  ERROR_CODE_MISSING_STRIPE_ACCOUNT,
  ERROR_CODE_STOCK_OLD_TOTAL_MISMATCH,
  ERROR_CODE_PERMISSION_DENIED_POST_LISTINGS,
  ERROR_CODE_PERMISSION_DENIED_PENDING_APPROVAL,
  ERROR_CODE_USER_PENDING_APPROVAL,
  ERROR_CODE_PERMISSION_DENIED_INITIATE_TRANSACTIONS,
  ERROR_CODE_PERMISSION_DENIED_READ,
] as const;
