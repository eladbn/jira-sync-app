@echo off
REM JiraSyncApp Setup Script
REM This script creates the full directory structure with empty files

echo Creating JiraSyncApp project structure...

REM Create root directory and files
mkdir jira-sync-app
cd jira-sync-app
echo {} > package.json
echo # Jira Sync Application > README.md
echo node_modules/ > .gitignore
echo /dist/ >> .gitignore
echo /build/ >> .gitignore
echo .env >> .gitignore

REM Create scripts directory
mkdir scripts
copy "%~f0" "scripts\setup.bat" > nul

REM Create client structure
mkdir client
cd client
echo {} > package.json
echo {} > tsconfig.json

REM Client public directory
mkdir public
cd public
echo ^<!DOCTYPE html^>^<html lang="en"^>^<head^>^<meta charset="utf-8"^>^<title^>Jira Sync App^</title^>^</head^>^<body^>^<div id="root"^>^</div^>^</body^>^</html^> > index.html
echo. > favicon.ico
echo {} > manifest.json
echo. > robots.txt
cd ..

REM Client src directory
mkdir src
cd src
echo. > index.css
echo import React from 'react'^;import ReactDOM from 'react-dom/client'^;import './index.css'^;import App from './App'^;const root = ReactDOM.createRoot(document.getElementById('root')!)^;root.render(^<React.StrictMode^>^<App /^>^</React.StrictMode^>)^; > index.tsx
echo import React from 'react'^;import './App.css'^;function App() { return (^<div^>Jira Sync App^</div^>)^ }^;export default App^; > App.tsx
echo. > App.css

REM Client components
mkdir components
cd components
echo. > IssueTable.tsx

mkdir layout
cd layout
echo. > Layout.tsx
cd ..

mkdir settings
cd settings
echo. > JiraConfig.tsx
echo. > FieldMapping.tsx
echo. > SyncSettings.tsx
cd ..
cd ..

REM Client pages
mkdir pages
cd pages
echo. > IssuesPage.tsx
echo. > IssueDetailsPage.tsx
echo. > SettingsPage.tsx
echo. > NotFoundPage.tsx
cd ..

REM Client services
mkdir services
cd services
echo. > api.ts
cd ..

REM Client types
mkdir types
cd types
echo. > config.ts
echo. > issue.ts
echo. > search.ts
echo. > ui.ts
cd ..

REM Client utils
mkdir utils
cd utils
echo. > dateUtils.ts
cd ..

cd ..\..

REM Create server structure
mkdir server
cd server
echo {} > package.json
echo {} > tsconfig.json

REM Server src directory
mkdir src
cd src
echo. > index.ts

REM Server api
mkdir api
cd api
echo. > index.ts
echo. > issues.ts
echo. > config.ts
cd ..

REM Server config
mkdir config
cd config
echo. > config.ts
cd ..

REM Server db
mkdir db
cd db
echo. > index.ts
cd ..

REM Server services
mkdir services
cd services
echo. > jira-service.ts
cd ..

REM Server types
mkdir types
cd types
echo. > jira.ts
echo. > app-config.ts
cd ..

REM Server utils
mkdir utils
cd utils
echo. > logger.ts
cd ..

cd ..\..

echo.
echo Project structure created successfully!
echo.
echo Next steps:
echo 1. cd jira-sync-app
echo 2. Run "npm install" in root, client, and server directories
echo 3. Configure package.json files based on documentation
echo.

REM Return to original directory
cd ..