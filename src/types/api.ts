export interface APIResponse<T = undefined> {
  status: number;
  timestamp: number;
  data?: T;
  error?: {
    message: string;
    cause?: string;
    stack?: string;
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    perPage: number;
    start: number;
    end: number;
    isNextPage: boolean;
    isPrevPage: boolean;
  };
}

export const APICache =
  'public, max-age=3600, s-maxage=3600, stale-while-revalidate=3600';
