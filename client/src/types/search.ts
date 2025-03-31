 
// client/src/types/search.ts
export interface SearchParams {
    query: string;
    page: number;
    pageSize: number;
    filters: Record<string, string>;
  }
  
  export interface PaginationState {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  }