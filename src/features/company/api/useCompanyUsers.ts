import { apiClient, type ApiResponse } from '../../../utils/api';

export interface CompanyUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'COMPANY_ADMIN' | 'COMPANY_USER' | 'INSTRUCTOR' | 'STUDENT';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  phone: string;
  role: 'COMPANY_ADMIN' | 'COMPANY_USER';
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: 'COMPANY_ADMIN' | 'COMPANY_USER';
  isActive?: boolean;
}

// Şirket kullanıcılarını listele
export const getCompanyUsers = async (
  companyId: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }
): Promise<{ users: CompanyUser[]; pagination: any }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);

    const response: ApiResponse<{ users: CompanyUser[]; pagination: any }> = 
      await apiClient.get(`/admin/companies/${companyId}/users?${queryParams.toString()}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    return { users: [], pagination: null };
  } catch (error) {
    console.error('Error fetching company users:', error);
    return { users: [], pagination: null };
  }
};

// Yeni kullanıcı oluştur
export const createCompanyUser = async (
  companyId: string,
  data: CreateUserData
): Promise<CompanyUser & { temporaryPassword?: string }> => {
  try {
    const response: ApiResponse<CompanyUser & { temporaryPassword?: string }> = 
      await apiClient.post(`/admin/companies/${companyId}/users`, data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to create user');
  } catch (error) {
    console.error('Error creating company user:', error);
    throw error;
  }
};

// Kullanıcı bilgilerini güncelle
export const updateCompanyUser = async (
  userId: string,
  data: UpdateUserData
): Promise<CompanyUser> => {
  try {
    const response: ApiResponse<CompanyUser> = 
      await apiClient.put(`/admin/users/${userId}`, data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to update user');
  } catch (error) {
    console.error('Error updating company user:', error);
    throw error;
  }
};

// Kullanıcıyı sil
export const deleteCompanyUser = async (userId: string): Promise<boolean> => {
  try {
    const response: ApiResponse = 
      await apiClient.delete(`/admin/users/${userId}`);
    
    return response.success;
  } catch (error) {
    console.error('Error deleting company user:', error);
    throw error;
  }
};

// Kullanıcı şifresini sıfırla
export const resetUserPassword = async (
  userId: string
): Promise<{ temporaryPassword: string }> => {
  try {
    const response: ApiResponse<{ temporaryPassword: string }> = 
      await apiClient.post(`/admin/users/${userId}/reset-password`);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to reset password');
  } catch (error) {
    console.error('Error resetting user password:', error);
    throw error;
  }
};
