 
// client/src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import { 
  Container, Typography, Box, Paper, Breadcrumbs, 
  Link, Tabs, Tab, Snackbar, Alert
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import JiraConfig from '../components/settings/JiraConfig';
import FieldMapping from '../components/settings/FieldMapping';
import SyncSettings from '../components/settings/SyncSettings';

interface TabPanelProps {
  children: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </Box>
  );
};

const SettingsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState<number>(0);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Show notification
  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Handle config saved callback
  const handleConfigSaved = () => {
    showNotification('Configuration saved successfully', 'success');
  };

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
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
            <Tab label="Jira Connection" id="settings-tab-0" aria-controls="settings-tabpanel-0" />
            <Tab label="Field Mapping" id="settings-tab-1" aria-controls="settings-tabpanel-1" />
            <Tab label="Sync Settings" id="settings-tab-2" aria-controls="settings-tabpanel-2" />
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
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage;