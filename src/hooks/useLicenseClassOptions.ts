import { useState, useEffect } from 'react';

export interface LicenseClassOption {
  value: string;     // "B" - ehliyet tipi string
  label: string;     // "B - Otomobil/Kamyonet" - görüntüleme için
  id: string;        // UUID - backend'e gönderilecek
}

const API_BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Fallback mock data (API başarısız olursa)
const mockLicenseOptions: LicenseClassOption[] = [
  { value: 'M', label: 'M - Moped, Motorlu Bisiklet', id: 'mock-m' },
  { value: 'A1', label: 'A1 - Motosiklet (125cc)', id: 'mock-a1' },
  { value: 'A2', label: 'A2 - Motosiklet (35kW)', id: 'mock-a2' },
  { value: 'A', label: 'A - Motosiklet', id: 'mock-a' },
  { value: 'B1', label: 'B1 - 4 Tekerli Motosiklet', id: 'mock-b1' },
  { value: 'B', label: 'B - Otomobil/Kamyonet', id: 'mock-b' },
  { value: 'B (Otomatik)', label: 'B (Otomatik) - Otomatik Otomobil', id: 'mock-b-otomatik' },
  { value: 'BE', label: 'BE - Römorklu Otomobil', id: 'mock-be' },
  { value: 'C1', label: 'C1 - Kamyon', id: 'mock-c1' },
  { value: 'C1E', label: 'C1E - Römorklu Kamyon', id: 'mock-c1e' },
  { value: 'C', label: 'C - Kamyon', id: 'mock-c' },
  { value: 'CE', label: 'CE - Römorklu Kamyon', id: 'mock-ce' },
  { value: 'D1', label: 'D1 - Minibüs', id: 'mock-d1' },
  { value: 'D1E', label: 'D1E - Römorklu Minibüs', id: 'mock-d1e' },
  { value: 'D', label: 'D - Otobüs', id: 'mock-d' },
  { value: 'DE', label: 'DE - Römorklu Otobüs', id: 'mock-de' },
  { value: 'F', label: 'F - Traktör', id: 'mock-f' }
];

/**
 * Database'den aktif ehliyet sınıflarını çeker
 * Eğitmen ve öğrenci formlarında kullanılır
 */
export const useLicenseClassOptions = () => {
  const [options, setOptions] = useState<LicenseClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLicenseClasses = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/license-classes`, {
          method: 'GET',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Backend'den gelen aktif ehliyet sınıflarını dönüştür (UUID dahil)
        const licenseOptions: LicenseClassOption[] = data.data
          .filter((item: any) => item.isActive) // Sadece aktif olanlar
          .map((item: any) => ({
            value: item.tip,                    // "B" - string
            label: `${item.tip} - ${item.arac}`, // "B - Otomobil/Kamyonet"
            id: item.id                         // UUID
          }))
          .sort((a: LicenseClassOption, b: LicenseClassOption) => {
            // Alfabetik sıralama
            return a.value.localeCompare(b.value);
          });

        setOptions(licenseOptions);
      } catch (err) {
        console.error('Failed to fetch license classes:', err);
        setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir hata oluştu');
        // Fallback to mock data
        setOptions(mockLicenseOptions);
      } finally {
        setLoading(false);
      }
    };

    fetchLicenseClasses();
  }, []);

  return { options, loading, error };
};

/**
 * Sadece ehliyet sınıfı değerlerini string array olarak döner
 * Basit select'ler için kullanılır
 */
export const useLicenseClassValues = () => {
  const { options, loading, error } = useLicenseClassOptions();
  const values = options.map(opt => opt.value);
  
  return { values, loading, error };
};
