import { StorableError } from '../types/auth';

interface ErrorWithStatus {
  name?: string;
  message?: string;
  status?: number;
  statusText?: string;
  data?: {
    errors?: any[];
  };
}

const responseAPIErrors = (error: any) => {
  return error && error.data && error.data.errors ? error.data.errors : [];
};

export const storableError = (err: ErrorWithStatus | any): StorableError => {
  const error = err || {};
  const { name, message, status, statusText } = error;
  // Status, statusText, and data.errors are (possibly) added to the error object by SDK
  const apiErrors = responseAPIErrors(error);

  // Returned object is the same as prop type check in util/types -> error
  return {
    type: 'error',
    name,
    message,
    status,
    statusText,
    apiErrors,
  };
};