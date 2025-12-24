import { useState } from 'react';

export interface NotificationSettings {
  id: string;
  companyId: string;
  autoNotificationsEnabled: boolean;
  examReminderEnabled: boolean;
  examReminderDaysBefore: number;
  examReminderOnDay: boolean;
  examReminderTime: string;
  paymentReminderEnabled: boolean;
  paymentReminderDaysBefore: number;
  paymentReminderOnDay: boolean;
  paymentReminderTime: string;
  lessonReminderEnabled: boolean;
  lessonReminderHoursBefore: number;
  lessonReminderTime: string;
  createdAt: string;
  updatedAt: string;
}

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/notification-settings`, {
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

  const updateSettings = async (updatedSettings: Partial<NotificationSettings>) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/notification-settings`, {
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
