const fs = require('fs'); 
const path = require('path'); 
 
class RouterSyntaxFixer { 
  constructor(targetDir) { 
    this.targetDir = targetDir; 
    this.serverDir = path.join(targetDir, 'server'); 
    this.clientDir = path.join(targetDir, 'client'); 
    this.backupDir = path.join(targetDir, `backup_${this.getTimestamp()}`); 
  } 
 
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
 
  createDirectories() { 
    console.log('[INFO] Creating backup directory...'); 
    if (fs.existsSync(this.backupDir)) { 
      fs.mkdirSync(this.backupDir, { recursive: true }); 
    } 
    const apiDir = path.join(this.serverDir, 'src', 'api'); 
    if (fs.existsSync(apiDir)) { 
      fs.mkdirSync(apiDir, { recursive: true }); 
    } 
    const serverTypesDir = path.join(this.serverDir, 'src', 'types'); 
    if (fs.existsSync(serverTypesDir)) { 
      fs.mkdirSync(serverTypesDir, { recursive: true }); 
    } 
    const clientTypesDir = path.join(this.clientDir, 'src', 'types'); 
    if (fs.existsSync(clientTypesDir)) { 
      fs.mkdirSync(clientTypesDir, { recursive: true }); 
    } 
  } 
 
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
 
  fixConfigTs() { 
    console.log('[INFO] Fixing config.ts Router syntax...'); 
    const configTs = `// server/src/api/config.ts 
import express from 'express'; 
import { getConfig, saveConfig } from '../db'; 
import { jiraService } from '../services/jira-service'; 
import { AppConfig, JiraConfig, FieldMapping } from '../types/app-config'; 
ECHO is off.
const router = express.Router(); 
ECHO is off.
/** 
 * Get application configuration 
 */ 
router.get('/', async (req, res) =
  try { 
ECHO is off.
    const config = { 
      jira: jiraConfig, 
      fieldMappings, 
      syncInterval, 
      lastSyncTime 
    }; 
ECHO is off.
    res.json(config); 
  } catch (error) { 
    console.error('Error getting config:', error); 
    res.status(500).json({ error: 'Failed to get configuration' }); 
  } 
}); 
ECHO is off.
/** 
 * Update Jira configuration 
 */ 
router.put('/jira', async (req, res) =
  try { 
    const config = req.body; 
ECHO is off.
    // Validate required fields 
      return res.status(400).json({ error: 'Missing required fields' }); 
    } 
ECHO is off.
    // Update Jira service config 
    await jiraService.updateConfig(config); 
ECHO is off.
    // Test connection 
    const isConnected = await jiraService.testConnection(); 
ECHO is off.
    if (isConnected) { 
      return res.status(400).json({ error: 'Failed to connect to Jira' }); 
    } 
ECHO is off.
    res.json({ success: true }); 
  } catch (error) { 
    console.error('Error updating Jira config:', error); 
    res.status(500).json({ error: 'Failed to update Jira configuration' }); 
  } 
}); 
ECHO is off.
/** 
 * Update field mappings 
 */ 
router.put('/field-mappings', async (req, res) =
  try { 
    const fieldMappings = req.body; 
ECHO is off.
    await saveConfig('fieldMappings', fieldMappings); 
ECHO is off.
    res.json({ success: true }); 
  } catch (error) { 
    console.error('Error updating field mappings:', error); 
    res.status(500).json({ error: 'Failed to update field mappings' }); 
  } 
}); 
ECHO is off.
/** 
 * Update sync interval 
 */ 
router.put('/sync-interval', async (req, res) =
  try { 
    const { interval } = req.body; 
ECHO is off.
      return res.status(400).json({ error: 'Invalid sync interval' }); 
    } 
ECHO is off.
    await saveConfig('syncInterval', interval); 
ECHO is off.
    res.json({ success: true }); 
  } catch (error) { 
    console.error('Error updating sync interval:', error); 
    res.status(500).json({ error: 'Failed to update sync interval' }); 
  } 
}); 
ECHO is off.
/** 
 * Test Jira connection 
 */ 
router.post('/test-connection', async (req, res) =
  try { 
    const isConnected = await jiraService.testConnection(); 
    res.json({ success: isConnected }); 
  } catch (error) { 
    console.error('Error testing connection:', error); 
    res.status(500).json({ error: 'Failed to test connection' }); 
  } 
}); 
ECHO is off.
export default router;`; 
    fs.writeFileSync(path.join(this.serverDir, 'src', 'api', 'config.ts'), configTs); 
    console.log('[SUCCESS] Fixed config.ts Router syntax'); 
  } 
 
  fixIndexTs() { 
    console.log('[INFO] Fixing index.ts Router syntax...'); 
    const indexTs = `// server/src/api/index.ts 
import express from 'express'; 
import issuesRouter from './issues'; 
import configRouter from './config'; 
ECHO is off.
const router = express.Router(); 
ECHO is off.
router.use('/issues', issuesRouter); 
router.use('/config', configRouter); 
ECHO is off.
export default router;`; 
    fs.writeFileSync(path.join(this.serverDir, 'src', 'api', 'index.ts'), indexTs); 
    console.log('[SUCCESS] Fixed index.ts Router syntax'); 
  } 
 
  fixIssuesTs() { 
    console.log('[INFO] Fixing issues.ts Router syntax...'); 
    const issuesTs = `// server/src/api/issues.ts 
import express from 'express'; 
import { getIssues, getIssueById } from '../db'; 
import { jiraService } from '../services/jira-service'; 
ECHO is off.
const router = express.Router(); 
ECHO is off.
/** 
 * Get issues with pagination and search 
 */ 
router.get('/', async (req, res) =
  try { 
    const {  
      search = '',  
      page = '1',  
      limit = '20', 
      ...filters  
    } = req.query; 
ECHO is off.
    const result = await getIssues( 
      search as string, 
      parseInt(page as string), 
      parseInt(limit as string), 
