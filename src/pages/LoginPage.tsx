import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Phone,
  Business,
  Visibility,
  VisibilityOff,
  Lock
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionsContext';
import { getDefaultRouteForRole } from '../utils/navigation';



const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginForm, setLoginForm] = useState({
    phone: '',
    password: ''
  });
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    phone: '',
    code: '',
    newPassword: ''
  });

  const { user, loginAdmin, requestPasswordReset, resetPassword, loading, error } = useAuth();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  // Role-based yönlendirme (permissions yüklendikten sonra)
  useEffect(() => {
    // User varsa VE permissions yüklenmiş ise (loading false ise) yönlendir
    if (user && !permissionsLoading) {
      // COMPANY_ADMIN için ekstra kontrol: permissions gerçekten yüklendi mi?
      // Eğer COMPANY_ADMIN ise canViewDashboard mutlaka true olmalı
      if (user.role === 'COMPANY_ADMIN' && !permissions.canViewDashboard) {
        console.log('[LoginPage] COMPANY_ADMIN but permissions not loaded yet, waiting...');
        return; // Henüz permissions yüklenmemiş, bekle
      }
      
      // Önceki sayfa kontrolü - eğer from "/" ise veya login sayfasıysa, default route'a git
      const fromPath = (location.state as any)?.from?.pathname;
      console.log('[LoginPage] fromPath:', fromPath, 'User role:', user.role);
      
      // Eğer from "/" veya "/login" ise, role-based default'a git
      const shouldUseDefault = !fromPath || fromPath === '/' || fromPath === '/login';
      const targetPath = shouldUseDefault 
        ? getDefaultRouteForRole(user.role, permissions)
        : fromPath;
      
      console.log('[LoginPage] Redirecting to:', targetPath, 'Role:', user.role, 'Permissions:', permissions);
      navigate(targetPath, { replace: true });
    }
  }, [user, permissions, permissionsLoading, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginAdmin(loginForm.phone, loginForm.password, rememberMe);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await requestPasswordReset(forgotPasswordForm.phone);
      // setResetCode(result.resetCode || ''); // Development only - commented out
      setShowResetForm(true);
      // Auto-fill code for testing - commented out
      // if (result.resetCode) {
      //   setForgotPasswordForm(prev => ({ ...prev, code: result.resetCode! }));
      // }
    } catch (error) {
      console.error('Request reset failed:', error);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(forgotPasswordForm.phone, forgotPasswordForm.code, forgotPasswordForm.newPassword);
      // Reset form and go back to login
      setShowForgotPassword(false);
      setShowResetForm(false);
      setForgotPasswordForm({ phone: '', code: '', newPassword: '' });
    } catch (error) {
      console.error('Reset password failed:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%),
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23ff6b35;stop-opacity:1" /><stop offset="100%" style="stop-color:%23f7931e;stop-opacity:1" /></linearGradient></defs><polygon fill="url(%23a)" points="0,1000 1000,1000 1000,0 0,200" opacity="0.8"/><polygon fill="url(%23a)" points="0,800 1000,600 1000,0 0,0" opacity="0.6"/></svg>')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at center, rgba(255, 107, 53, 0.1) 0%, rgba(247, 147, 30, 0.05) 70%, transparent 100%)',
          zIndex: 1
        }
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Paper
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 32px 64px rgba(0,0,0,0.3), 0 16px 32px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(45deg, #ff6b35 30%, #f7931e 90%)',
              color: 'white',
              p: 4,
              textAlign: 'center'
            }}
          >
            <Business sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              EhliyetPro
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
              Sürücü Kursu Yönetim Sistemi
            </Typography>
          </Box>

          {/* Login Form */}
          <Box sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Typography variant="h5" component="h2" sx={{ mb: 4, textAlign: 'center', fontWeight: 600 }}>
              Giriş Yap
            </Typography>

            <Box component="form" onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Telefon Numarası"
                value={loginForm.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value === '' || (value.startsWith('5') && value.length <= 10)) {
                    setLoginForm(prev => ({ ...prev, phone: value }));
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone color="action" />
                        <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
                          +90
                        </Typography>
                      </Box>
                    </InputAdornment>
                  ),
                }}
                placeholder="5551234567"
                helperText="5 ile başlayan 10 haneli telefon numarası"
                inputProps={{ maxLength: 10 }}
                sx={{ mb: 2 }}
                required
              />

              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label="Şifre"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder="Şifrenizi girin"
                sx={{ mb: 2 }}
                required
              />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <label htmlFor="rememberMe" style={{ cursor: 'pointer', fontSize: '14px' }}>
                  Beni Hatırla
                </label>
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #388E3C 30%, #689F38 90%)',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Giriş Yap'}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => setShowForgotPassword(true)}
                sx={{ mt: 2 }}
              >
                Şifremi Unuttum
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
              Yöneticiler ve eğitmenler için telefon ile giriş
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Şifremi Unuttum Dialog */}
      <Dialog open={showForgotPassword} onClose={() => {
        setShowForgotPassword(false);
        setShowResetForm(false);
        setForgotPasswordForm({ phone: '', code: '', newPassword: '' });
      }} maxWidth="sm" fullWidth>
        <DialogTitle>Şifremi Unuttum</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Test kodu gösterimi kaldırıldı */}
          {/* {resetCode && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Sıfırlama kodu: {resetCode} (Test için gösteriliyor)
            </Alert>
          )} */}

          {!showResetForm ? (
            <Box component="form" onSubmit={handleRequestReset} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Telefon Numarası"
                value={forgotPasswordForm.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value === '' || (value.startsWith('5') && value.length <= 10)) {
                    setForgotPasswordForm(prev => ({ ...prev, phone: value }));
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                      <Typography sx={{ ml: 1 }}>+90</Typography>
                    </InputAdornment>
                  ),
                }}
                placeholder="5551234567"
                helperText="Günde sadece 1 kez şifre sıfırlama talebi yapılabilir"
                inputProps={{ maxLength: 10 }}
                required
              />
            </Box>
          ) : (
            <Box component="form" onSubmit={handleResetPassword} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Sıfırlama Kodu"
                value={forgotPasswordForm.code}
                onChange={(e) => setForgotPasswordForm(prev => ({ ...prev, code: e.target.value }))}
                placeholder="6 haneli kod"
                inputProps={{ maxLength: 6 }}
                sx={{ mb: 2 }}
                required
              />

              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label="Yeni Şifre"
                value={forgotPasswordForm.newPassword}
                onChange={(e) => setForgotPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText="En az 6 karakter"
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowForgotPassword(false);
            setShowResetForm(false);
            setForgotPasswordForm({ phone: '', code: '', newPassword: '' });
          }}>
            İptal
          </Button>
          {!showResetForm ? (
            <Button onClick={handleRequestReset} variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Kod Gönder'}
            </Button>
          ) : (
            <Button onClick={handleResetPassword} variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Şifreyi Değiştir'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginPage;