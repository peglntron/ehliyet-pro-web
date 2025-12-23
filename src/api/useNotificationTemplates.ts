import { useState } from 'react';

export interface NotificationTemplate {
  id: string;
  companyId: string;
  targetType: 'COMPANY_STUDENT' | 'INSTRUCTOR';
  notificationType: 'GENERAL' | 'EXAM' | 'PAYMENT' | 'LESSON';
  name: string;
  title: string;
  content: string;
  triggerType: 'MANUAL' | 'AUTO';
  autoTriggerCondition: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplateCreate {
  targetType: 'COMPANY_STUDENT' | 'INSTRUCTOR';
  notificationType?: 'GENERAL' | 'EXAM' | 'PAYMENT' | 'LESSON';
  name: string;
  title: string;
  content: string;
  triggerType?: 'MANUAL' | 'AUTO';
  autoTriggerCondition?: string;
}

export interface NotificationTemplateUpdate {
  targetType?: 'COMPANY_STUDENT' | 'INSTRUCTOR';
  notificationType?: 'GENERAL' | 'EXAM' | 'PAYMENT' | 'LESSON';
  name?: string;
  title?: string;
  content?: string;
  triggerType?: 'MANUAL' | 'AUTO';
  autoTriggerCondition?: string;
  isActive?: boolean;
}

const API_BASE_URL = '/api/notification-templates';

export const useNotificationTemplates = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Tüm şablonları getir
  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Şablonlar getirilemedi');
      }

      const result = await response.json();
      if (result.success) {
        setTemplates(result.data.all || []);
        return result.data;
      } else {
        throw new Error(result.message || 'Şablonlar getirilemedi');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Yeni şablon oluştur
  const createTemplate = async (data: NotificationTemplateCreate): Promise<NotificationTemplate> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Şablon oluşturulamadı');
      }

      const result = await response.json();
      if (result.success) {
        await fetchTemplates(); // Listeyi yenile
        return result.data;
      } else {
        throw new Error(result.message || 'Şablon oluşturulamadı');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Şablonu güncelle
  const updateTemplate = async (id: string, data: NotificationTemplateUpdate): Promise<NotificationTemplate> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Şablon güncellenemedi');
      }

      const result = await response.json();
      if (result.success) {
        await fetchTemplates(); // Listeyi yenile
        return result.data;
      } else {
        throw new Error(result.message || 'Şablon güncellenemedi');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Şablon aktif/pasif toggle
  const toggleActive = async (id: string): Promise<NotificationTemplate> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Şablon durumu değiştirilemedi');
      }

      const result = await response.json();
      if (result.success) {
        await fetchTemplates(); // Listeyi yenile
        return result.data;
      } else {
        throw new Error(result.message || 'Şablon durumu değiştirilemedi');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Şablonu sil
  const deleteTemplate = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Şablon silinemedi');
      }

      const result = await response.json();
      if (result.success) {
        await fetchTemplates(); // Listeyi yenile
      } else {
        throw new Error(result.message || 'Şablon silinemedi');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Varsayılan şablonları oluştur
  const createDefaultTemplates = async (): Promise<NotificationTemplate[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/default`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Varsayılan şablonlar oluşturulamadı');
      }

      const result = await response.json();
      if (result.success) {
        await fetchTemplates(); // Listeyi yenile
        return result.data;
      } else {
        throw new Error(result.message || 'Varsayılan şablonlar oluşturulamadı');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    toggleActive,
    deleteTemplate,
    createDefaultTemplates
  };
};
