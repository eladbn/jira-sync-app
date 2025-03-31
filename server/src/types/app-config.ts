 
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