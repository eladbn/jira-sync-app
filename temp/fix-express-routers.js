/**
 * Express Router Syntax Fixer
 * 
 * This module implements a comprehensive solution for fixing common syntax 
 * errors in Express router implementations within a TypeScript environment.
 * It follows a clean architecture approach with proper separation of concerns.
 */

const fs = require('fs');
const path = require('path');

/**
 * RouterSyntaxFixer implements the core architecture for fixing Express Router 
 * syntax issues in TypeScript files.
 */
class RouterSyntaxFixer {
  /**
   * Initialize the fixer with the target project directory
   * @param {string} targetDir - The project root directory
   */
  constructor(targetDir) {
    this.targetDir = targetDir;
    this.serverDir = path.join(targetDir, 'server');
    this.clientDir = path.join(targetDir, 'client');
    this.backupDir = path.join(targetDir, `backup_${this.getTimestamp()}`);
  }

  /**
   * Generate a timestamp string for backup directory naming
   * @returns {string} A formatted timestamp (YYYYMMDD_HHMMSS)
   */
  getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  /**
   * Create all necessary directories for the operation
   */
  createDirectories() {
    console.log('[INFO] Creating backup directory...');
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Ensure server/src/api directory exists
    const apiDir = path.join(this.serverDir, 'src', 'api');
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }

    // Ensure server/src/types directory exists
    const serverTypesDir = path.join(this.serverDir, 'src', 'types');
    if (!fs.existsSync(serverTypesDir)) {
      fs.mkdirSync(serverTypesDir, { recursive: true });
    }

