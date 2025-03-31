// server/src/index.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import { initializeDatabase } from './db';
import { jiraService } from './services/jira-service';
import apiRouter from './api';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
}

// Initialize the app
const init = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Initialize Jira service
    await jiraService.initialize();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
};

init();