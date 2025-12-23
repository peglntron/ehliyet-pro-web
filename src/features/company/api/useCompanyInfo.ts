import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Company, PhoneInfo, IbanInfo } from '../types/types';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api`;

// API için auth token'ı al
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Company bilgilerini getir
export const useCompanyInfo = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: getAuthHeaders()
      });

      if (response.data.success && response.data.data.company) {
        const companyData = response.data.data.company;
        
        // API'den gelen veriyi frontend formatına dönüştür
        const formattedCompany: Company = {
          id: companyData.id,
          name: companyData.name,
          address: companyData.address || '',
          district: companyData.district || '',
          province: companyData.province || '',
          phone: companyData.phone || '',
          owner: companyData.owner || '',
          authorizedPerson: companyData.authorizedPerson || '',
          registrationDate: companyData.registrationDate || new Date().toISOString(),
          licenseEndDate: companyData.licenseEndDate || new Date().toISOString(),
          createdAt: companyData.createdAt,
          updatedAt: companyData.updatedAt,
          isActive: companyData.isActive,
          logo: companyData.logo || '',
          email: companyData.email || '',
          website: companyData.website || '',
          description: companyData.description || '',
          phones: companyData.phones || [],
          ibans: companyData.ibans || [],
          location: {
            latitude: companyData.latitude || '',
            longitude: companyData.longitude || '',
            mapLink: companyData.mapLink || ''
          }
        };

        setCompany(formattedCompany);
      } else {
        setError('Şirket bilgileri alınamadı');
      }
    } catch (err) {
      console.error('Company info fetch error:', err);
      setError('Şirket bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  return {
    company,
    loading,
    error,
    refetch: fetchCompanyInfo
  };
};

// Company temel bilgilerini güncelle
export const useUpdateCompanyInfo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCompanyInfo = async (companyData: Partial<Company>) => {
    try {
      setLoading(true);
      setError(null);

      // API formatına dönüştür
      const updateData = {
        name: companyData.name,
        address: companyData.address,
        district: companyData.district,
        province: companyData.province,
        phone: companyData.phone,
        email: companyData.email,
        owner: companyData.owner,
        authorizedPerson: companyData.authorizedPerson,
        registrationDate: companyData.registrationDate,
        licenseEndDate: companyData.licenseEndDate,
        logo: companyData.logo,
        website: companyData.website,
        description: companyData.description,
        latitude: companyData.location?.latitude,
        longitude: companyData.location?.longitude,
        mapLink: companyData.location?.mapLink
      };

      const response = await axios.put(`${API_BASE_URL}/auth/company-profile`, updateData, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data; // Backend'de data olarak dönüyor
      } else {
        throw new Error(response.data.message || 'Güncelleme başarısız');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Güncelleme sırasında hata oluştu';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    updateCompanyInfo,
    loading,
    error
  };
};

// Phone CRUD operations
export const useCompanyPhones = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPhone = async (phoneData: Omit<PhoneInfo, 'id'>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/company-resources/phones`, phoneData, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.phone;
      } else {
        throw new Error(response.data.message || 'Telefon ekleme başarısız');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Telefon eklenirken hata oluştu';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updatePhone = async (phoneId: string, phoneData: Partial<PhoneInfo>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(`${API_BASE_URL}/company-resources/phones/${phoneId}`, phoneData, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.phone;
      } else {
        throw new Error(response.data.message || 'Telefon güncelleme başarısız');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Telefon güncellenirken hata oluştu';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deletePhone = async (phoneId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(`${API_BASE_URL}/company-resources/phones/${phoneId}`, {
        headers: getAuthHeaders()
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Telefon silme başarısız');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Telefon silinirken hata oluştu';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    addPhone,
    updatePhone,
    deletePhone,
    loading,
    error
  };
};

// IBAN CRUD operations
export const useCompanyIbans = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addIban = async (ibanData: Omit<IbanInfo, 'id'>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/company-resources/ibans`, ibanData, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.iban;
      } else {
        throw new Error(response.data.message || 'IBAN ekleme başarısız');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'IBAN eklenirken hata oluştu';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateIban = async (ibanId: string, ibanData: Partial<IbanInfo>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(`${API_BASE_URL}/company-resources/ibans/${ibanId}`, ibanData, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.iban;
      } else {
        throw new Error(response.data.message || 'IBAN güncelleme başarısız');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'IBAN güncellenirken hata oluştu';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteIban = async (ibanId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(`${API_BASE_URL}/company-resources/ibans/${ibanId}`, {
        headers: getAuthHeaders()
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'IBAN silme başarısız');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'IBAN silinirken hata oluştu';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    addIban,
    updateIban,
    deleteIban,
    loading,
    error
  };
};