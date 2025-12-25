import { useState, useEffect } from 'react';
import { apiClient, type Company as ApiCompany, type ApiResponse } from '../../../utils/api';
import type { Company } from '../types/types';

// Company interface mapping
const mapApiCompanyToLocal = (apiCompany: ApiCompany): Company => ({
  id: apiCompany.id,
  name: apiCompany.name,
  province: apiCompany.province ?? '',
  district: apiCompany.district?? '',
  address: apiCompany.address?? '',
  phone: apiCompany.phone,
  registrationDate: apiCompany.registrationDate?? '',
  licenseEndDate: apiCompany.licenseEndDate ?? '',
  owner: apiCompany.owner ?? '',
  location: apiCompany.location as any || undefined,
  isActive: apiCompany.isActive,
  createdAt: apiCompany.createdAt,
  updatedAt: apiCompany.updatedAt,
  logo: apiCompany.logo,
  authorizedPerson: apiCompany.authorizedPerson,
  email: apiCompany.email,
  website: apiCompany.website,
  description: apiCompany.description,
  phones: (apiCompany as any).phones || [],
  ibans: (apiCompany as any).ibans || []
});

// API functions - Admin endpoints
export const getCompanies = async (filters?: {
  page?: number;
  limit?: number;
  search?: string;
  province?: string;
  status?: string;
  licenseStatus?: string;
}): Promise<{ companies: Company[]; pagination?: any }> => {
  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.province) params.append('province', filters.province);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.licenseStatus) params.append('licenseStatus', filters.licenseStatus);
    
    const response: ApiResponse<{ companies: ApiCompany[]; pagination: any }> = 
      await apiClient.get(`/admin/companies?${params.toString()}`);
    
    if (response.success && response.data) {
      return {
        companies: response.data.companies.map(mapApiCompanyToLocal),
        pagination: response.data.pagination
      };
    }
    return { companies: [] };
  } catch (error) {
    console.error('Error fetching companies:', error);
    return { companies: [] };
  }
};

export const getCompanyById = async (id: string): Promise<Company> => {
  try {
    const response: ApiResponse<ApiCompany> = await apiClient.get(`/admin/companies/${id}`);
    if (response.success && response.data) {
      return mapApiCompanyToLocal(response.data);
    }
    throw new Error('Company not found');
  } catch (error) {
    console.error('Error fetching company:', error);
    throw new Error('Şirket bulunamadı');
  }
};

