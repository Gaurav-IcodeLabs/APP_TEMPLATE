import { ERROR_CODES } from '../../constants';
import { UUID } from '../common/types';

// Error code type
export type ErrorCode = typeof ERROR_CODES[number];

// API error
export interface ApiError {
  id: UUID;
  status: number;
  code: ErrorCode;
  title: string;
  meta?: any;
}

export interface AssetDeliveryApiError {
  code: ErrorCode;
  id: string;
  status: number;
  title: string;
}

// Storable error prop type. (Error object should not be stored as it is.)
export interface StorableError {
  type: 'error';
  name: string;
  message?: string;
  status?: number;
  statusText?: string;
  apiErrors?: (ApiError | AssetDeliveryApiError)[];
}
