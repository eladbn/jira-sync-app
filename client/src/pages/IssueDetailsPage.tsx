 
// client/src/pages/IssueDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Breadcrumbs, 
  Link, Divider, Grid, Chip, CircularProgress,
  Card, CardContent, CardHeader, Alert
} from '@mui/material';
import { 
  Label as LabelIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { getIssueById } from '../services/api';
import { Issue } from '../types/issue';
import { formatDate } from '../utils/dateUtils';

interface StatusColorMap {
  [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

interface PriorityColorMap {
  [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

const IssueDetailsPage: React.FC = () => {
  const { issueKey } = useParams<{ issueKey: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssue = async (): Promise<void> => {
      if (!issueKey) return;
      
      setLoading(true);
      try {
        const issueData = await getIssueById(issueKey);
        setIssue(issueData);
      } catch (err) {
        console.error('Error fetching issue:', err);
        setError('Failed to load issue details');
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [issueKey]);

  // Get status color based on issue status
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const statusMap: StatusColorMap = {
      'Open': 'primary',
      'In Progress': 'info',
      'Done': 'success',
      'Closed': 'secondary',
      'Resolved': 'success',
      'Reopened': 'warning',
      'To Do': 'default'
    };
    
    return statusMap[status] || 'default';
  };
  
  // Get priority color based on issue priority
  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const priorityMap: PriorityColorMap = {
      'Highest': 'error',
      'High': 'warning',
      'Medium': 'info',
      'Low': 'success',
      'Lowest': 'default'
    };
    
    return priorityMap[priority] || 'default';
  };

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Render error state
  if (error || !issue) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 3, mb: 3 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link component={RouterLink} to="/" underline="hover" color="inherit">
              Issues
            </Link>
            <Typography color="text.primary">Issue Details</Typography>
          </Breadcrumbs>
        </Box>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || 'Issue not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} to="/" underline="hover" color="inherit">
            Issues
          </Link>
          <Typography color="text.primary">{issue.key}</Typography>
        </Breadcrumbs>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {issue.key}: {issue.summary}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                label={issue.status} 
                color={getStatusColor(issue.status)} 
                size="small" 
              />
              <Chip 
                label={issue.issueType} 
                size="small" 
                variant="outlined" 
              />
              <Chip 
                label={issue.priority} 
                color={getPriorityColor(issue.priority)} 
                size="small" 
                variant="outlined" 
              />
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card variant="outlined">
              <CardHeader title="Description" />
              <CardContent>
                {issue.description ? (
                  <Typography variant="body1">
                    {issue.description}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No description provided
                  </Typography>
                )}
              </CardContent>
            </Card>

            {issue.labels && issue.labels.length > 0 && (
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                <LabelIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle2" sx={{ mr: 2 }}>
                  Labels:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {issue.labels.map((label, index) => (
                    <Chip key={index} label={label} size="small" />
                  ))}
                </Box>
              </Box>
            )}

            {issue.components && issue.components.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <CategoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle2" sx={{ mr: 2 }}>
                  Components:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {issue.components.map((component, index) => (
                    <Chip key={index} label={component} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader title="Details" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" sx={{ mr: 1 }}>
                        Assignee:
                      </Typography>
                      <Typography>
                        {issue.assignee || 'Unassigned'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" sx={{ mr: 1 }}>
                        Reporter:
                      </Typography>
                      <Typography>
                        {issue.reporter || 'Unknown'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" sx={{ mr: 1 }}>
                        Created:
                      </Typography>
                      <Typography>
                        {formatDate(issue.created)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" sx={{ mr: 1 }}>
                        Updated:
                      </Typography>
                      <Typography>
                        {formatDate(issue.updated)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default IssueDetailsPage;