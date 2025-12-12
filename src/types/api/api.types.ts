/**
 * Sharetribe API Response TypeScript Definitions
 * Based on Sharetribe SDK documentation
 */

/**
 * Base resource types in Sharetribe
 */
export type ResourceType =
  | 'listing'
  | 'user'
  | 'transaction'
  | 'booking'
  | 'image'
  | 'review'
  | 'message'
  | 'stripeAccount'
  | 'stripeCustomer'
  | 'stockAdjustment'
  | 'stockReservation'
  | 'availabilityException'
  | 'jsonAsset'
  | string; // Allow custom resource types

/**
 * Base resource structure (JSON:API format)
 */
export interface Resource<TType extends string = string, TAttributes = any> {
  id: string;
  type: TType;
  attributes?: TAttributes;
  relationships?: {
    [key: string]: {
      data: ResourceIdentifier | ResourceIdentifier[] | null;
    };
  };
}

/**
 * Resource identifier (for relationships)
 */
export interface ResourceIdentifier {
  id: string;
  type: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Generic metadata structure
 */
export interface ApiMeta {
  page?: number;
  perPage?: number;
  totalItems?: number;
  totalPages?: number;
  version?: string;
  [key: string]: any; // Allow additional meta fields
}

/**
 * API error details
 */
export interface ApiErrorDetail {
  status: number;
  code: string;
  title: string;
  meta?: Record<string, any>;
  details?: Record<string, any>; // Not part of public API, for debugging only
}

/**
 * API error data structure
 */
export interface ApiErrorData {
  errors: ApiErrorDetail[];
}

/**
 * Base API response structure
 */
export interface BaseApiResponse<TStatus extends number = number> {
  name: string;
  message: string;
  status: TStatus;
  statusText: string;
}

/**
 * Success response data structure (JSON:API format)
 */
export interface SuccessResponseData<TResource = any> {
  data: TResource | TResource[];
  meta?: ApiMeta;
  included?: Resource[];
}

/**
 * Marketplace API success response
 */
export interface MarketplaceApiSuccessResponse<TResource = any>
  extends BaseApiResponse<200> {
  data: SuccessResponseData<TResource>;
}

/**
 * API error response
 */
export interface ApiErrorResponse
  extends BaseApiResponse<400 | 401 | 403 | 404 | 409 | 500 | 503> {
  data: ApiErrorData;
}

// create StorableError type
export interface StorableError
  extends BaseApiResponse<400 | 401 | 403 | 404 | 409 | 429 | 500 | 503> {
  type: 'error';
  name: string;
  message: string;
  apiErrors: ApiErrorDetail[];
}

/**
 * Generic API response (success or error)
 */
export type ApiResponse<TResource = any> =
  | MarketplaceApiSuccessResponse<TResource>
  | ApiErrorResponse;

/**
 * Type guard to check if response is successful
 */
export const isSuccessResponse = <TResource = any>(
  response: ApiResponse<TResource>,
): response is MarketplaceApiSuccessResponse<TResource> => {
  return response.status === 200;
};

/**
 * Type guard to check if response is an error
 */
export const isErrorResponse = (
  response: ApiResponse,
): response is ApiErrorResponse => {
  return response.status >= 400;
};
