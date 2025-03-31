// client/src/pages/IssuesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Typography, Box, Paper, Breadcrumbs, 
  Link, Divider, Snackbar, Alert, Button
} from '@mui/material';
import { SyncAlt } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import IssueTable from '../components/IssueTable';
import { getConfig, syncIssues } from '../services/api';
import { AppConfig } from '../types/config';
import { TableColumn } from '../types/ui';
import { formatDate } from '../utils/dateUtils';

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

/**
 * Main issues listing page component
 */
const IssuesPage: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [columns, setColumns] = useState<TableColumn[]>([]);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Define the default columns once outside the component
  const defaultColumns: TableColumn[] = [
    { id: 'key', label: 'Key', visible: true, width: '100px' },
    { id: 'summary', label: 'Summary', visible: true },
    { id: 'status', label: 'Status', visible: true, width: '120px' },
    { id: 'issueType', label: 'Type', visible: true, width: '120px' },
    { id: 'assignee', label: 'Assignee', visible: true, width: '150px' },
    { id: 'updated', label: 'Updated', visible: true, width: '150px' }
  ];

  // Column width mapping
  const widthMap: Record<string, string> = {
    'key': '100px',
    'issueType': '120px',
    'status': '120px',
    'priority': '120px',
    'assignee': '150px',
    'reporter': '150px',
    'created': '150px',
    'updated': '150px'
  };

  const getColumnWidth = useCallback((fieldName: string): string | undefined => {
    return widthMap[fieldName];
  }, []);

  // Extract notification logic to a separate function
  const showNotification = useCallback((message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);

  // Fetch config on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const appConfig = await getConfig();
        setConfig(appConfig);

        if (appConfig.fieldMappings && appConfig.fieldMappings.length > 0) {
          // Map field mappings to table columns
          const mappedColumns = appConfig.fieldMappings.map(mapping => ({
            id: mapping.originalName,
            label: mapping.displayName,
            visible: mapping.visible,
            width: getColumnWidth(mapping.originalName)
          }));
          setColumns(mappedColumns);
        } else {
          setColumns(defaultColumns);
        }
      } catch (error) {
        console.error('Error fetching config:', error);
        showNotification('Failed to load configuration', 'error');
      }
    };

    fetchConfig();
  }, [getColumnWidth, showNotification, defaultColumns]);

  // Handle manual sync
  const handleSync = async () => {
    if (syncing) return;
    
    setSyncing(true);
    try {
      const result = await syncIssues();
      showNotification(`Successfully synced ${result.total} issues from Jira`, 'success');
      
      // Refresh config to update lastSyncTime
      const updatedConfig = await getConfig();
      setConfig(updatedConfig);
    } catch (error) {
      console.error('Error syncing issues:', error);
      showNotification('Failed to sync issues from Jira', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Handle sync complete callback from table
  const handleSyncComplete = useCallback(async () => {
    try {
      // Refresh config to update lastSyncTime
      const updatedConfig = await getConfig();
      setConfig(updatedConfig);
      showNotification('Successfully synced issues from Jira', 'success');
    } catch (error) {
      console.error('Error updating config after sync:', error);
    }
  }, [showNotification]);

  // Close notification
  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 3, mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Typography color="text.primary">Issues</Typography>
        </Breadcrumbs>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Jira Issues
          </Typography>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<SyncAlt />}
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {config?.lastSyncTime && (
              <>Last synced: {formatDate(config.lastSyncTime)}</>
            )}
          </Typography>
          
          <Box component={RouterLink} to="/settings" style={{ textDecoration: 'none' }}>
            <Link component="span" underline="hover">
              Configure Fields
            </Link>
          </Box>
        </Box>
        
        <IssueTable columns={columns} onSyncComplete={handleSyncComplete} />
      </Paper>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default IssuesPage;