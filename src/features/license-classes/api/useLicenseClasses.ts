import { useState, useEffect } from 'react';
import type { LicenseClass } from '../types/types';

// API base URL
const API_BASE_URL = '/api';

// API utility functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Mock ehliyet sınıfları verileri (fallback için)
const mockLicenseClasses: LicenseClass[] = [
  {
    id: '1',
    type: 'M',
    vehicle: 'Moped, Motorlu Bisiklet',
    minAge: 16,
    scope: '-',
    renewalPeriod: 10,
    experienceRequired: '-',
    description: '* Silindir; Max 50 m3 / Güç; Max 4 kw / Hız; Max 45 km/h / 2-3-4 Tekerlekli Olabilir',
    color: '#FDFFB0',
    iconUrl: '/uploads/license_classes/m.png',
    isActive: true,
    createdAt: '2023-01-10T08:30:00Z',
    updatedAt: '2023-01-10T08:30:00Z'
  },
  {
    id: '2',
    type: 'A1',
    vehicle: 'Motosiklet',
    minAge: 16,
    scope: 'M',
    renewalPeriod: 10,
    experienceRequired: '-',
    description: '* Silindir; Max 125m3 / Güç; Max 11kw - 14hp / Güç Ağırlık Oranı; 0,1 Altında',
    color: '#FDFFB0',
    iconUrl: '/uploads/license_classes/a1.png',
    isActive: true,
    createdAt: '2023-01-11T09:15:00Z',
    updatedAt: '2023-01-11T09:15:00Z'
  },
  {
    id: '3',
    type: 'A2',
    vehicle: 'Motosiklet',
    minAge: 18,
    scope: 'M + A1',
    renewalPeriod: 10,
    experienceRequired: '-',
    description: '* Silindir; Max 600m3 / Güç; Max 35kw - 47hp / Güç Ağırlık Oranı; 0,2 Altında',
    color: '#FDFFB0',
    iconUrl: '/uploads/license_classes/a2.png',
    isActive: true,
    createdAt: '2023-01-12T10:20:00Z',
    updatedAt: '2023-01-12T10:20:00Z'
  },
  {
    id: '4',
    type: 'A',
    vehicle: 'Motosiklet',
    minAge: 20,
    scope: 'M + A1 + A2',
    renewalPeriod: 10,
    experienceRequired: '24 yaş altında iseniz en az 2 yıllık A2 sınıfına sahip olmalısınız',
    description: '* 2-3 Tekerlekli Olabilir',
    color: '#FDFFB0',
    iconUrl: '/uploads/license_classes/a.png',
    isActive: true,
    createdAt: '2023-01-13T11:25:00Z',
    updatedAt: '2023-01-13T11:25:00Z'
  },
  {
    id: '5',
    type: 'B1',
    vehicle: '4 Tekerli Motosiklet, ATV',
    minAge: 16,
    scope: 'M',
    renewalPeriod: 10,
    experienceRequired: '-',
    description: '* Güç; Max 15 kw / Ağırlık; Max 400 kg / Yük Taşımacılığında Ağırlık; Max 550 kg',
    color: '#FDFFB0',
    iconUrl: '/uploads/license_classes/b1.png',
    isActive: true,
    createdAt: '2023-01-14T12:30:00Z',
    updatedAt: '2023-01-14T12:30:00Z'
  },
  {
    id: '6',
    type: 'B',
    vehicle: 'Otomobil, Kamyonet',
    minAge: 18,
    scope: 'M + B1 + F',
    renewalPeriod: 10,
    experienceRequired: '-',
    description: '* Ağırlık; Max 3500 kg / Koltuk; Max 8+1 / Römork; Max 750 kg',
    color: '#CFF9FF',
    iconUrl: '/uploads/license_classes/b.png',
    isActive: true,
    createdAt: '2023-01-15T13:35:00Z',
    updatedAt: '2023-01-15T13:35:00Z'
  },  
  {
    id: '7',
    type: 'B-Otomatik',
    vehicle: 'Otomatik Otomobil, Kamyonet',
    minAge: 18,
    scope: 'M + B1 + F',
    renewalPeriod: 10,
    experienceRequired: '-',
    description: '* Ağırlık; Max 3500 kg / Koltuk; Max 8+1 / Römork; Max 750 kg',
    color: '#CFF9FF',
    iconUrl: '/uploads/license_classes/b.png',
    isActive: true,
    createdAt: '2023-01-15T13:35:00Z',
    updatedAt: '2023-01-15T13:35:00Z'
  },
  {
    id: '8',
    type: 'BE',
    vehicle: 'Römorklu (Otomobil, Kamyonet)',
    minAge: 18,
    scope: 'M + B1 + B + F',
    renewalPeriod: 10,
    experienceRequired: 'En az B Sınıfı',
    description: '* Ağırlık; Max 3500 kg / Koltuk; Max 8+1 / Katar; Max 4250 kg',
    color: '#CFF9FF',
    iconUrl: '/uploads/license_classes/be.png',
    isActive: true,
    createdAt: '2023-01-16T14:40:00Z',
    updatedAt: '2023-01-16T14:40:00Z'
  },
  {
    id: '9',
    type: 'C1',
    vehicle: 'Kamyon, Çekici',
    minAge: 18,
    scope: 'M + B1 + B + F',
    renewalPeriod: 5,
    experienceRequired: 'En az B Sınıfı',
    description: '* Ağırlık; 3500 kg 7500 kg aralığında / Römork; Max 750 kg',
    color: '#C1FF72',
    iconUrl: '/uploads/license_classes/c1.png',
    isActive: true,
    createdAt: '2023-01-17T15:45:00Z',
    updatedAt: '2023-01-17T15:45:00Z'
  },
  {
    id: '10',
    type: 'C1E',
    vehicle: 'Römorklu (Kamyon, Çekici)',
    minAge: 18,
    scope: 'M + B1 + B + BE + C1 + F',
    renewalPeriod: 5,
    experienceRequired: 'En az C1 Sınıfı',
    description: '* Ağırlık; 3500 kg - 7500 kg aralığında / Katar; Max 12000 kg (12ton)',
    color: '#C1FF72',
    iconUrl: '/uploads/license_classes/c1e.png',
    isActive: true,
    createdAt: '2023-01-18T16:50:00Z',
    updatedAt: '2023-01-18T16:50:00Z'
  },
  {
    id: '11',
    type: 'C',
    vehicle: 'Kamyon, Çekici',
    minAge: 21,
    scope: 'M + B1 + B + C1 + F',
    renewalPeriod: 5,
    experienceRequired: 'En az B Sınıfı',
    description: '* Römork; Max 750 kg',
    color: '#C1FF72',
    iconUrl: '/uploads/license_classes/c.png',
    isActive: true,
    createdAt: '2023-01-19T17:55:00Z',
    updatedAt: '2023-01-19T17:55:00Z'
  },
  {
    id: '12',
    type: 'CE',
    vehicle: 'Römorklu (Kamyon, Çekici)',
    minAge: 21,
    scope: 'M + B1 + B + BE + C1 + C1E + C + F',
    renewalPeriod: 5,
    experienceRequired: 'En az C Sınıfı',
    description: '',
    color: '#C1FF72',
    iconUrl: '/uploads/license_classes/ce.png',
    isActive: true,
    createdAt: '2023-01-20T18:00:00Z',
    updatedAt: '2023-01-20T18:00:00Z'
  },
  {
    id: '13',
    type: 'D1',
    vehicle: 'Minibüs',
    minAge: 21,
    scope: 'M + B1 + B + F',
    renewalPeriod: 5,
    experienceRequired: 'En az B Sınıfı',
    description: '* Koltuk; 16+1 / Römork; Max 750 kg',
    color: '#E0EFE6',
    iconUrl: '/uploads/license_classes/d1.png',
    isActive: true,
    createdAt: '2023-01-21T19:05:00Z',
    updatedAt: '2023-01-21T19:05:00Z'
  },
  {
    id: '14',
    type: 'D1E',
    vehicle: 'Römorklu Minibüs',
    minAge: 21,
    scope: 'M + B1 + B + BE + D1 + F',
    renewalPeriod: 5,
    experienceRequired: 'En az D1 Sınıfı',
    description: '* Koltuk; Max 16+1 / Katar; 12000 kg (12 ton)',
    color: '#E0EFE6',
    iconUrl: '/uploads/license_classes/d1e.png',
    isActive: true,
    createdAt: '2023-01-22T20:10:00Z',
    updatedAt: '2023-01-22T20:10:00Z'
  },
  {
    id: '15',
    type: 'D',
    vehicle: 'Otobüs',
    minAge: 24,
    scope: 'M + B1 + B + D1 + F',
    renewalPeriod: 5,
    experienceRequired: 'En az B Sınıfı',
    description: '* Römork; Max 750 kg',
    color: '#E0EFE6',
    iconUrl: '/uploads/license_classes/d.png',
    isActive: true,
    createdAt: '2023-01-23T21:15:00Z',
    updatedAt: '2023-01-23T21:15:00Z'
  },
  {
    id: '16',
    type: 'DE',
    vehicle: 'Römorklu Otobüs',
    minAge: 24,
    scope: 'M + B1 + B + BE + D1 + D1E + D + F',
    renewalPeriod: 5,
    experienceRequired: 'En az D Sınıfı',
    description: '',
    color: '#E0EFE6',
    iconUrl: '/uploads/license_classes/de.png',
    isActive: true,
    createdAt: '2023-01-24T22:20:00Z',
    updatedAt: '2023-01-24T22:20:00Z'
  },
  {
    id: '17',
    type: 'F',
    vehicle: 'Traktör',
    minAge: 18,
    scope: 'M',
    renewalPeriod: 10,
    experienceRequired: '-',
    description: '',
    color: '#FFB2B2',
    iconUrl: '/uploads/license_classes/f.png',
    isActive: true,
    createdAt: '2023-01-25T23:25:00Z',
    updatedAt: '2023-01-25T23:25:00Z'
  }
];

// API functions
export const fetchLicenseClassesApi = async (): Promise<LicenseClass[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/license-classes`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await handleApiResponse(response);
    
    // Backend'den gelen veriyi frontend tipine dönüştür
    return data.data.map((item: any): LicenseClass => ({
      id: item.id,
      type: item.tip,
      vehicle: item.arac,
      minAge: item.yas,
      scope: item.kapsam,
      renewalPeriod: item.degisim_suresi,
      experienceRequired: item.tecrube_sarti,
      description: item.icerik || '',
      color: item.renk,
      iconUrl: item.ikon_url || '',
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  } catch (error) {
    console.error('Failed to fetch license classes:', error);
    // Fallback to mock data if API fails
    return mockLicenseClasses;
  }
};

// Tüm ehliyet sınıflarını getiren hook
export const useLicenseClasses = (): { data: LicenseClass[]; loading: boolean; error: string | null } => {
  const [licenseClasses, setLicenseClasses] = useState<LicenseClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLicenseClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchLicenseClassesApi();
        setLicenseClasses(data);
      } catch (error) {
        console.error('Error fetching license classes:', error);
        setError(error instanceof Error ? error.message : 'Veriler yüklenirken bir hata oluştu');
        // Use mock data as fallback
        setLicenseClasses(mockLicenseClasses);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLicenseClasses();
  }, []);
  
  return { data: licenseClasses, loading, error };
};

// Belirli bir ehliyet sınıfını ID'ye göre getiren fonksiyon
export const getLicenseClassById = async (id: string): Promise<LicenseClass> => {
  try {
    const response = await fetch(`${API_BASE_URL}/license-classes/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await handleApiResponse(response);
    const item = data.data;
    
    // Backend'den gelen veriyi frontend tipine dönüştür
    return {
      id: item.id,
      type: item.tip,
      vehicle: item.arac,
      minAge: item.yas,
      scope: item.kapsam,
      renewalPeriod: item.degisim_suresi,
      experienceRequired: item.tecrube_sarti,
      description: item.icerik || '',
      color: item.renk,
      iconUrl: item.ikon_url || '',
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  } catch (error) {
    console.error('Failed to fetch license class:', error);
    // Fallback to mock data
    const licenseClass = mockLicenseClasses.find(lc => lc.id === id);
    if (licenseClass) {
      return licenseClass;
    }
    throw new Error('Ehliyet sınıfı bulunamadı');
  }
};

// Yeni ehliyet sınıfı ekleyen fonksiyon
export const addLicenseClass = async (licenseClass: Omit<LicenseClass, 'id' | 'createdAt' | 'updatedAt'>): Promise<LicenseClass> => {
  try {
    // Frontend tipini backend tipine dönüştür
    const backendData = {
      tip: licenseClass.type,
      arac: licenseClass.vehicle,
      yas: licenseClass.minAge,
      kapsam: licenseClass.scope,
      degisim_suresi: licenseClass.renewalPeriod,
      tecrube_sarti: licenseClass.experienceRequired,
      icerik: licenseClass.description,
      renk: licenseClass.color,
      ikon_url: licenseClass.iconUrl,
      isActive: licenseClass.isActive
    };
    
    const response = await fetch(`${API_BASE_URL}/license-classes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(backendData),
    });
    
    const data = await handleApiResponse(response);
    const item = data.data;
    
    // Backend'den gelen veriyi frontend tipine dönüştür
    return {
      id: item.id,
      type: item.tip,
      vehicle: item.arac,
      minAge: item.yas,
      scope: item.kapsam,
      renewalPeriod: item.degisim_suresi,
      experienceRequired: item.tecrube_sarti,
      description: item.icerik || '',
      color: item.renk,
      iconUrl: item.ikon_url || '',
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  } catch (error) {
    console.error('Failed to add license class:', error);
    throw new Error('Ehliyet sınıfı eklenemedi');
  }
};

// Ehliyet sınıfı güncelleyen fonksiyon
export const updateLicenseClass = async (id: string, licenseClass: Partial<LicenseClass>): Promise<LicenseClass> => {
  try {
    // Frontend tipini backend tipine dönüştür (sadece güncellenen alanlar)
    const backendData: any = {};
    if (licenseClass.type !== undefined) backendData.tip = licenseClass.type;
    if (licenseClass.vehicle !== undefined) backendData.arac = licenseClass.vehicle;
    if (licenseClass.minAge !== undefined) backendData.yas = licenseClass.minAge;
    if (licenseClass.scope !== undefined) backendData.kapsam = licenseClass.scope;
    if (licenseClass.renewalPeriod !== undefined) backendData.degisim_suresi = licenseClass.renewalPeriod;
    if (licenseClass.experienceRequired !== undefined) backendData.tecrube_sarti = licenseClass.experienceRequired;
    if (licenseClass.description !== undefined) backendData.icerik = licenseClass.description;
    if (licenseClass.color !== undefined) backendData.renk = licenseClass.color;
    if (licenseClass.iconUrl !== undefined) backendData.ikon_url = licenseClass.iconUrl;
    if (licenseClass.isActive !== undefined) backendData.isActive = licenseClass.isActive;
    
    const response = await fetch(`${API_BASE_URL}/license-classes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(backendData),
    });
    
    const data = await handleApiResponse(response);
    const item = data.data;
    
    // Backend'den gelen veriyi frontend tipine dönüştür
    return {
      id: item.id,
      type: item.tip,
      vehicle: item.arac,
      minAge: item.yas,
      scope: item.kapsam,
      renewalPeriod: item.degisim_suresi,
      experienceRequired: item.tecrube_sarti,
      description: item.icerik || '',
      color: item.renk,
      iconUrl: item.ikon_url || '',
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  } catch (error) {
    console.error('Failed to update license class:', error);
    throw new Error('Ehliyet sınıfı güncellenemedi');
  }
};

// Ehliyet sınıfı silen fonksiyon
export const deleteLicenseClass = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/license-classes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    await handleApiResponse(response);
  } catch (error) {
    console.error('Failed to delete license class:', error);
    throw new Error('Ehliyet sınıfı silinemedi');
  }
};

// Ehliyet sınıfı ikonu yükleyen fonksiyon
export const uploadLicenseClassIcon = async (file: File, licenseClassId: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('icon', file);
    formData.append('licenseClassId', licenseClassId);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/license-classes/upload-icon`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData,
    });
    
    const data = await handleApiResponse(response);
    return data.data.iconUrl;
  } catch (error) {
    console.error('Failed to upload icon:', error);
    throw new Error('İkon yüklenemedi');
  }
};
