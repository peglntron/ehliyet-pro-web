import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiClient, type User, type ApiResponse, API_BASE_URL } from '../utils/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  companyId: string | null; // Kullanıcının şirket ID'si
  isSystemAdmin: boolean; // Sistem admin kontrolü
  isCompanyUser: boolean; // Şirket kullanıcısı kontrolü
  loginPhone: (phone: string) => Promise<{ companyName?: string; smsCode?: string }>;
  verifyCode: (phone: string, code: string) => Promise<void>;
  loginAdmin: (phone: string, password: string) => Promise<void>;
  requestPasswordReset: (phone: string) => Promise<{ resetCode?: string }>;
  resetPassword: (phone: string, code: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('token')); // Token varsa loading true
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && !!token;
  const companyId = user?.companyId || null;
  const isSystemAdmin = user?.role === 'ADMIN';
  const isCompanyUser = user?.role === 'COMPANY_ADMIN' || user?.role === 'COMPANY_USER' || user?.role === 'INSTRUCTOR';

  // Check if user is logged in on mount
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const data: ApiResponse<User> = await apiClient.get('/auth/profile');
      if (data.success) {
        setUser(data.data!);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const loginPhone = async (phone: string): Promise<{ companyName?: string; smsCode?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      // Her zaman +90 prefix'i ekle (kullanıcı 5XXXXXXXXX girer)
      const formattedPhone = `+90${phone}`;
      
      // Get company info from backend
      const response = await fetch(`${API_BASE_URL}/auth/company-info?phone=${formattedPhone}`);
      const data = await response.json();
      
      if (data.success) {
        // Backend'de gerçek SMS sistemi olmadığı için şimdilik mock kod döndürüyoruz
        return {
          companyName: data.data.companyName,
          smsCode: '123456' // Mock SMS kodu
        };
      } else {
        throw new Error(data.message || 'Telefon numarası bulunamadı');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Telefon numarası kontrol edilemedi';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (phone: string, code: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Her zaman +90 prefix'i ekle (kullanıcı 5XXXXXXXXX girer)
      const formattedPhone = `+90${phone}`;
      
      // Backend login API'sini kullan (şimdilik kod yerine password olarak geçiriyoruz)
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: formattedPhone, password: code })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const { user, tokens } = data.data;
        setUser(user);
        setToken(tokens.accessToken);
        localStorage.setItem('token', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
      } else {
        throw new Error(data.message || 'Giriş başarısız');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Giriş başarısız';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (phone: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Her zaman +90 prefix'i ekle (kullanıcı 5XXXXXXXXX girer)
      const formattedPhone = `+90${phone}`;
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: formattedPhone, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const { user, tokens } = data.data;
        setUser(user);
        setToken(tokens.accessToken);
        localStorage.setItem('token', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
      } else {
        throw new Error(data.message || 'Admin girişi başarısız');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Admin girişi başarısız';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Backend logout endpoint'ini çağır
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Local state'i temizle
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setError(null);
    }
  };

  const requestPasswordReset = async (phone: string): Promise<{ resetCode?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      const formattedPhone = `+90${phone}`;
      
      const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: formattedPhone })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return {
          // resetCode: data.data.resetCode // Development only - commented out
        };
      } else {
        throw new Error(data.message || 'Şifre sıfırlama talebi başarısız');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Şifre sıfırlama talebi başarısız';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (phone: string, code: string, newPassword: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const formattedPhone = `+90${phone}`;
      
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: formattedPhone, code, newPassword })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Şifre sıfırlama başarısız');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Şifre sıfırlama başarısız';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      companyId,
      isSystemAdmin,
      isCompanyUser,
      loginPhone,
      verifyCode,
      loginAdmin,
      requestPasswordReset,
      resetPassword,
      logout,
      loading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};