/**
 * Shared Hook Types
 * 
 * Common TypeScript interfaces and types used across all custom hooks
 * following the three-principle methodology for logic extraction.
 * 
 * Design Consistency: Maintains RK Institute professional standards
 */

// Base API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
  error?: string;
}

// Base Hook State Types
export interface BaseHookState<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

// Authentication Types
export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  name: string;
}

// API Hook Configuration
export interface ApiHookConfig {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  dependencies?: any[];
  autoFetch?: boolean;
  requireAuth?: boolean;
}

// Error Types
export interface HookError {
  message: string;
  code?: string;
  details?: any;
}

// Loading States
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Generic Data Fetching Hook Return Type
export interface DataHookReturn<T> {
  data: T | null;
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
  mutate: (newData: T | null) => void;
}

// Form Hook Types
export interface FormHookConfig<T> {
  initialValues: T;
  validationSchema?: any;
  onSubmit: (values: T) => Promise<void>;
}

export interface FormHookReturn<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  handleChange: (field: string, value: any) => void;
  handleBlur: (field: string) => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
}

// Pagination Types
export interface PaginationConfig {
  page: number;
  limit: number;
  total?: number;
}

export interface PaginationHookReturn {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setLimit: (limit: number) => void;
}

// Search and Filter Types
export interface SearchConfig {
  query: string;
  filters: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchHookReturn {
  query: string;
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  setQuery: (query: string) => void;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  setSorting: (field: string, order: 'asc' | 'desc') => void;
}