    // Ensure client/src/types directory exists
    const clientTypesDir = path.join(this.clientDir, 'src', 'types');
    if (!fs.existsSync(clientTypesDir)) {
      fs.mkdirSync(clientTypesDir, { recursive: true });
    }
  }

  /**
   * Backup original files before modification
   */
  backupFiles() {
    console.log('[INFO] Backing up original files...');
    const filesToBackup = [
      { src: path.join(this.serverDir, 'src', 'api', 'config.ts'), dest: path.join(this.backupDir, 'config.ts') },
      { src: path.join(this.serverDir, 'src', 'api', 'index.ts'), dest: path.join(this.backupDir, 'index.ts') },
      { src: path.join(this.serverDir, 'src', 'api', 'issues.ts'), dest: path.join(this.backupDir, 'issues.ts') },
      { src: path.join(this.clientDir, 'tsconfig.json'), dest: path.join(this.backupDir, 'tsconfig.json') },
      { src: path.join(this.clientDir, 'src', 'types', 'ui.ts'), dest: path.join(this.backupDir, 'ui.ts') },
      { src: path.join(this.serverDir, 'src', 'types', 'app-config.ts'), dest: path.join(this.backupDir, 'app-config.ts') }
    ];

    for (const file of filesToBackup) {
      if (fs.existsSync(file.src)) {
        fs.copyFileSync(file.src, file.dest);
        console.log(`[INFO] Backed up: ${file.src} → ${file.dest}`);
      }
    }
  }

  /**
   * Fix Express Router syntax in config.ts
   */
  fixConfigTs() {
    console.log('[INFO] Fixing config.ts Router syntax...');
    const configTs = `// server/src/api/config.ts
import express from 'express';
import { getConfig, saveConfig } from '../db';
import { jiraService } from '../services/jira-service';
import { AppConfig, JiraConfig, FieldMapping } from '../types/app-config';

const router = express.Router();

/**
 * Get application configuration
 */
router.get('/', async (req, res) => {
  try {
    const jiraConfig = await getConfig('jira') || {};
    const fieldMappings = await getConfig('fieldMappings') || [];
    const syncInterval = await getConfig('syncInterval') || 60;
    const lastSyncTime = await getConfig('lastSyncTime') || null;

    const config = {
      jira: jiraConfig,
      fieldMappings,
      syncInterval,
      lastSyncTime
    };

    res.json(config);
  } catch (error) {
    console.error('Error getting config:', error);
    res.status(500).json({ error: 'Failed to get configuration' });
  }
});

/**
 * Update Jira configuration
 */
router.put('/jira', async (req, res) => {
  try {
    const config = req.body;
    
    // Validate required fields
    if (!config.baseUrl || !config.apiToken || !config.email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update Jira service config
    await jiraService.updateConfig(config);
    
    // Test connection
    const isConnected = await jiraService.testConnection();
    
    if (!isConnected) {
      return res.status(400).json({ error: 'Failed to connect to Jira' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating Jira config:', error);
    res.status(500).json({ error: 'Failed to update Jira configuration' });
  }
});

/**
 * Update field mappings
 */
router.put('/field-mappings', async (req, res) => {
  try {
    const fieldMappings = req.body;
    
    await saveConfig('fieldMappings', fieldMappings);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating field mappings:', error);
    res.status(500).json({ error: 'Failed to update field mappings' });
  }
});

/**
 * Update sync interval
 */
router.put('/sync-interval', async (req, res) => {
  try {
    const { interval } = req.body;
    
    if (typeof interval !== 'number' || interval < 1) {
      return res.status(400).json({ error: 'Invalid sync interval' });
    }
    
    await saveConfig('syncInterval', interval);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating sync interval:', error);
    res.status(500).json({ error: 'Failed to update sync interval' });
  }
});

/**
 * Test Jira connection
 */
router.post('/test-connection', async (req, res) => {
  try {
    const isConnected = await jiraService.testConnection();
    res.json({ success: isConnected });
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ error: 'Failed to test connection' });
  }
});

export default router;`;

    fs.writeFileSync(path.join(this.serverDir, 'src', 'api', 'config.ts'), configTs);
    console.log('[SUCCESS] Fixed config.ts Router syntax');
  }

  /**
   * Fix Express Router syntax in index.ts
   */
  fixIndexTs() {
    console.log('[INFO] Fixing index.ts Router syntax...');
    const indexTs = `// server/src/api/index.ts
import express from 'express';
import issuesRouter from './issues';
import configRouter from './config';

const router = express.Router();

router.use('/issues', issuesRouter);
router.use('/config', configRouter);

export default router;`;

    fs.writeFileSync(path.join(this.serverDir, 'src', 'api', 'index.ts'), indexTs);
    console.log('[SUCCESS] Fixed index.ts Router syntax');
  }

  /**
   * Fix Express Router syntax in issues.ts
   */
  fixIssuesTs() {
    console.log('[INFO] Fixing issues.ts Router syntax...');
    const issuesTs = `// server/src/api/issues.ts
import express from 'express';
import { getIssues, getIssueById } from '../db';
import { jiraService } from '../services/jira-service';

const router = express.Router();

/**
 * Get issues with pagination and search
 */
router.get('/', async (req, res) => {
  try {
    const { 
      search = '', 
      page = '1', 
      limit = '20',
      ...filters 
    } = req.query;

    const result = await getIssues(
      search as string,
      parseInt(page as string),
      parseInt(limit as string),
      filters as Record<string, string>
    );

    res.json(result);
  } catch (error) {
    console.error('Error getting issues:', error);
    res.status(500).json({ error: 'Failed to get issues' });
  }
});

/**
 * Get issue by id or key
 */
router.get('/:idOrKey', async (req, res) => {
  try {
    const issue = await getIssueById(req.params.idOrKey);
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    res.json(issue);
  } catch (error) {
    console.error('Error getting issue:', error);
    res.status(500).json({ error: 'Failed to get issue' });
  }
});

/**
 * Sync issues from Jira
 */
router.post('/sync', async (req, res) => {
  try {
    const result = await jiraService.syncIssues();
    res.json(result);
  } catch (error) {
    console.error('Error syncing issues:', error);
    res.status(500).json({ error: 'Failed to sync issues' });
  }
});

export default router;`;

    fs.writeFileSync(path.join(this.serverDir, 'src', 'api', 'issues.ts'), issuesTs);
    console.log('[SUCCESS] Fixed issues.ts Router syntax');
  }

  /**
   * Update TypeScript configuration for proper JSX support
   */
  updateTsConfig() {
    console.log('[INFO] Updating TypeScript configuration...');
    const tsConfig = {
      compilerOptions: {
        target: "es2016",
        lib: [
          "dom",
          "dom.iterable",
          "esnext"
        ],
        jsx: "react-jsx",
        module: "esnext",
        moduleResolution: "node",
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        allowJs: true,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noFallthroughCasesInSwitch: true
      },
      include: [
        "src"
      ]
    };

    fs.writeFileSync(
      path.join(this.clientDir, 'tsconfig.json'), 
      JSON.stringify(tsConfig, null, 2)
    );
    console.log('[SUCCESS] Updated client tsconfig.json');
  }

  /**
   * Add UI type definitions with PaginationState interface
   */
  addUiTypes() {
    console.log('[INFO] Adding UI type definitions...');
    const uiTypes = `// client/src/types/ui.ts
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
}`;

    fs.writeFileSync(path.join(this.clientDir, 'src', 'types', 'ui.ts'), uiTypes);
    console.log('[SUCCESS] Added UI type definitions');
  }

  /**
   * Add app-config type definitions for server
   */
  addAppConfigTypes() {
    console.log('[INFO] Adding app-config type definitions...');
    const appConfigTypes = `// server/src/types/app-config.ts
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
}`;

    fs.writeFileSync(path.join(this.serverDir, 'src', 'types', 'app-config.ts'), appConfigTypes);
    console.log('[SUCCESS] Added app-config type definitions');
  }

  /**
   * Execute all fixes in a properly sequenced implementation
   */
  applyAllFixes() {
    try {
      this.createDirectories();
      this.backupFiles();
      this.fixConfigTs();
      this.fixIndexTs();
      this.fixIssuesTs();
      this.updateTsConfig();
      this.addUiTypes();
      this.addAppConfigTypes();
      
      console.log('\n[SUCCESS] All fixes have been applied successfully!');
      console.log('[INFO] Please restart your development server.');
      console.log(`[INFO] Original files backed up to: ${this.backupDir}`);
    } catch (error) {
      console.error('[ERROR] Failed to apply fixes:', error);
      console.error(error.stack);
    }
  }
}

/**
 * Helper method to check if a file exists and create it if needed
 * @param {string} filePath - Path to the file
 * @param {string} content - Content to write if file doesn't exist
 */
function ensureFileExists(filePath, content) {
  if (!fs.existsSync(filePath)) {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, content);
  }
}

// Execute the fixer if run directly
if (require.main === module) {
  const projectRoot = process.cwd();
  console.log(`[INFO] Starting Express Router syntax fix in directory: ${projectRoot}`);
  
  const fixer = new RouterSyntaxFixer(projectRoot);
  fixer.applyAllFixes();
}

module.exports = RouterSyntaxFixer;