import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8fafc',
        py: 4
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 8 },
            textAlign: 'center',
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '5rem', md: '8rem' },
              fontWeight: 800,
              color: 'primary.main',
              lineHeight: 1,
              mb: 2
            }}
          >
            404
          </Typography>
          
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: 'text.primary'
            }}
          >
            Sayfa Bulunamadı
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mb: 6,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Aradığınız sayfa mevcut değil veya kaldırılmış olabilir. Lütfen ana sayfaya dönerek devam edin.
          </Typography>
          
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<HomeIcon />}
            sx={{
              borderRadius: 2,
              py: 1.5,
              px: 4,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem'
            }}
          >
            Ana Sayfaya Dön
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFoundPage;
