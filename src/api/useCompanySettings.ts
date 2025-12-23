import { useState } from 'react';

export interface CompanySettings {
  id: string;
  companyId: string;
  writtenExamMaxAttempts: number;
  drivingExamMaxAttempts: number;
  drivingExamGoogleMapLink?: string;
  defaultCoursePrice: number;
  defaultWrittenExamPrice?: number;
  defaultDrivingExamPrice: number;
  drivingExamFailLessonCount: number;
  autoCreateUserForStudent: boolean;
  allowInstructorTransfer: boolean;
  balanceGenderDistribution: boolean;
  minDrivingLessons: number;
  enableInstallmentPayments: boolean;
  maxInstallmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export const useCompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/settings/company-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Ayarlar yüklenemedi');
      const data = await response.json();
      setSettings(data.settings);
      return data.settings;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updatedSettings: Partial<CompanySettings>) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/settings/company-settings`, {
          method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedSettings)
      });

      if (!response.ok) throw new Error('Ayarlar güncellenemedi');
      const data = await response.json();
      setSettings(data.settings);
      return data.settings;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings
  };
};
