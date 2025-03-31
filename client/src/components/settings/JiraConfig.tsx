// client/src/components/settings/JiraConfig.tsx
import React, { useState, useEffect } from 'react';
import { 
  Paper, TextField, Button, Typography, Box, Alert, 
  CircularProgress, Divider, Grid, IconButton, Tooltip
} from '@mui/material';
import { Check, Info } from '@mui/icons-material';
import { JiraConfig as JiraConfigType } from '../../types/config';
import { getConfig, updateJiraConfig, testJiraConnection } from '../../services/api';

interface JiraConfigProps {
  onConfigSaved?: () => void;
}

const JiraConfig: React.FC<JiraConfigProps> = ({ onConfigSaved }): React.ReactNode => {
  const [config, setConfig] = useState<JiraConfigType>({
    baseUrl: '',
    apiToken: '',
    email: '',
    projectKey: '',
    jqlQuery: ''
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [testing, setTesting] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  
  // Fetch current config on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const appConfig = await getConfig();
        if (appConfig.jira) {
          setConfig(appConfig.jira);
        }
      } catch (error) {
        console.error('Error fetching Jira config:', error);
        setAlert({
          type: 'error',
          message: 'Failed to load configuration'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, []);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);
    
    try {
      await updateJiraConfig(config);
      setAlert({
        type: 'success',
        message: 'Jira configuration saved successfully'
      });
      
      if (onConfigSaved) {
        onConfigSaved();
      }
    } catch (error) {
      console.error('Error saving Jira config:', error);
      setAlert({
        type: 'error',
        message: 'Failed to save configuration'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle test connection
  const handleTestConnection = async () => {
    setTesting(true);
    setAlert(null);
    
    try {
      const result = await testJiraConnection();
      
      if (result.success) {
        setAlert({
          type: 'success',
          message: 'Connection to Jira successful'
        });
      } else {
        setAlert({
          type: 'error',
          message: 'Failed to connect to Jira'
        });
      }
    } catch (error) {
      console.error('Error testing Jira connection:', error);
      setAlert({
        type: 'error',
        message: 'Failed to test connection'
      });
    } finally {
      setTesting(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Jira Configuration
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {alert && (
        <Alert severity={alert.type} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Jira Base URL"
              name="baseUrl"
              value={config.baseUrl}
              onChange={handleChange}
              placeholder="https://your-domain.atlassian.net"
              required
              helperText="Your Jira instance URL"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={config.email}
              onChange={handleChange}
              required
              helperText="Email address associated with your Jira account"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="API Token"
              name="apiToken"
              type="password"
              value={config.apiToken}
              onChange={handleChange}
              required
              helperText={
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                  Generate from Atlassian account settings
                  <Tooltip title="Visit Atlassian Account > Security > API tokens to create">
                    <IconButton size="small">
                      <Info fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
              }
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Project Key"
              name="projectKey"
              value={config.projectKey}
              onChange={handleChange}
              required
              helperText="The key of the Jira project (e.g., PROJ)"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleTestConnection}
                disabled={testing || !config.baseUrl || !config.apiToken || !config.email}
                startIcon={testing ? <CircularProgress size={20} /> : <Check />}
                sx={{ mt: 1 }}
              >
                Test Connection
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="JQL Query"
              name="jqlQuery"
              value={config.jqlQuery}
              onChange={handleChange}
              multiline
              rows={2}
              placeholder="project = PROJ ORDER BY created DESC"
              helperText="JQL query to fetch issues (leave empty to use default project query)"
            />
          </Grid>
          
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
              startIcon={saving && <CircularProgress size={20} color="inherit" />}
            >
              Save Configuration
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default JiraConfig;