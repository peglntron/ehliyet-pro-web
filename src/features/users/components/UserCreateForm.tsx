import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Paper, FormHelperText,
  InputAdornment, Stepper, Step, StepLabel, Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Lock as LockIcon,
  Sms as SmsIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { UserFormData } from '../types/types';
import { useUsers } from '../api/useUsers';

interface UserCreateFormProps {
  onSuccess: (userId: string) => void;
  companyOptions: { id: string; name: string }[];
}

const UserCreateForm: React.FC<UserCreateFormProps> = ({ onSuccess, companyOptions }) => {
  // Stepper için aktif adım
  const [activeStep, setActiveStep] = useState(0);
  
  // Form verileri
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    surname: '',
    phone: '',
    email: '',
    companyId: '',
    role: 'student',
    password: '',
    confirmPassword: ''
  });
  
  // Doğrulama kodu için state
  const [verificationCode, setVerificationCode] = useState('');
  const [smsCodeSent, setSmsCodeSent] = useState(false);
  const [smsVerified, setSmsVerified] = useState(false);
  
  // Hata yönetimi
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Users API hook
  const { addUser, sendSmsVerification, verifySmsCode } = useUsers();

  // Form alanı değişikliği işleme
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata varsa temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // İlk adım form doğrulama
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ad gereklidir';
    }
    
    if (!formData.surname.trim()) {
      newErrors.surname = 'Soyad gereklidir';
    }
    
    // Telefon numarası doğrulama
    const phoneRegex = /^05[0-9]{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir';
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası girin (05XX XXX XXXX)';
    }
    
    // E-posta formatı doğrulama (opsiyonel)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    
    if (!formData.role) {
      newErrors.role = 'Kullanıcı rolü gereklidir';
    }
    
    // Eğer şirket yöneticisi ise şirket ID gerekli
    if (formData.role === 'company_admin' && !formData.companyId) {
      newErrors.companyId = 'Kurum seçimi gereklidir';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // İkinci adım form doğrulama
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!smsVerified) {
      newErrors.verificationCode = 'Telefon numarasını doğrulamanız gerekmektedir';
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre tekrarı gereklidir';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SMS doğrulama kodu gönderme
  const handleSendVerificationCode = async () => {
    // Telefon numarası doğrulama
    const phoneRegex = /^05[0-9]{9}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setErrors(prev => ({ ...prev, phone: 'Geçerli bir telefon numarası girin' }));
      return;
    }
    
    const result = await sendSmsVerification(formData.phone);
    
    if (result.success) {
      setSmsCodeSent(true);
      setSuccessMessage('Doğrulama kodu telefonunuza gönderildi');
      setGeneralError(null);
    } else {
      setGeneralError(result.message);
    }
  };

  // SMS doğrulama kodunu kontrol etme
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setErrors(prev => ({ ...prev, verificationCode: 'Doğrulama kodu gereklidir' }));
      return;
    }
    
    const result = await verifySmsCode(formData.phone, verificationCode);
    
    if (result.success) {
      setSmsVerified(true);
      setSuccessMessage('Telefon numaranız doğrulandı');
      setGeneralError(null);
      
      // Doğrulama hatası varsa temizle
      if (errors.verificationCode) {
        setErrors(prev => ({
          ...prev,
          verificationCode: ''
        }));
      }
    } else {
      setErrors(prev => ({ ...prev, verificationCode: 'Geçersiz doğrulama kodu' }));
      setGeneralError(result.message);
    }
  };

  // Sonraki adıma geçme
  const handleNext = () => {
    if (activeStep === 0) {
      if (validateStep1()) {
        setActiveStep(1);
        setGeneralError(null);
      }
    } else if (activeStep === 1) {
      if (validateStep2()) {
        handleSubmit();
      }
    }
  };

  // Önceki adıma dönme
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Formu gönderme
  const handleSubmit = async () => {
    try {
      const result = await addUser(formData);
      
      if (result.success && result.userId) {
        setSuccessMessage('Kullanıcı başarıyla oluşturuldu');
        setGeneralError(null);
        
        // İşlem başarılı ise dışarıya bildir
        onSuccess(result.userId);
      } else {
        setGeneralError(result.message);
      }
    } catch (err) {
      console.error('Kullanıcı eklenirken hata:', err);
      setGeneralError('Kullanıcı eklenirken bir hata oluştu');
    }
  };

  // Adım içeriği
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Kişisel Bilgiler */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Ad"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
              
              <TextField
                fullWidth
                label="Soyad"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                error={!!errors.surname}
                helperText={errors.surname}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
            </Box>
            
            {/* İletişim Bilgileri */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Telefon"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="05XX XXX XXXX"
                error={!!errors.phone}
                helperText={errors.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
              
              <TextField
                fullWidth
                label="E-posta (opsiyonel)"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
            </Box>
            
            {/* Rol ve Kurum */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <FormControl fullWidth error={!!errors.role}>
                <InputLabel id="role-label">Kullanıcı Rolü</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  label="Kullanıcı Rolü"
                  onChange={handleChange}
                  sx={{ borderRadius: 2 }}
                  startAdornment={
                    <InputAdornment position="start">
                      <PersonIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="student">Öğrenci</MenuItem>
                  <MenuItem value="instructor">Eğitmen</MenuItem>
                  <MenuItem value="company_admin">Kurum Yöneticisi</MenuItem>
                  <MenuItem value="admin">Sistem Yöneticisi</MenuItem>
                </Select>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>
              
              {formData.role === 'company_admin' && (
                <FormControl fullWidth error={!!errors.companyId}>
                  <InputLabel id="company-label">Kurum</InputLabel>
                  <Select
                    labelId="company-label"
                    name="companyId"
                    value={formData.companyId}
                    label="Kurum"
                    onChange={handleChange}
                    sx={{ borderRadius: 2 }}
                    startAdornment={
                      <InputAdornment position="start">
                        <BusinessIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    {companyOptions.map(company => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.companyId && <FormHelperText>{errors.companyId}</FormHelperText>}
                </FormControl>
              )}
            </Box>
          </Box>
        );
        
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Telefon Doğrulama */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Telefon Doğrulama
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  label="Doğrulama Kodu"
                  name="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={!smsCodeSent || smsVerified}
                  error={!!errors.verificationCode}
                  helperText={errors.verificationCode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SmsIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />
                
                {!smsVerified ? (
                  smsCodeSent ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleVerifyCode}
                      disabled={!verificationCode.trim() || smsVerified}
                      sx={{ 
                        height: 56, 
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Doğrula
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSendVerificationCode}
                      sx={{ 
                        height: 56, 
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Kod Gönder
                    </Button>
                  )
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    disabled
                    sx={{ 
                      height: 56, 
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Doğrulandı
                  </Button>
                )}
              </Box>
              
              {smsCodeSent && !smsVerified && (
                <Typography variant="caption" color="text.secondary">
                  Telefonunuza gönderilen 6 haneli doğrulama kodunu girin.
                </Typography>
              )}
            </Box>
            
            {/* Şifre Belirleme */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Şifre Belirleme
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <TextField
                  fullWidth
                  type="password"
                  label="Şifre"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />
                
                <TextField
                  fullWidth
                  type="password"
                  label="Şifre Tekrar"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                Şifreniz en az 6 karakter uzunluğunda olmalıdır.
              </Typography>
            </Box>
          </Box>
        );
        
      default:
        return 'Bilinmeyen adım';
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Hata ve başarı mesajları */}
      {generalError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {generalError}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      {/* Adım göstergesi */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Kişisel Bilgiler</StepLabel>
        </Step>
        <Step>
          <StepLabel>Doğrulama ve Şifre</StepLabel>
        </Step>
      </Stepper>
      
      {/* Adım içeriği */}
      <Box sx={{ mt: 3 }}>
        {getStepContent(activeStep)}
      </Box>
      
      {/* Adım kontrol butonları */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1
          }}
        >
          Geri
        </Button>
        <Button
          variant="contained"
          color="primary"
          endIcon={activeStep === 1 ? undefined : <ArrowForwardIcon />}
          onClick={handleNext}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1
          }}
        >
          {activeStep === 1 ? 'Kullanıcı Oluştur' : 'Devam Et'}
        </Button>
      </Box>
    </Paper>
  );
};

export default UserCreateForm;
