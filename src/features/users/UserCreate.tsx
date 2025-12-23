import React, { useState } from 'react';
import { Box, Typography, Container, Button, Paper, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import UserCreateForm from './components/UserCreateForm';

const UserCreate: React.FC = () => {
  const navigate = useNavigate();
  
  // Başarılı kullanıcı oluşturma işlemi sonrası yönlendirme
  const handleUserCreated = (userId: string) => {
    // Başarılı işlemden sonra kullanıcılar listesine veya yeni kullanıcı detayına yönlendir
    setTimeout(() => {
      navigate('/users');
    }, 1500);
  };
  
  // Simüle edilmiş kurum listesi
  const companyOptions = [
    { id: '1', name: 'ABC Sürücü Kursu' },
    { id: '2', name: 'XYZ Sürücü Kursu' },
    { id: '3', name: 'DEF Sürücü Kursu' },
  ];

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      overflow: 'auto',
      bgcolor: '#f8fafc',
      boxSizing: 'border-box',
      p: { xs: 2, md: 3 }
    }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Başlık ve breadcrumb */}
        <PageBreadcrumb />
        
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          mt={2}
        >
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                color: 'primary.main',
                mb: 1
              }}
            >
              Yeni Kullanıcı Oluştur
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sisteme yeni bir kullanıcı ekleyin. Kullanıcı bilgileri oluşturulduktan sonra, telefonuna doğrulama kodu gönderilecektir.
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/users')}
            sx={{
              py: 1.2,
              px: 2.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Kullanıcı Listesine Dön
          </Button>
        </Box>
        
        {/* Bilgi Kutusu */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            bgcolor: 'info.50',
            border: '1px solid',
            borderColor: 'info.200'
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} color="info.main" gutterBottom>
            Kullanıcı Oluşturma İşlemi Hakkında
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Kullanıcı oluşturulduğunda, girdiğiniz telefon numarasına bir SMS doğrulama kodu gönderilecektir. Kullanıcı, bu kodu doğruladıktan sonra hesabını aktifleştirebilir.
            Şifre bilgisi de kullanıcıya SMS ile iletilecektir. Kullanıcı, ilk girişten sonra şifresini değiştirebilir.
          </Typography>
        </Paper>
        
        {/* Kullanıcı Oluşturma Formu */}
        <UserCreateForm 
          onSuccess={handleUserCreated}
          companyOptions={companyOptions}
        />
      </Container>
    </Box>
  );
};

export default UserCreate;
