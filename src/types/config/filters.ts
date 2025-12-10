import { ReactNode } from 'react';

// Search filter definition
export interface FilterConfig {
  id: string;
  label?: ReactNode;
  type: string;
  group: 'primary' | 'secondary';
  queryParamNames: string[];
  config?: any;
}

// Default search filters definition
export interface DefaultFiltersConfig {
  key: string;
  schemaType: 'price' | 'text' | 'dates';
  min?: number;
  max?: number;
  step?: number;
}
