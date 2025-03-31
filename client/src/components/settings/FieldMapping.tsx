// client/src/components/settings/FieldMapping.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { 
  Paper, Typography, Box, Alert, CircularProgress, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Switch, Button, IconButton, Tooltip, FormControlLabel, MenuItem
} from '@mui/material';
import { Save, Add, Delete, Refresh } from '@mui/icons-material';
import { FieldMapping as FieldMappingType } from '../../types/config';
import { getConfig, updateFieldMappings, getJiraFields } from '../../services/api';

interface FieldMappingProps {
    onMappingsSaved?: () => void;
  }
  
const FieldMapping = ({ onMappingsSaved }: FieldMappingProps): JSX.Element => {
  const [mappings, setMappings] = useState<FieldMappingType[]>([]);
  const [availableFields, setAvailableFields] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [loadingFields, setLoadingFields] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  
  // Fetch current mappings and available fields on component mount
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      try {
        const appConfig = await getConfig();
        if (appConfig.fieldMappings) {
          setMappings(appConfig.fieldMappings);
        } else {
          // Set default mappings for common fields
          setMappings([
            { originalName: 'summary', displayName: 'Summary', visible: true },
            { originalName: 'status', displayName: 'Status', visible: true },
            { originalName: 'issueType', displayName: 'Issue Type', visible: true },
            { originalName: 'priority', displayName: 'Priority', visible: true },
            { originalName: 'assignee', displayName: 'Assignee', visible: true },
            { originalName: 'reporter', displayName: 'Reporter', visible: true },
            { originalName: 'created', displayName: 'Created Date', visible: true },
            { originalName: 'updated', displayName: 'Updated Date', visible: true }
          ]);
        }
        
        await fetchJiraFields();
      } catch (error) {
        console.error('Error fetching field mappings:', error);
        setAlert({
          type: 'error',
          message: 'Failed to load field mappings'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Fetch available Jira fields
  const fetchJiraFields = async (): Promise<void> => {
    setLoadingFields(true);
    try {
      const fields = await getJiraFields();
      setAvailableFields(
        fields.map(field => ({
          id: field.id,
          name: field.name
        }))
      );
    } catch (error) {
      console.error('Error fetching Jira fields:', error);
      setAlert({
        type: 'error',
        message: 'Failed to load Jira fields'
      });
    } finally {
      setLoadingFields(false);
    }
  };
  
  // Handle adding a new mapping
  const handleAddMapping = (): void => {
    setMappings(prev => [
      ...prev,
      { originalName: '', displayName: '', visible: true }
    ]);
  };
  
  // Handle removing a mapping
  const handleRemoveMapping = (index: number): void => {
    setMappings(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle mapping field change
  const handleMappingChange = (index: number, field: keyof FieldMappingType, value: string | boolean): void => {
    setMappings(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };
  
  // Handle form submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);
    
    try {
      // Filter out empty mappings
      const validMappings = mappings.filter(mapping => 
        mapping.originalName.trim() !== '' && mapping.displayName.trim() !== ''
      );
      
      await updateFieldMappings(validMappings);
      setMappings(validMappings);
      
      setAlert({
        type: 'success',
        message: 'Field mappings saved successfully'
      });
      
      if (onMappingsSaved) {
        onMappingsSaved();
      }
    } catch (error) {
      console.error('Error saving field mappings:', error);
      setAlert({
        type: 'error',
        message: 'Failed to save field mappings'
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
  
  // Standard field options
  const standardFields = [
    { id: '', name: 'Select a field' },
    { id: 'summary', name: 'Summary' },
    { id: 'description', name: 'Description' },
    { id: 'status', name: 'Status' },
    { id: 'issueType', name: 'Issue Type' },
    { id: 'priority', name: 'Priority' },
    { id: 'assignee', name: 'Assignee' },
    { id: 'reporter', name: 'Reporter' },
    { id: 'created', name: 'Created Date' },
    { id: 'updated', name: 'Updated Date' },
    { id: 'components', name: 'Components' },
    { id: 'labels', name: 'Labels' }
  ];
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Field Mappings
        </Typography>
        
        <Tooltip title="Refresh Jira fields">
          <IconButton onClick={fetchJiraFields} disabled={loadingFields}>
            {loadingFields ? <CircularProgress size={24} /> : <Refresh />}
          </IconButton>
        </Tooltip>
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Customize how Jira fields are displayed in the application. 
        Set friendly names and choose which fields to show in the UI.
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {alert && (
        <Alert severity={alert.type} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Original Field</TableCell>
                <TableCell>Display Name</TableCell>
                <TableCell align="center">Visible</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mappings.map((mapping, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={mapping.originalName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleMappingChange(index, 'originalName', e.target.value)}
                      select
                      required
                    >
                      {/* Standard fields */}
                      {standardFields.map((field) => (
                        <MenuItem key={`std-${field.id}`} value={field.id}>
                          {field.name}
                        </MenuItem>
                      ))}
                      
                      {/* Dynamic Jira fields */}
                      {availableFields.length > 0 && (
                        <MenuItem disabled divider>
                          ----- Custom Fields -----
                        </MenuItem>
                      )}
                      
                      {availableFields.map((field) => (
                        <MenuItem key={`dyn-${field.id}`} value={field.id}>
                          {field.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={mapping.displayName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleMappingChange(index, 'displayName', e.target.value)}
                      placeholder="Display name"
                      required
                    />
                  </TableCell>
                  <TableCell align="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={mapping.visible}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleMappingChange(index, 'visible', e.target.checked)}
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveMapping(index)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            startIcon={<Add />}
            onClick={handleAddMapping}
            variant="outlined"
          >
            Add Field
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
            disabled={saving}
          >
            Save Mappings
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default FieldMapping;