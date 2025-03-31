 
// client/src/pages/NotFoundPage.tsx
import React from 'react';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

/**
 * NotFoundPage component displayed when a route doesn't match any defined routes
 */
const NotFoundPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '70vh' 
      }}>
        <Paper
          sx={{
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <Typography variant="h1" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
            404
          </Typography>
          <Typography variant="h5" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            The page you are looking for doesn't exist or has been moved.
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            startIcon={<HomeIcon />}
            sx={{ mt: 2 }}
          >
            Back to Home
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage;