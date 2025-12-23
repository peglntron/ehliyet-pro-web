import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export interface City {
  id: number;
  plateCode: number;
  name: string;
  districtCount?: number;
}

export interface District {
  id: number;
  name: string;
  cityId: number;
}

export interface CityWithDistricts extends City {
  districts: District[];
}

export const useLocations = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Tüm illeri getir
  const fetchCities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/locations/cities`);
      if (response.data.success) {
        setCities(response.data.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'İller yüklenirken hata oluştu';
      setError(errorMessage);
      console.error('İller yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // İlçeleri getir (cityId'ye göre)
  const fetchDistricts = useCallback(async (cityId: number): Promise<District[]> => {
    try {
      const response = await axios.get(`${API_URL}/api/locations/cities/${cityId}/districts`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (err: any) {
      console.error('İlçeler yüklenirken hata:', err);
      throw new Error(err.response?.data?.message || 'İlçeler yüklenirken hata oluştu');
    }
  }, []);

  // Plaka koduna göre il getir
  const fetchCityByPlateCode = useCallback(async (plateCode: number): Promise<CityWithDistricts | null> => {
    try {
      const response = await axios.get(`${API_URL}/api/locations/cities/plate/${plateCode}`);
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (err: any) {
      console.error('İl yüklenirken hata:', err);
      throw new Error(err.response?.data?.message || 'İl yüklenirken hata oluştu');
    }
  }, []);

  return {
    cities,
    loading,
    error,
    fetchCities,
    fetchDistricts,
    fetchCityByPlateCode
  };
};
