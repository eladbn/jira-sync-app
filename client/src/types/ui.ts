// client/src/types/ui.ts
export interface TableColumn {
    id: string;
    label: string;
    visible: boolean;
    sortable?: boolean;
    width?: string;
    formatter?: (value: any, row: any) => React.ReactNode;
  }
  
  export interface PaginationState {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  }
  
  export interface NotificationState {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }
  
  export interface LoadingState {
    isLoading: boolean;
    message?: string;
  }