// Pagination information in the response meta
export interface Pagination {
  page: number;
  perPage: number;
  totalItems?: number;
  totalPages?: number;
}
