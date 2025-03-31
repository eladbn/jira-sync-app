 
// server/src/services/jira-service.ts
import axios, { AxiosInstance } from 'axios';
import { JiraIssue, JiraConfig } from '../types/jira';
import { getConfig, saveIssue, saveConfig } from '../db';

class JiraService {
  private client: AxiosInstance | null = null;
  private config: JiraConfig | null = null;

  /**
   * Initialize the Jira API client
   */
  async initialize(): Promise<void> {
    this.config = await getConfig('jira');
    
    if (!this.config) {
      console.log('Jira configuration not found');
      return;
    }

    this.client = axios.create({
      baseURL: `${this.config.baseUrl}/rest/api/3`,
      auth: {
        username: this.config.email,
        password: this.config.apiToken
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Check if the Jira client is initialized
   */
  isInitialized(): boolean {
    return !!this.client && !!this.config;
  }

  /**
   * Update Jira configuration
   */
  async updateConfig(config: JiraConfig): Promise<void> {
    await saveConfig('jira', config);
    this.config = config;
    
    this.client = axios.create({
      baseURL: `${config.baseUrl}/rest/api/3`,
      auth: {
        username: config.email,
        password: config.apiToken
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Test Jira connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.isInitialized()) {
      throw new Error('Jira client not initialized');
    }

    try {
      const response = await this.client!.get('/myself');
      return response.status === 200;
    } catch (error) {
      console.error('Error testing Jira connection:', error);
      return false;
    }
  }

  /**
   * Fetch issues from Jira based on JQL query
   */
  async fetchIssues(jql?: string): Promise<JiraIssue[]> {
    if (!this.isInitialized()) {
      throw new Error('Jira client not initialized');
    }

    try {
      const queryJql = jql || this.config!.jqlQuery || 'project = ' + this.config!.projectKey;
      
      const response = await this.client!.post('/search', {
        jql: queryJql,
        maxResults: 100,
        fields: [
          'summary',
          'description',
          'status',
          'issuetype',
          'priority',
          'assignee',
          'reporter',
          'created',
          'updated',
          'components',
          'labels',
          '*all'
        ]
      });

      const issues = response.data.issues.map(this.mapJiraIssue);
      return issues;
    } catch (error) {
      console.error('Error fetching issues from Jira:', error);
      throw error;
    }
  }

  /**
   * Sync issues from Jira to local database
   */
  async syncIssues(): Promise<{ total: number; added: number; updated: number }> {
    if (!this.isInitialized()) {
      throw new Error('Jira client not initialized');
    }

    try {
      const issues = await this.fetchIssues();
      let added = 0;
      let updated = 0;

      for (const issue of issues) {
        await saveIssue(issue);
        updated++;
      }

      // Update last sync time
      const lastSyncTime = new Date().toISOString();
      await saveConfig('lastSyncTime', lastSyncTime);

      return {
        total: issues.length,
        added,
        updated
      };
    } catch (error) {
      console.error('Error syncing issues:', error);
      throw error;
    }
  }

  /**
   * Map Jira issue to application format
   */
  private mapJiraIssue = (jiraIssue: any): JiraIssue => {
    const fields = jiraIssue.fields;
    
    return {
      id: jiraIssue.id,
      key: jiraIssue.key,
      summary: fields.summary || '',
      description: fields.description?.content?.[0]?.content?.[0]?.text || '',
      status: fields.status?.name || '',
      issueType: fields.issuetype?.name || '',
      priority: fields.priority?.name || '',
      assignee: fields.assignee?.displayName || '',
      reporter: fields.reporter?.displayName || '',
      created: fields.created || '',
      updated: fields.updated || '',
      components: (fields.components || []).map((c: any) => c.name),
      labels: fields.labels || [],
      // Store all other fields in the raw object
      ...Object.entries(fields)
        .filter(([key]) => !['summary', 'description', 'status', 'issuetype', 
          'priority', 'assignee', 'reporter', 'created', 
          'updated', 'components', 'labels'].includes(key))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, any>)
    };
  };

  /**
   * Get field metadata from Jira
   */
  async getFieldMetadata(): Promise<any[]> {
    if (!this.isInitialized()) {
      throw new Error('Jira client not initialized');
    }

    try {
      const response = await this.client!.get('/field');
      return response.data;
    } catch (error) {
      console.error('Error fetching field metadata:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const jiraService = new JiraService();