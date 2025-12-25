import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import type { UserPermissions } from '../types/permissions';
import { DEFAULT_USER_PERMISSIONS } from '../types/permissions';
import axios from 'axios';

interface PermissionsContextType {
  permissions: UserPermissions;
  loading: boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_USER_PERMISSIONS);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    console.log('[PermissionsContext] fetchPermissions called, user:', user?.role);
    setLoading(true); // Her zaman loading'i true yap
    
    // ADMIN ve INSTRUCTOR için yetkiler gerekmez
    if (!user || user.role === 'ADMIN' || user.role === 'INSTRUCTOR') {
      console.log('[PermissionsContext] ADMIN/INSTRUCTOR or no user, setting defaults');
      setPermissions(DEFAULT_USER_PERMISSIONS);
      setLoading(false);
      return;
    }

    // COMPANY_ADMIN - Tüm yetkiler açık
    if (user.role === 'COMPANY_ADMIN') {
      console.log('[PermissionsContext] COMPANY_ADMIN detected, setting all permissions');
      setPermissions({
        canViewReports: true,
        canViewExpenses: true,
        canManageMatching: true,
        canViewInstructorDetails: true,
        canManageVehicles: true,
        canViewNotifications: true,
        canManageStudents: true,
        canViewDrivingLessons: true,
        canViewDashboard: true,
        canAccessSettings: true,
      });
      setLoading(false);
      return;
    }

    // COMPANY_USER - API'den çek
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get('/api/companies/screen-permissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPermissions(response.data || DEFAULT_USER_PERMISSIONS);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions(DEFAULT_USER_PERMISSIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[PermissionsContext] useEffect triggered, user changed:', user?.role, user?.id);
    // User tam yüklenene kadar bekle
    if (user !== undefined) {
      fetchPermissions();
    }
  }, [user?.id, user?.role]); // user.id ve role değişince tetikle

  return (
    <PermissionsContext.Provider value={{ 
      permissions, 
      loading, 
      refreshPermissions: fetchPermissions 
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionsProvider');
  }
  return context;
};
