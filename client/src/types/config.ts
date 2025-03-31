 
// client/src/types/config.ts
export interface JiraConfig {
    baseUrl: string;
    apiToken: string;
    email: string;
    projectKey: string;
    jqlQuery: string;
  }
  
  export interface FieldMapping {
    originalName: string;
    displayName: string;
    visible: boolean;
  }
  
  export interface AppConfig {
    jira: JiraConfig;
    fieldMappings: FieldMapping[];
    syncInterval: number; // in minutes
    lastSyncTime?: string;
  }
  
  // client/src/types/issue.ts
  export interface Issue {
    id: string;
    key: string;
    summary: string;
    description: string;
    status: string;
    issueType: string;
    priority: string;
    assignee: string;
    reporter: string;
    created: string;
    updated: string;
    components: string[];
    labels: string[];
    [key: string]: any; // For dynamic fields
  }
  
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
  
  // client/src/types/ui.ts
  export interface NotificationState {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }
  
  export interface LoadingState {
    isLoading: boolean;
    message?: string;
  }
  
  export interface TableColumn {
    id: string;
    label: string;
    visible: boolean;
    sortable?: boolean;
    width?: string;
    formatter?: (value: any, row: any) => React.ReactNode;
  }