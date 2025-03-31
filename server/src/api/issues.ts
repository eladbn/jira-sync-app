 
// server/src/api/issues.ts
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

export default router;

