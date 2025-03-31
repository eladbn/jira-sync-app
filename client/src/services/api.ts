 
// client/src/services/api.ts
import axios from 'axios';
import { Issue } from '../types/issue';
import { AppConfig, JiraConfig, FieldMapping } from '../types/config';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Get paginated issues with search and filters
 */
export const getIssues = async (
  search: string = '',
  page: number = 1,
  limit: number = 20,
  filters: Record<string, string> = {}
): Promise<{ issues: Issue[], total: number }> => {
  const params = new URLSearchParams();
  
  if (search) params.append('search', search);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  
  const response = await api.get(`/issues?${params.toString()}`);
  return response.data;
};

/**
 * Get issue by id or key
 */
export const getIssueById = async (idOrKey: string): Promise<Issue> => {
  const response = await api.get(`/issues/${idOrKey}`);
  return response.data;
};

/**
 * Sync issues from Jira
 */
export const syncIssues = async (): Promise<{ total: number; added: number; updated: number }> => {
  const response = await api.post('/issues/sync');
  return response.data;
};

/**
 * Get application configuration
 */
export const getConfig = async (): Promise<AppConfig> => {
  const response = await api.get('/config');
  return response.data;
};

/**
 * Update Jira configuration
 */
export const updateJiraConfig = async (config: JiraConfig): Promise<{ success: boolean }> => {
  const response = await api.put('/config/jira', config);
  return response.data;
};

/**
 * Update field mappings
 */
export const updateFieldMappings = async (
  mappings: FieldMapping[]
): Promise<{ success: boolean }> => {
  const response = await api.put('/config/field-mappings', mappings);
  return response.data;
};

/**
 * Update sync interval
 */
export const updateSyncInterval = async (
  interval: number
): Promise<{ success: boolean }> => {
  const response = await api.put('/config/sync-interval', { interval });
  return response.data;
};

/**
 * Get Jira field metadata
 */
export const getJiraFields = async (): Promise<any[]> => {
  const response = await api.get('/config/jira-fields');
  return response.data;
};

/**
 * Test Jira connection
 */
export const testJiraConnection = async (): Promise<{ success: boolean }> => {
  const response = await api.post('/config/test-connection');
  return response.data;
};