export const createCompany = async (companyData: Partial<Company>): Promise<{ company: Company; credentials?: { username: string; password: string } }> => {
  try {
    const response: ApiResponse<{ company: ApiCompany; credentials?: { username: string; password: string } }> = 
      await apiClient.post('/admin/companies', companyData);
    if (response.success && response.data) {
      return {
        company: mapApiCompanyToLocal(response.data.company),
        credentials: response.data.credentials
      };
    }
    throw new Error('Failed to create company');
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

export const updateCompany = async (id: string, companyData: Partial<Company>): Promise<Company> => {
  try {
    const response: ApiResponse<ApiCompany> = await apiClient.put(`/admin/companies/${id}`, companyData);
    if (response.success && response.data) {
      return mapApiCompanyToLocal(response.data);
    }
    throw new Error('Failed to update company');
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

export const deleteCompany = async (id: string): Promise<boolean> => {
  try {
    const response: ApiResponse = await apiClient.delete(`/admin/companies/${id}`);
    return response.success;
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
};

// Admin specific functions
// Admin specific functions
export const renewLicense = async (
  companyId: string, 
  data: { 
    packageId?: string; 
    customDays?: number; 
    amount?: number; 
    description?: string 
  }
): Promise<{ company: Company; payment: any }> => {
  try {
    const response: ApiResponse<{ company: ApiCompany; payment: any }> = 
      await apiClient.post(`/admin/companies/${companyId}/renew-license`, data);
    if (response.success && response.data) {
      return {
        company: mapApiCompanyToLocal(response.data.company),
        payment: response.data.payment
      };
    }
    throw new Error('Failed to renew license');
  } catch (error) {
    console.error('Error renewing license:', error);
    throw error;
  }
};

export const getLicensePackages = async (): Promise<Array<{
  id: string;
  name: string;
  duration: number;
  price: number;
  isTrial: boolean;
  description?: string;
  displayOrder?: number;
}>> => {
  try {
    const response: ApiResponse<Array<any>> = 
      await apiClient.get('/admin/license-packages');
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching license packages:', error);
    return [];
  }
};

export const getLicensePayments = async (
  companyId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ payments: any[]; pagination: any }> => {
  try {
    const response: ApiResponse<{ payments: any[]; pagination: any }> = 
      await apiClient.get(`/admin/companies/${companyId}/license-payments?page=${page}&limit=${limit}`);
    if (response.success && response.data) {
      return response.data;
    }
    return { payments: [], pagination: null };
  } catch (error) {
    console.error('Error fetching license payments:', error);
    return { payments: [], pagination: null };
  }
};

export const confirmPayment = async (
  paymentId: string,
  data?: { paymentMethod?: string; transactionId?: string }
): Promise<any> => {
  try {
    const response: ApiResponse<any> = 
      await apiClient.post(`/admin/license-payments/${paymentId}/confirm`, data || {});
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to confirm payment');
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

export const resetCompanyPassword = async (id: string): Promise<boolean> => {
  try {
    const response: ApiResponse = await apiClient.post(`/admin/companies/${id}/reset-password`);
    return response.success;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Mock provinces and districts for now
export const provinces = [
  { id: '34', name: 'İstanbul' },
  { id: '06', name: 'Ankara' },
  { id: '35', name: 'İzmir' }
];

const districtMap: Record<string, any[]> = {
  '34': [
    { id: '1', name: 'Kadıköy' },
    { id: '2', name: 'Beşiktaş' },
    { id: '3', name: 'Üsküdar' }
  ],
  '06': [
    { id: '4', name: 'Çankaya' },
    { id: '5', name: 'Keçiören' }
  ],
  '35': [
    { id: '6', name: 'Konak' },
    { id: '7', name: 'Bornova' }
  ]
};

export const getProvinces = async (): Promise<any[]> => {
  return provinces;
};

export const getDistricts = async (provinceId: string): Promise<any[]> => {
  return districtMap[provinceId] || [];
};

export const getDistrictsByProvinceId = (provinceId: string): any[] => {
  return districtMap[provinceId] || [];
};

// Hook for using companies
export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const data = await getCompanies();
        setCompanies(data.companies);
        setError(null);
      } catch (err) {
        setError('Şirketler yüklenirken hata oluştu');
        console.error('Error fetching companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return {
    companies,
    loading,
    error,
    refetch: () => {
      const fetchCompanies = async () => {
        try {
          setLoading(true);
          const data = await getCompanies();
          setCompanies(data.companies);
          setError(null);
        } catch (err) {
          setError('Şirketler yüklenirken hata oluştu');
          console.error('Error fetching companies:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchCompanies();
    }
  };
};

// Phone API functions
export const addCompanyPhone = async (companyId: string, data: { number: string; description: string }) => {
  try {
    const response: ApiResponse = await apiClient.post(`/company-resources/phones`, {
      ...data,
      companyId
    });
    return response;
  } catch (error) {
    console.error('Error adding phone:', error);
    throw error;
  }
};

export const deleteCompanyPhone = async (phoneId: string) => {
  try {
    const response: ApiResponse = await apiClient.delete(`/company-resources/phones/${phoneId}`);
    return response;
  } catch (error) {
    console.error('Error deleting phone:', error);
    throw error;
  }
};

// IBAN API functions
export const addCompanyIban = async (companyId: string, data: { 
  iban: string; 
  bankName: string; 
  accountHolder: string; 
  description: string 
}) => {
  try {
    const response: ApiResponse = await apiClient.post(`/company-resources/ibans`, {
      ...data,
      companyId
    });
    return response;
  } catch (error) {
    console.error('Error adding IBAN:', error);
    throw error;
  }
};

export const deleteCompanyIban = async (ibanId: string) => {
  try {
    const response: ApiResponse = await apiClient.delete(`/company-resources/ibans/${ibanId}`);
    return response;
  } catch (error) {
    console.error('Error deleting IBAN:', error);
    throw error;
  }
};