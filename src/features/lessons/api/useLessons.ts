import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../utils/api';

export interface Lesson {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    units: number;
  };
}

export interface Unit {
  id: string;
  lessonId: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    contents: number;
  };
}

export interface LessonFormData {
  name: string;
  displayOrder?: number;
  isActive: boolean;
}

export interface UnitFormData {
  lessonId: string;
  name: string;
  displayOrder?: number;
  isActive: boolean;
}

// Tüm dersleri getiren hook
export const useLessons = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/lessons`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Dersler yüklenirken hata oluştu');
      }

      const data = await response.json();
      setLessons(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { lessons, loading, error, refetch: fetchLessons };
};

// Tek bir dersi ID ile getir
export const getLessonById = async (id: string): Promise<Lesson> => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Ders yüklenirken hata oluştu');
  }

  const data = await response.json();
  return data.data;
};

// Ders API işlemleri
export const lessonApi = {
  // Yeni ders oluştur
  create: async (lessonData: LessonFormData): Promise<Lesson> => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/lessons`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ders oluşturulurken hata oluştu');
    }

    const data = await response.json();
    return data.data;
  },

  // Ders güncelle
  update: async (id: string, lessonData: LessonFormData): Promise<Lesson> => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ders güncellenirken hata oluştu');
    }

    const data = await response.json();
    return data.data;
  },

  // Ders sil
  delete: async (id: string): Promise<void> => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ders silinirken hata oluştu');
    }
  },

  // Ders durumunu değiştir
  toggleStatus: async (id: string): Promise<Lesson> => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/lessons/${id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ders durumu değiştirilirken hata oluştu');
    }

    const data = await response.json();
    return data.data;
  },
};

// Tüm üniteleri getiren hook
export const useUnits = (lessonId?: string) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const url = lessonId 
        ? `${API_BASE_URL}/units?lessonId=${lessonId}`
        : `${API_BASE_URL}/units`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Üniteler yüklenirken hata oluştu');
      }

      const data = await response.json();
      setUnits(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  return { units, loading, error, refetch: fetchUnits };
};

// Tek bir üniteyi ID ile getir
export const getUnitById = async (id: string): Promise<Unit> => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/units/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Ünite yüklenirken hata oluştu');
  }

  const data = await response.json();
  return data.data;
};

// Belirli bir derse ait üniteleri getir
export const getUnitsByLessonId = async (lessonId: string): Promise<Unit[]> => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/units/lesson/${lessonId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Üniteler yüklenirken hata oluştu');
  }

  const data = await response.json();
  return data.data || [];
};

// Ünite API işlemleri
export const unitApi = {
  // Yeni ünite oluştur
  create: async (unitData: UnitFormData): Promise<Unit> => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/units`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unitData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ünite oluşturulurken hata oluştu');
    }

    const data = await response.json();
    return data.data;
  },

  // Ünite güncelle
  update: async (id: string, unitData: UnitFormData): Promise<Unit> => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/units/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unitData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ünite güncellenirken hata oluştu');
    }

    const data = await response.json();
    return data.data;
  },

  // Ünite sil
  delete: async (id: string): Promise<void> => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/units/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ünite silinirken hata oluştu');
    }
  },

  // Ünite durumunu değiştir
  toggleStatus: async (id: string): Promise<Unit> => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/units/${id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ünite durumu değiştirilirken hata oluştu');
    }

    const data = await response.json();
    return data.data;
  },
};
