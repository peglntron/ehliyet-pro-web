import { useState, useEffect } from 'react';
import { trafficSignApi, getImageUrl } from '../../../utils/api';
import type { TrafficSign, TrafficSignCategory } from '../types/types';

// Kategorileri veritabanından çekiyoruz artık
export const useTrafficSignCategories = () => {
  const [categories, setCategories] = useState<TrafficSignCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await trafficSignApi.getCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        } else {
          setError(response.message || 'Failed to fetch categories');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
};

// ID'ye göre kategori adını bulan yardımcı fonksiyon
export const getCategoryNameById = (categoryId: string, categories: TrafficSignCategory[]): string => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : "Bilinmeyen Kategori";
};

// Tüm trafik işaretlerini getiren hook
export const useTrafficSigns = (categoryId?: string, isActive?: boolean) => {
  const [trafficSigns, setTrafficSigns] = useState<TrafficSign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrafficSigns = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await trafficSignApi.getAll(categoryId, isActive);
        if (response.success && response.data) {
          // Resim URL'lerini düzelt
          const signsWithCorrectUrls = response.data.map(sign => ({
            ...sign,
            imageUrl: sign.imageUrl ? getImageUrl(sign.imageUrl) : undefined
          }));
          setTrafficSigns(signsWithCorrectUrls);
        } else {
          setError(response.message || 'Failed to fetch traffic signs');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrafficSigns();
  }, [categoryId, isActive]);

  return { trafficSigns, isLoading, error, refetch: () => {
    const fetchTrafficSigns = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await trafficSignApi.getAll(categoryId, isActive);
        if (response.success && response.data) {
          const signsWithCorrectUrls = response.data.map(sign => ({
            ...sign,
            imageUrl: sign.imageUrl ? getImageUrl(sign.imageUrl) : undefined
          }));
          setTrafficSigns(signsWithCorrectUrls);
        } else {
          setError(response.message || 'Failed to fetch traffic signs');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrafficSigns();
  }};
};

// Belirli bir trafik işaretini ID'ye göre getiren fonksiyon
export const getTrafficSignById = async (id: string): Promise<TrafficSign> => {
  try {
    const response = await trafficSignApi.getById(id);
    if (response.success && response.data) {
      // Resim URL'ini düzelt
      const signWithCorrectUrl = {
        ...response.data,
        imageUrl: response.data.imageUrl ? getImageUrl(response.data.imageUrl) : undefined
      };
      return signWithCorrectUrl;
    } else {
      throw new Error(response.message || 'Trafik işareti bulunamadı');
    }
  } catch (error) {
    throw error;
  }
};

// Yeni trafik işareti ekleyen fonksiyon
export const addTrafficSign = async (trafficSign: Omit<TrafficSign, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'>): Promise<TrafficSign> => {
  try {
    const response = await trafficSignApi.create(trafficSign);
    if (response.success && response.data) {
      // Resim URL'ini düzelt
      const signWithCorrectUrl = {
        ...response.data,
        imageUrl: response.data.imageUrl ? getImageUrl(response.data.imageUrl) : undefined
      };
      return signWithCorrectUrl;
    } else {
      throw new Error(response.message || 'Trafik işareti oluşturulamadı');
    }
  } catch (error) {
    throw error;
  }
};

// Trafik işareti güncelleyen fonksiyon
export const updateTrafficSign = async (id: string, trafficSign: Partial<TrafficSign>): Promise<TrafficSign> => {
  try {
    const response = await trafficSignApi.update(id, trafficSign);
    if (response.success && response.data) {
      // Resim URL'ini düzelt
      const signWithCorrectUrl = {
        ...response.data,
        imageUrl: response.data.imageUrl ? getImageUrl(response.data.imageUrl) : undefined
      };
      return signWithCorrectUrl;
    } else {
      throw new Error(response.message || 'Trafik işareti güncellenemedi');
    }
  } catch (error) {
    throw error;
  }
};
