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