 
 
// server/src/db/index.ts
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { JiraIssue } from '../types/jira';

let db: Database<sqlite3.Database, sqlite3.Statement>;

/**
 * Initialize the SQLite database connection
 */
export const initializeDatabase = async (): Promise<void> => {
  // Create db directory if it doesn't exist
  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Open database connection
  db = await open({
    filename: path.join(dbDir, 'jira-sync.db'),
    driver: sqlite3.Database
  });

  // Create tables if they don't exist
  await createTables();
  
  console.log('Database initialized successfully');
};

/**
 * Create database tables if they don't exist
 */
const createTables = async (): Promise<void> => {
  // Issues table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE,
      summary TEXT,
      description TEXT,
      status TEXT,
      issue_type TEXT,
      priority TEXT,
      assignee TEXT,
      reporter TEXT,
      created TEXT,
      updated TEXT,
      components TEXT,
      labels TEXT,
      raw_data TEXT,
      last_synced TEXT
    )
  `);

  // Config table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_key TEXT UNIQUE,
      config_value TEXT
    )
  `);
};

/**
 * Save or update a Jira issue in the database
 */
export const saveIssue = async (issue: JiraIssue): Promise<void> => {
  const {
    id,
    key,
    summary,
    description,
    status,
    issueType,
    priority,
    assignee,
    reporter,
    created,
    updated,
    components,
    labels,
    ...rest
  } = issue;

  await db.run(`
    INSERT INTO issues (
      id, key, summary, description, status, issue_type, 
      priority, assignee, reporter, created, updated, 
      components, labels, raw_data, last_synced
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      summary = excluded.summary,
      description = excluded.description,
      status = excluded.status,
      issue_type = excluded.issue_type,
      priority = excluded.priority,
      assignee = excluded.assignee,
      reporter = excluded.reporter,
      updated = excluded.updated,
      components = excluded.components,
      labels = excluded.labels,
      raw_data = excluded.raw_data,
      last_synced = excluded.last_synced
  `, [
    id,
    key,
    summary,
    description,
    status,
    issueType,
    priority,
    assignee,
    reporter,
    created,
    updated,
    JSON.stringify(components),
    JSON.stringify(labels),
    JSON.stringify(rest),
    new Date().toISOString()
  ]);
};

/**
 * Get issues from the database with pagination and search
 */
export const getIssues = async (
  search: string = '',
  page: number = 1,
  limit: number = 20,
  filters: Record<string, string> = {}
): Promise<{ issues: JiraIssue[], total: number }> => {
  let whereClause = '';
  const params: any[] = [];

  // Add search condition if provided
  if (search) {
    whereClause = `WHERE (key LIKE ? OR summary LIKE ? OR description LIKE ?)`;
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  // Add filters if provided
  Object.entries(filters).forEach(([key, value], index) => {
    if (value) {
      whereClause = whereClause 
        ? `${whereClause} AND ${key} = ?` 
        : `WHERE ${key} = ?`;
      params.push(value);
    }
  });

  // Calculate pagination
  const offset = (page - 1) * limit;
  params.push(limit, offset);

  // Get total count
  const countResult = await db.get(
    `SELECT COUNT(*) as count FROM issues ${whereClause}`,
    ...params.slice(0, params.length - 2)
  );
  const total = countResult?.count || 0;

  // Get paginated issues
  const issues = await db.all(
    `SELECT * FROM issues ${whereClause} ORDER BY updated DESC LIMIT ? OFFSET ?`,
    ...params
  );

  // Parse JSON fields
  return {
    issues: issues.map(issue => ({
      ...issue,
      components: JSON.parse(issue.components || '[]'),
      labels: JSON.parse(issue.labels || '[]'),
      ...(issue.raw_data ? JSON.parse(issue.raw_data) : {})
    })),
    total
  };
};

/**
 * Get an issue by id or key
 */
export const getIssueById = async (idOrKey: string): Promise<JiraIssue | null> => {
  const issue = await db.get(
    `SELECT * FROM issues WHERE id = ? OR key = ?`,
    idOrKey, idOrKey
  );

  if (!issue) return null;

  return {
    ...issue,
    components: JSON.parse(issue.components || '[]'),
    labels: JSON.parse(issue.labels || '[]'),
    ...(issue.raw_data ? JSON.parse(issue.raw_data) : {})
  };
};

/**
 * Save or update application configuration
 */
export const saveConfig = async (key: string, value: any): Promise<void> => {
  await db.run(
    `INSERT INTO config (config_key, config_value) 
     VALUES (?, ?) 
     ON CONFLICT(config_key) DO UPDATE SET 
     config_value = excluded.config_value`,
    key, 
    typeof value === 'object' ? JSON.stringify(value) : value
  );
};

/**
 * Get application configuration
 */
export const getConfig = async (key: string): Promise<any> => {
  const result = await db.get(
    `SELECT config_value FROM config WHERE config_key = ?`,
    key
  );

  if (!result) return null;

  try {
    return JSON.parse(result.config_value);
  } catch {
    return result.config_value;
  }
};

/**
 * Get database instance
 */
export const getDb = (): Database<sqlite3.Database, sqlite3.Statement> => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};