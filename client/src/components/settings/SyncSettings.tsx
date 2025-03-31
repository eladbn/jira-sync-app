// client/src/components/settings/SyncSettings.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { 
  Paper, Typography, Box, Alert, CircularProgress, Divider,
  FormControl, InputLabel, Select, MenuItem, Button,
  Grid, TextField, FormHelperText, SelectChangeEvent
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { getConfig, updateSyncInterval } from '../../services/api';

interface SyncSettingsProps {
  onSettingsSaved?: () => void;
}

/**
 * Component for configuring synchronization settings
 */
const SyncSettings = ({ onSettingsSaved }: SyncSettingsProps): JSX.Element => {
  const [syncInterval, setSyncInterval] = useState<number>(60);
  const [customInterval, setCustomInterval] = useState<number | ''>('' as number | '');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  
  // Fetch current sync settings on component mount
  useEffect(() => {
    const fetchConfig = async (): Promise<void> => {
      setLoading(true);
      try {
        const appConfig = await getConfig();
        if (appConfig.syncInterval) {
          setSyncInterval(appConfig.syncInterval);
          
          // Check if it's a custom interval
          if (![15, 30, 60, 120, 360, 720, 1440].includes(appConfig.syncInterval)) {
            setCustomInterval(appConfig.syncInterval);
          }
        }
      } catch (error) {
        console.error('Error fetching sync settings:', error);
        setAlert({
          type: 'error',
          message: 'Failed to load sync settings'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, []);
  
  // Handle interval change
  const handleIntervalChange = (event: SelectChangeEvent<number>): void => {
    const value = event.target.value as number;
    setSyncInterval(value);
    
    // Reset custom interval if a predefined interval is selected
    if (value !== -1) {
      setCustomInterval('');
    }
  };
  
  // Handle custom interval change
  const handleCustomIntervalChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    
    // Allow empty string or convert to number
    if (value === '') {
      setCustomInterval('');
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0) {
        setCustomInterval(numValue);
      }
    }
  };
  
  // Handle form submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);
    
    try {
      // Determine the interval to save
      const intervalToSave = syncInterval === -1 ? 
        (typeof customInterval === 'number' ? customInterval : 60) : 
        syncInterval;
      
      await updateSyncInterval(intervalToSave);
      
      setSyncInterval(intervalToSave);
      
      setAlert({
        type: 'success',
        message: 'Sync settings saved successfully'
      });
      
      if (onSettingsSaved) {
        onSettingsSaved();
      }
    } catch (error) {
      console.error('Error saving sync settings:', error);
      setAlert({
        type: 'error',
        message: 'Failed to save sync settings'
      });
    } finally {
      setSaving(false);
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
        Sync Settings
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Configure how often the application should sync issues from Jira.
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {alert && (
        <Alert severity={alert.type} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="sync-interval-label">Sync Interval</InputLabel>
              <Select
                labelId="sync-interval-label"
                value={syncInterval}
                onChange={handleIntervalChange}
                label="Sync Interval"
              >
                <MenuItem value={15}>Every 15 minutes</MenuItem>
                <MenuItem value={30}>Every 30 minutes</MenuItem>
                <MenuItem value={60}>Every hour</MenuItem>
                <MenuItem value={120}>Every 2 hours</MenuItem>
                <MenuItem value={360}>Every 6 hours</MenuItem>
                <MenuItem value={720}>Every 12 hours</MenuItem>
                <MenuItem value={1440}>Every 24 hours</MenuItem>
                <MenuItem value={-1}>Custom</MenuItem>
              </Select>
              <FormHelperText>
                How often the application should automatically sync issues from Jira
              </FormHelperText>
            </FormControl>
          </Grid>
          
          {syncInterval === -1 && (
            <Grid item xs={12}>
              <TextField
                label="Custom Interval (minutes)"
                value={customInterval}
                onChange={handleCustomIntervalChange}
                type="number"
                fullWidth
                inputProps={{ min: 1 }}
                required={syncInterval === -1}
                helperText="Enter custom sync interval in minutes"
              />
            </Grid>
          )}
          
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
              disabled={saving || (syncInterval === -1 && !customInterval)}
            >
              Save Settings
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default SyncSettings;