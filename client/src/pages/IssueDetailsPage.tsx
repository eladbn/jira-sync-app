// client/src/pages/IssueDetailsPage.tsx
import React, { useState, useEffect, useMemo, ReactElement } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Breadcrumbs, 
  Link, Divider, Grid, Chip, CircularProgress,
  Card, CardContent, CardHeader, Alert, Button
} from '@mui/material';
import { 
  Label as LabelIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { getIssueById } from '../services/api';
import { Issue } from '../types/issue';
import { formatDate } from '../utils/dateUtils';

// Type definitions for color maps
type StatusColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
type StatusColorMap = Record<string, StatusColor>;
type PriorityColorMap = Record<string, StatusColor>;

interface IssueDetailsPageParams {
  issueKey: string;
}

/**
 * Component for displaying detailed information about a specific issue
 */
const IssueDetailsPage = (): JSX.Element => {
  const { issueKey } = useParams<keyof IssueDetailsPageParams>() as IssueDetailsPageParams;
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Status color mapping with proper typing
  const statusMap = useMemo<StatusColorMap>(() => ({
    'Open': 'primary',
    'In Progress': 'info',
    'Done': 'success',
    'Closed': 'secondary',
    'Resolved': 'success',
    'Reopened': 'warning',
    'To Do': 'default'
  }), []);
  
  // Priority color mapping with proper typing
  const priorityMap = useMemo<PriorityColorMap>(() => ({
    'Highest': 'error',
    'High': 'warning',
    'Medium': 'info',
    'Low': 'success',
    'Lowest': 'default'
  }), []);

  useEffect(() => {
    const fetchIssue = async (): Promise<void> => {
      if (!issueKey) {
        setError('Issue key is required');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const issueData = await getIssueById(issueKey);
        if (!issueData) {
          setError(`Issue "${issueKey}" not found`);
        } else {
          setIssue(issueData);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching issue:', err);
        setError(`Failed to load issue details for "${issueKey}"`);
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [issueKey]);

  // Get status color based on issue status
  const getStatusColor = (status: string): StatusColor => 
    statusMap[status] || 'default';
  
  // Get priority color based on issue priority
  const getPriorityColor = (priority: string): StatusColor => 
    priorityMap[priority] || 'default';

  // Handle back button
  const handleGoBack = (): void => {
    navigate(-1);
  };

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 3, mb: 3 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link component={RouterLink} to="/" underline="hover" color="inherit">
              Issues
            </Link>
            <Typography color="text.primary">Loading...</Typography>
          </Breadcrumbs>
        </Box>
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
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleGoBack}>
              Go Back
            </Button>
          }
        >
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
              {issue.priority && (
                <Chip 
                  label={issue.priority} 
                  color={getPriorityColor(issue.priority)} 
                  size="small" 
                  variant="outlined" 
                />
              )}
            </Box>
          </Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            variant="outlined"
            size="small"
          >
            Back to Issues
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card variant="outlined">
              <CardHeader title="Description" />
              <CardContent>
                {issue.description ? (
                  <Typography variant="body1" whiteSpace="pre-wrap">
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
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'flex-start' }}>
                <LabelIcon sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                <Typography variant="subtitle2" sx={{ mr: 2, mt: 0.5 }}>
                  Labels:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {issue.labels.map((label, index) => (
                    <Chip key={`label-${index}`} label={label} size="small" />
                  ))}
                </Box>
              </Box>
            )}

            {issue.components && issue.components.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-start' }}>
                <CategoryIcon sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                <Typography variant="subtitle2" sx={{ mr: 2, mt: 0.5 }}>
                  Components:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {issue.components.map((component, index) => (
                    <Chip key={`comp-${index}`} label={component} size="small" variant="outlined" />
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