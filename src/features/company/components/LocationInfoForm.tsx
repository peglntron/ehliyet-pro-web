import React from 'react';
import { Box, Typography, TextField, Paper, Grid, Button, Alert } from '@mui/material';
import { LocationOn, Map } from '@mui/icons-material';

interface LocationInfoFormProps {
  formData: {
    location: {
      latitude: string;
      longitude: string;
      mapLink?: string; // Google Maps bağlantısı için yeni alan
    };
  };
  onChange: (data: { location: { latitude: string; longitude: string; mapLink?: string } }) => void;
}

const LocationInfoForm: React.FC<LocationInfoFormProps> = ({ formData, onChange }) => {
  // Google Maps link formatını kontrol et
  const isValidGoogleMapsLink = (link: string): boolean => {
    // Basit bir kontrol: Google Maps URL'si içeriyor mu?
    return link.includes('google.com/maps') || link.includes('goo.gl/maps');
  };

  // Google Maps linkinden enlem ve boylam bilgisini çıkarmaya çalış
  const extractCoordinatesFromLink = (link: string) => {
    try {
      // URL formatlarına göre koordinatları çıkarma
      const url = new URL(link);
      
      // 1. Format: ?q= parametresi içinde koordinatlar
      const qParam = url.searchParams.get('q');
      if (qParam && qParam.includes(',')) {
        const [lat, lng] = qParam.split(',');
        if (!isNaN(Number(lat)) && !isNaN(Number(lng))) {
          return { latitude: lat, longitude: lng };
        }
      }
      
      // 2. Format: @lat,lng içinde koordinatlar
      const path = url.toString();
      const matchAt = path.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (matchAt && matchAt.length >= 3) {
        return { latitude: matchAt[1], longitude: matchAt[2] };
      }
      
      // 3. Format: !3d{lat}!4d{lng}
      const match3d4d = path.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (match3d4d && match3d4d.length >= 3) {
        return { latitude: match3d4d[1], longitude: match3d4d[2] };
      }
    } catch (e) {
      console.error("Link ayrıştırılamadı:", e);
    }
    
    return null;
  };

  // Google Maps linki değiştiğinde
  const handleMapLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mapLink = e.target.value;
    
    // Link boşsa, tüm konum bilgilerini temizle
    if (!mapLink) {
      onChange({
        location: {
          latitude: '',
          longitude: '',
          mapLink: ''
        }
      });
      return;
    }
    
    // Linki kaydet
    const locationUpdate = {
      ...formData.location,
      mapLink
    };
    
    // Geçerli bir link ise, koordinatları çıkarmayı dene
    if (isValidGoogleMapsLink(mapLink)) {
      const coordinates = extractCoordinatesFromLink(mapLink);
      if (coordinates) {
        locationUpdate.latitude = coordinates.latitude;
        locationUpdate.longitude = coordinates.longitude;
      }
    }
    
    onChange({ location: locationUpdate });
  };

  // Latitude, longitude değişikliklerinde mapLink'i koruyoruz
  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      location: {
        ...formData.location,
        [name]: value
      }
    });
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'white'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          mb: 3 
        }}
      >
        <LocationOn color="primary" fontSize="large" />
        <Typography variant="h5" fontWeight={700} color={(theme) => theme.palette.primary.main}>
          Konum Bilgileri
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Kurumunuza ait Google Maps bağlantısını paylaşın. Konum bilgileri otomatik olarak alınacaktır.
        </Alert>
        
        <TextField
          fullWidth
          label="Google Maps Bağlantısı"
          name="mapLink"
          value={formData.location.mapLink || ''}
          onChange={handleMapLinkChange}
          placeholder="https://maps.google.com/... veya https://goo.gl/maps/..."
          helperText="Google Maps üzerinde konumu bulun, paylaş butonuna tıklayın ve bağlantıyı kopyalayın"
          InputProps={{
            sx: { borderRadius: 2 }
          }}
        />
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Konum Koordinatları
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Google Maps bağlantısı girildiğinde, koordinatlar otomatik olarak doldurulur. İsterseniz manuel olarak da girebilirsiniz.
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Enlem (Latitude)"
              name="latitude"
              value={formData.location.latitude}
              onChange={handleCoordinateChange}
              placeholder="Örn: 41.0082"
              disabled={!!formData.location.mapLink && !!formData.location.latitude}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Boylam (Longitude)"
              name="longitude"
              value={formData.location.longitude}
              onChange={handleCoordinateChange}
              placeholder="Örn: 28.9784"
              disabled={!!formData.location.mapLink && !!formData.location.longitude}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
        </Grid>
      </Box>
      
      {/* Koordinatlar varsa harita önizlemesi göster */}
      {formData.location.latitude && formData.location.longitude && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Konum Önizleme
          </Typography>
          
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: 300,
              overflow: 'hidden',
              position: 'relative',
              bgcolor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: `url("https://maps.googleapis.com/maps/api/staticmap?center=${formData.location.latitude},${formData.location.longitude}&zoom=15&size=600x300&markers=color:red%7C${formData.location.latitude},${formData.location.longitude}&key=YOUR_API_KEY")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <Button 
              variant="contained"
              startIcon={<Map />}
              href={formData.location.mapLink || `https://www.google.com/maps/search/?api=1&query=${formData.location.latitude},${formData.location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                position: 'absolute',
                bottom: 16,
                right: 16,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Google Maps'te Aç
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default LocationInfoForm;
