// client/src/pages/SettingsPage.tsx
import React, { useState, useCallback, ReactElement } from 'react';
import { 
  Container, Typography, Box, Paper, Breadcrumbs, 
  Link, Tabs, Tab, Snackbar, Alert
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import JiraConfig from '../components/settings/JiraConfig';
import FieldMapping from '../components/settings/FieldMapping';
import SyncSettings from '../components/settings/SyncSettings';

// Type definition for notification state
interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

interface TabPanelProps {
  children: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Tab panel component for settings content
 */
const TabPanel = ({ children, value, index }: TabPanelProps): ReactElement => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      sx={{ pt: 3 }}
    >
      {value === index && children}
    </Box>
  );
};

// Helper function for a11y props
const a11yProps = (index: number) => {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
};

/**
 * Settings page component with tabs for different configuration sections
 */
const SettingsPage = (): ReactElement => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Initialize tab value from URL hash if present
  const getInitialTab = (): number => {
    const hash = location.hash;
    if (hash === '#jira') return 0;
    if (hash === '#fields') return 1;
    if (hash === '#sync') return 2;
    return 0;
  };
  
  const [tabValue, setTabValue] = useState<number>(getInitialTab());
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Handle tab change and update URL hash
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue);
    const hash = newValue === 0 ? '#jira' : newValue === 1 ? '#fields' : '#sync';
    navigate({ hash }, { replace: true });
  };

  // Show notification
  const showNotification = useCallback((
    message: string, 
    severity: 'success' | 'error' | 'info' | 'warning' = 'info'
  ): void => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);

  // Close notification
  const handleCloseNotification = useCallback((): void => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Handle config saved callback
  const handleConfigSaved = useCallback((): void => {
    showNotification('Configuration saved successfully', 'success');
  }, [showNotification]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} to="/" underline="hover" color="inherit">
            Issues
          </Link>
          <Typography color="text.primary">Settings</Typography>
        </Breadcrumbs>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Application Settings
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Jira Connection" {...a11yProps(0)} />
            <Tab label="Field Mapping" {...a11yProps(1)} />
            <Tab label="Sync Settings" {...a11yProps(2)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <JiraConfig onConfigSaved={handleConfigSaved} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <FieldMapping onMappingsSaved={handleConfigSaved} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <SyncSettings onSettingsSaved={handleConfigSaved} />
        </TabPanel>
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
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage;