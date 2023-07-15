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

export interface Settings {
  createdAt: Date | string | number;
  updatedAt: Date | string | number;
  isMaintenance: boolean;
  workingOn: string[];
}

export const APICache =
  'public, max-age=3600, s-maxage=3600, stale-while-revalidate=3600';

export const ghHeader = {
  'Authorization': `token ${process.env.GITHUB_TOKEN}`,
  'X-GitHub-Api-Version': '2022-11-28',
};
