@echo off
setlocal enabledelayedexpansion

echo [INFO] Jira Sync App - Express Router Syntax Fixer
echo [INFO] ==========================================
echo.

:: Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is required but not found in PATH
    echo [INFO] Please install Node.js and try again
    exit /b 1
)

:: Create the TypeScript syntax fixer script
echo [INFO] Creating Express Router syntax fixer script...
set SCRIPT_PATH=fix-express-routers.js

call :createFixerScript "%SCRIPT_PATH%"

echo [INFO] Executing TypeScript syntax fixer...
node "%SCRIPT_PATH%"

:: Clean up the script file if successful
if %ERRORLEVEL% EQU 0 (
    del "%SCRIPT_PATH%"
    echo [INFO] Temporary files cleaned up
    echo [SUCCESS] Configuration fixes completed successfully!
) else (
    echo [ERROR] Syntax fixer encountered an error
    echo [INFO] Check the script file: %SCRIPT_PATH%
)

echo.
echo [INFO] Next steps:
echo [INFO] 1. Restart your development server: npm run start
echo [INFO] 2. Clear any browser caches
echo [INFO] 3. Verify all errors are resolved

exit /b 0

:createFixerScript
echo const fs = require('fs'); > %1
echo const path = require('path'); >> %1
echo. >> %1
echo class RouterSyntaxFixer { >> %1
echo   constructor(targetDir) { >> %1
echo     this.targetDir = targetDir; >> %1
echo     this.serverDir = path.join(targetDir, 'server'); >> %1
echo     this.clientDir = path.join(targetDir, 'client'); >> %1
echo     this.backupDir = path.join(targetDir, `backup_${this.getTimestamp()}`); >> %1
echo   } >> %1
echo. >> %1
echo   getTimestamp() { >> %1
echo     const now = new Date(); >> %1
echo     const year = now.getFullYear(); >> %1
echo     const month = String(now.getMonth() + 1).padStart(2, '0'); >> %1
echo     const day = String(now.getDate()).padStart(2, '0'); >> %1
echo     const hours = String(now.getHours()).padStart(2, '0'); >> %1
echo     const minutes = String(now.getMinutes()).padStart(2, '0'); >> %1
echo     const seconds = String(now.getSeconds()).padStart(2, '0'); >> %1
echo     return `${year}${month}${day}_${hours}${minutes}${seconds}`; >> %1
echo   } >> %1
echo. >> %1
echo   createDirectories() { >> %1
echo     console.log('[INFO] Creating backup directory...'); >> %1
echo     if (!fs.existsSync(this.backupDir)) { >> %1
echo       fs.mkdirSync(this.backupDir, { recursive: true }); >> %1
echo     } >> %1
echo     const apiDir = path.join(this.serverDir, 'src', 'api'); >> %1
echo     if (!fs.existsSync(apiDir)) { >> %1
echo       fs.mkdirSync(apiDir, { recursive: true }); >> %1
echo     } >> %1
echo     const serverTypesDir = path.join(this.serverDir, 'src', 'types'); >> %1
echo     if (!fs.existsSync(serverTypesDir)) { >> %1
echo       fs.mkdirSync(serverTypesDir, { recursive: true }); >> %1
echo     } >> %1
echo     const clientTypesDir = path.join(this.clientDir, 'src', 'types'); >> %1
echo     if (!fs.existsSync(clientTypesDir)) { >> %1
echo       fs.mkdirSync(clientTypesDir, { recursive: true }); >> %1
echo     } >> %1
echo   } >> %1
echo. >> %1
echo   backupFiles() { >> %1
echo     console.log('[INFO] Backing up original files...'); >> %1
echo     const filesToBackup = [ >> %1
echo       { src: path.join(this.serverDir, 'src', 'api', 'config.ts'), dest: path.join(this.backupDir, 'config.ts') }, >> %1
echo       { src: path.join(this.serverDir, 'src', 'api', 'index.ts'), dest: path.join(this.backupDir, 'index.ts') }, >> %1
echo       { src: path.join(this.serverDir, 'src', 'api', 'issues.ts'), dest: path.join(this.backupDir, 'issues.ts') }, >> %1
echo       { src: path.join(this.clientDir, 'tsconfig.json'), dest: path.join(this.backupDir, 'tsconfig.json') }, >> %1
echo       { src: path.join(this.clientDir, 'src', 'types', 'ui.ts'), dest: path.join(this.backupDir, 'ui.ts') }, >> %1
echo       { src: path.join(this.serverDir, 'src', 'types', 'app-config.ts'), dest: path.join(this.backupDir, 'app-config.ts') } >> %1
echo     ]; >> %1
echo     for (const file of filesToBackup) { >> %1
echo       if (fs.existsSync(file.src)) { >> %1
echo         fs.copyFileSync(file.src, file.dest); >> %1
echo         console.log(`[INFO] Backed up: ${file.src} → ${file.dest}`); >> %1
echo       } >> %1
echo     } >> %1
echo   } >> %1
echo. >> %1
echo   fixConfigTs() { >> %1
echo     console.log('[INFO] Fixing config.ts Router syntax...'); >> %1
echo     const configTs = `// server/src/api/config.ts >> %1
echo import express from 'express'; >> %1
echo import { getConfig, saveConfig } from '../db'; >> %1
echo import { jiraService } from '../services/jira-service'; >> %1
echo import { AppConfig, JiraConfig, FieldMapping } from '../types/app-config'; >> %1
echo >> %1
echo const router = express.Router(); >> %1
echo >> %1
echo /** >> %1
echo  * Get application configuration >> %1
echo  */ >> %1
echo router.get('/', async (req, res) => { >> %1
echo   try { >> %1
echo     const jiraConfig = await getConfig('jira') || {}; >> %1
echo     const fieldMappings = await getConfig('fieldMappings') || []; >> %1
echo     const syncInterval = await getConfig('syncInterval') || 60; >> %1
echo     const lastSyncTime = await getConfig('lastSyncTime') || null; >> %1
echo >> %1
echo     const config = { >> %1
echo       jira: jiraConfig, >> %1
echo       fieldMappings, >> %1
echo       syncInterval, >> %1
echo       lastSyncTime >> %1
echo     }; >> %1
echo >> %1
echo     res.json(config); >> %1
echo   } catch (error) { >> %1
echo     console.error('Error getting config:', error); >> %1
echo     res.status(500).json({ error: 'Failed to get configuration' }); >> %1
echo   } >> %1
echo }); >> %1
echo >> %1
echo /** >> %1
echo  * Update Jira configuration >> %1
echo  */ >> %1
echo router.put('/jira', async (req, res) => { >> %1
echo   try { >> %1
echo     const config = req.body; >> %1
echo     >> %1
echo     // Validate required fields >> %1
echo     if (!config.baseUrl || !config.apiToken || !config.email) { >> %1
echo       return res.status(400).json({ error: 'Missing required fields' }); >> %1
echo     } >> %1
echo >> %1
echo     // Update Jira service config >> %1
echo     await jiraService.updateConfig(config); >> %1
echo     >> %1
echo     // Test connection >> %1
echo     const isConnected = await jiraService.testConnection(); >> %1
echo     >> %1
echo     if (!isConnected) { >> %1
echo       return res.status(400).json({ error: 'Failed to connect to Jira' }); >> %1
echo     } >> %1
echo >> %1
echo     res.json({ success: true }); >> %1
echo   } catch (error) { >> %1
echo     console.error('Error updating Jira config:', error); >> %1
echo     res.status(500).json({ error: 'Failed to update Jira configuration' }); >> %1
echo   } >> %1
echo }); >> %1
echo >> %1
echo /** >> %1
echo  * Update field mappings >> %1
echo  */ >> %1
echo router.put('/field-mappings', async (req, res) => { >> %1
echo   try { >> %1
echo     const fieldMappings = req.body; >> %1
echo     >> %1
echo     await saveConfig('fieldMappings', fieldMappings); >> %1
echo     >> %1
echo     res.json({ success: true }); >> %1
echo   } catch (error) { >> %1
echo     console.error('Error updating field mappings:', error); >> %1
echo     res.status(500).json({ error: 'Failed to update field mappings' }); >> %1
echo   } >> %1
echo }); >> %1
echo >> %1
echo /** >> %1
echo  * Update sync interval >> %1
echo  */ >> %1
echo router.put('/sync-interval', async (req, res) => { >> %1
echo   try { >> %1
echo     const { interval } = req.body; >> %1
echo     >> %1
echo     if (typeof interval !== 'number' || interval < 1) { >> %1
echo       return res.status(400).json({ error: 'Invalid sync interval' }); >> %1
echo     } >> %1
echo     >> %1
echo     await saveConfig('syncInterval', interval); >> %1
echo     >> %1
echo     res.json({ success: true }); >> %1
echo   } catch (error) { >> %1
echo     console.error('Error updating sync interval:', error); >> %1
echo     res.status(500).json({ error: 'Failed to update sync interval' }); >> %1
echo   } >> %1
echo }); >> %1
echo >> %1
echo /** >> %1
echo  * Test Jira connection >> %1
echo  */ >> %1
echo router.post('/test-connection', async (req, res) => { >> %1
echo   try { >> %1
echo     const isConnected = await jiraService.testConnection(); >> %1
echo     res.json({ success: isConnected }); >> %1
echo   } catch (error) { >> %1
echo     console.error('Error testing connection:', error); >> %1
echo     res.status(500).json({ error: 'Failed to test connection' }); >> %1
echo   } >> %1
echo }); >> %1
echo >> %1
echo export default router;`; >> %1
echo     fs.writeFileSync(path.join(this.serverDir, 'src', 'api', 'config.ts'), configTs); >> %1
echo     console.log('[SUCCESS] Fixed config.ts Router syntax'); >> %1
echo   } >> %1
echo. >> %1
echo   fixIndexTs() { >> %1
echo     console.log('[INFO] Fixing index.ts Router syntax...'); >> %1
echo     const indexTs = `// server/src/api/index.ts >> %1
echo import express from 'express'; >> %1
echo import issuesRouter from './issues'; >> %1
echo import configRouter from './config'; >> %1
echo >> %1
echo const router = express.Router(); >> %1
echo >> %1
echo router.use('/issues', issuesRouter); >> %1
echo router.use('/config', configRouter); >> %1
echo >> %1
echo export default router;`; >> %1
echo     fs.writeFileSync(path.join(this.serverDir, 'src', 'api', 'index.ts'), indexTs); >> %1
echo     console.log('[SUCCESS] Fixed index.ts Router syntax'); >> %1
echo   } >> %1
echo. >> %1
echo   fixIssuesTs() { >> %1
echo     console.log('[INFO] Fixing issues.ts Router syntax...'); >> %1
echo     const issuesTs = `// server/src/api/issues.ts >> %1
echo import express from 'express'; >> %1
echo import { getIssues, getIssueById } from '../db'; >> %1
echo import { jiraService } from '../services/jira-service'; >> %1
echo >> %1
echo const router = express.Router(); >> %1
echo >> %1
echo /** >> %1
echo  * Get issues with pagination and search >> %1
echo  */ >> %1
echo router.get('/', async (req, res) => { >> %1
echo   try { >> %1
echo     const {  >> %1
echo       search = '',  >> %1
echo       page = '1',  >> %1
echo       limit = '20', >> %1
echo       ...filters  >> %1
echo     } = req.query; >> %1
echo >> %1
echo     const result = await getIssues( >> %1
echo       search as string, >> %1
echo       parseInt(page as string), >> %1
echo       parseInt(limit as string), >> %1
echo       filters as Record<string, string> >> %1
echo     ); >> %1
echo >> %1
echo     res.json(result); >> %1
echo   } catch (error) { >> %1
echo     console.error('Error getting issues:', error); >> %1
echo     res.status(500).json({ error: 'Failed to get issues' }); >> %1
echo   } >> %1
echo }); >> %1
echo >> %1
echo /** >> %1
echo  * Get issue by id or key >> %1
echo  */ >> %1
echo router.get('/:idOrKey', async (req, res) => { >> %1
echo   try { >> %1
echo     const issue = await getIssueById(req.params.idOrKey); >> %1
echo     >> %1
echo     if (!issue) { >> %1
echo       return res.status(404).json({ error: 'Issue not found' }); >> %1
echo     } >> %1
echo     >> %1
echo     res.json(issue); >> %1
echo   } catch (error) { >> %1
echo     console.error('Error getting issue:', error); >> %1
echo     res.status(500).json({ error: 'Failed to get issue' }); >> %1
echo   } >> %1
echo }); >> %1
echo >> %1
echo /** >> %1
echo  * Sync issues from Jira >> %1
echo  */ >> %1
echo router.post('/sync', async (req, res) => { >> %1
echo   try { >> %1
echo     const result = await jiraService.syncIssues(); >> %1
echo     res.json(result); >> %1
echo   } catch (error) { >> %1
echo     console.error('Error syncing issues:', error); >> %1
echo     res.status(500).json({ error: 'Failed to sync issues' }); >> %1
echo   } >> %1
echo }); >> %1
echo >> %1
echo export default router;`; >> %1
echo     fs.writeFileSync(path.join(this.serverDir, 'src', 'api', 'issues.ts'), issuesTs); >> %1
echo     console.log('[SUCCESS] Fixed issues.ts Router syntax'); >> %1
echo   } >> %1
echo. >> %1
echo   updateTsConfig() { >> %1
echo     console.log('[INFO] Updating TypeScript configuration...'); >> %1
echo     const tsConfig = { >> %1
echo       compilerOptions: { >> %1
echo         target: "es2016", >> %1
echo         lib: [ >> %1
echo           "dom", >> %1
echo           "dom.iterable", >> %1
echo           "esnext" >> %1
echo         ], >> %1
echo         jsx: "react-jsx", >> %1
echo         module: "esnext", >> %1
echo         moduleResolution: "node", >> %1
echo         resolveJsonModule: true, >> %1
echo         isolatedModules: true, >> %1
echo         noEmit: true, >> %1
echo         allowJs: true, >> %1
echo         skipLibCheck: true, >> %1
echo         esModuleInterop: true, >> %1
echo         allowSyntheticDefaultImports: true, >> %1
echo         strict: true, >> %1
echo         forceConsistentCasingInFileNames: true, >> %1
echo         noFallthroughCasesInSwitch: true >> %1
echo       }, >> %1
echo       include: [ >> %1
echo         "src" >> %1
echo       ] >> %1
echo     }; >> %1
echo     fs.writeFileSync(path.join(this.clientDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2)); >> %1
echo     console.log('[SUCCESS] Updated client tsconfig.json'); >> %1
echo   } >> %1
echo. >> %1
echo   addUiTypes() { >> %1
echo     console.log('[INFO] Adding UI type definitions...'); >> %1
echo     const uiTypes = `// client/src/types/ui.ts >> %1
echo export interface TableColumn { >> %1
echo   id: string; >> %1
echo   label: string; >> %1
echo   visible: boolean; >> %1
echo   sortable?: boolean; >> %1
echo   width?: string; >> %1
echo   formatter?: (value: any, row: any) => React.ReactNode; >> %1
echo } >> %1
echo >> %1
echo export interface PaginationState { >> %1
echo   currentPage: number; >> %1
echo   totalPages: number; >> %1
echo   totalItems: number; >> %1
echo   pageSize: number; >> %1
echo } >> %1
echo >> %1
echo export interface NotificationState { >> %1
echo   show: boolean; >> %1
echo   message: string; >> %1
echo   type: 'success' | 'error' | 'info' | 'warning'; >> %1
echo } >> %1
echo >> %1
echo export interface LoadingState { >> %1
echo   isLoading: boolean; >> %1
echo   message?: string; >> %1
echo }`; >> %1
echo     fs.writeFileSync(path.join(this.clientDir, 'src', 'types', 'ui.ts'), uiTypes); >> %1
echo     console.log('[SUCCESS] Added UI type definitions'); >> %1
echo   } >> %1
echo. >> %1
echo   addAppConfigTypes() { >> %1
echo     console.log('[INFO] Adding app-config type definitions...'); >> %1
echo     const appConfigTypes = `// server/src/types/app-config.ts >> %1
echo export interface JiraConfig { >> %1
echo   baseUrl: string; >> %1
echo   apiToken: string; >> %1
echo   email: string; >> %1
echo   projectKey: string; >> %1
echo   jqlQuery: string; >> %1
echo } >> %1
echo >> %1
echo export interface FieldMapping { >> %1
echo   originalName: string; >> %1
echo   displayName: string; >> %1
echo   visible: boolean; >> %1
echo } >> %1
echo >> %1
echo export interface AppConfig { >> %1
echo   jira: JiraConfig; >> %1
echo   fieldMappings: FieldMapping[]; >> %1
echo   syncInterval: number; // in minutes >> %1
echo   lastSyncTime?: string; >> %1
echo }`; >> %1
echo     fs.writeFileSync(path.join(this.serverDir, 'src', 'types', 'app-config.ts'), appConfigTypes); >> %1
echo     console.log('[SUCCESS] Added app-config type definitions'); >> %1
echo   } >> %1
echo. >> %1
echo   applyAllFixes() { >> %1
echo     try { >> %1
echo       this.createDirectories(); >> %1
echo       this.backupFiles(); >> %1
echo       this.fixConfigTs(); >> %1
echo       this.fixIndexTs(); >> %1
echo       this.fixIssuesTs(); >> %1
echo       this.updateTsConfig(); >> %1
echo       this.addUiTypes(); >> %1
echo       this.addAppConfigTypes(); >> %1
echo       console.log('\n[SUCCESS] All fixes have been applied successfully!'); >> %1
echo       console.log('[INFO] Please restart your development server.'); >> %1
echo       console.log(`[INFO] Original files backed up to: ${this.backupDir}`); >> %1
echo     } catch (error) { >> %1
echo       console.error('[ERROR] Failed to apply fixes:', error); >> %1
echo       console.error(error.stack); >> %1
echo       process.exit(1); >> %1
echo     } >> %1
echo   } >> %1
echo } >> %1
echo. >> %1
echo // Execute the fixer if run directly >> %1
echo const projectRoot = process.cwd(); >> %1
echo console.log(`[INFO] Starting Express Router syntax fix in directory: ${projectRoot}`); >> %1
echo const fixer = new RouterSyntaxFixer(projectRoot); >> %1
echo fixer.applyAllFixes(); >> %1
exit /b 0