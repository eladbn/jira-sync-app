export interface JiraIssue {
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
    [key: string]: any; // Allow for dynamic fields
  }

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
  jqlQuery?: string; // Optional field
}