import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../utils/api';

export interface UnitContent {
  id: string;
  unitId: string;
  title: string;
  content: string;
  displayOrder: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UnitContentFormData {
  unitId: string;
  title: string;
  content: string;
  displayOrder?: number;
  isActive: boolean;
}

// Bir üniteye ait içerikleri getir
export const useUnitContents = (unitId?: string) => {
  const [contents, setContents] = useState<UnitContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContents = async () => {
    if (!unitId) {
      setContents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/units/${unitId}/contents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('İçerikler yüklenirken hata oluştu');
      }

      const data = await response.json();
      setContents(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  return { contents, loading, error, refetch: fetchContents };
};

// Tek bir içeriği ID ile getir
export const getContentById = async (id: string): Promise<UnitContent> => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/units/contents/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('İçerik yüklenirken hata oluştu');
  }

  const data = await response.json();
  return data.data;
};

// Ünite içeriği API işlemleri
export const unitContentApi = {
  // Yeni içerik oluştur
  create: async (contentData: UnitContentFormData): Promise<UnitContent> => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/units/contents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'İçerik oluşturulurken hata oluştu');
    }

    const data = await response.json();
    return data.data;
  },

  // Toplu içerik oluştur
  bulkCreate: async (contents: UnitContentFormData[]): Promise<UnitContent[]> => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/units/contents/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'İçerikler oluşturulurken hata oluştu');
    }

    const data = await response.json();
    return data.data;
  },

  // İçerik güncelle
  update: async (id: string, contentData: UnitContentFormData): Promise<UnitContent> => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/units/contents/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'İçerik güncellenirken hata oluştu');
    }

    const data = await response.json();
    return data.data;
  },

  // İçerik sil
  delete: async (id: string): Promise<void> => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/units/contents/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'İçerik silinirken hata oluştu');
    }
  },

  // İçerik durumunu değiştir
  toggleStatus: async (id: string): Promise<UnitContent> => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/units/contents/${id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'İçerik durumu değiştirilirken hata oluştu');
    }

    const data = await response.json();
    return data.data;
  },
};
