/**
 * Common API types shared between success and error responses
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
 * Base API response structure
 */
export interface BaseApiResponse<TStatus extends number = number> {
  status: TStatus;
  statusText: string;
}
