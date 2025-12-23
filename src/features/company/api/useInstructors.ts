import { apiClient } from '../../../utils/api';

export interface Instructor {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  tcNo: string;
  phone: string;
  email?: string;
  address?: string;
  province?: string;
  district?: string;
  gender: 'MALE' | 'FEMALE';
  licenseTypes: string[];           // DEPRECATED: ['B', 'A2', 'C', etc.]
  licenseClassIds?: string[];       // NEW: UUID array
  experience?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  vehicleId?: string;
  vehicle?: {
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
  };
  user?: {
    isActive: boolean;
    lastLogin?: string;
  };
  startDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstructorData {
  firstName: string;
  lastName: string;
  tcNo: string;
  phone: string;
  email?: string;
  address?: string;
  province?: string;
  district?: string;
  gender: 'MALE' | 'FEMALE';
  licenseTypes?: string[];
  experience?: number;
  vehicleId?: string;
  startDate?: string;
  notes?: string;
}

export interface UpdateInstructorData {
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  province?: string;
  district?: string;
  licenseTypes?: string[];
  experience?: number;
  vehicleId?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  startDate?: string;
  notes?: string;
}

export interface GetInstructorsParams {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  licenseType?: string;
  page?: number;
  limit?: number;
}

/**
 * Şirkete ait eğitmenleri getir
 */
export const getInstructors = async (
  companyId: string,
  params?: GetInstructorsParams
): Promise<{ instructors: Instructor[]; pagination: any }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.licenseType) queryParams.append('licenseType', params.licenseType);

    const response = await apiClient.get(
      `/admin/companies/${companyId}/instructors?${queryParams.toString()}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    return { instructors: [], pagination: null };
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return { instructors: [], pagination: null };
  }
};

/**
 * Yeni eğitmen oluştur
 */
export const createInstructor = async (
  companyId: string,
  data: CreateInstructorData
): Promise<{ instructor: Instructor; temporaryPassword: string }> => {
  try {
    const response = await apiClient.post(`/admin/companies/${companyId}/instructors`, data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to create instructor');
  } catch (error) {
    console.error('Error creating instructor:', error);
    throw error;
  }
};

/**
 * Eğitmen bilgilerini güncelle
 */
export const updateInstructor = async (
  instructorId: string,
  data: UpdateInstructorData
): Promise<Instructor> => {
  try {
    const response = await apiClient.put(`/admin/instructors/${instructorId}`, data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to update instructor');
  } catch (error) {
    console.error('Error updating instructor:', error);
    throw error;
  }
};

/**
 * Eğitmeni sil
 */
export const deleteInstructor = async (instructorId: string): Promise<boolean> => {
  try {
    const response = await apiClient.delete(`/admin/instructors/${instructorId}`);
    return response.success;
  } catch (error) {
    console.error('Error deleting instructor:', error);
    throw error;
  }
};

/**
 * Eğitmen durumunu değiştir (aktif/pasif)
 */
export const toggleInstructorStatus = async (instructorId: string): Promise<Instructor> => {
  try {
    const response = await apiClient.patch(`/admin/instructors/${instructorId}/toggle-status`);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to toggle instructor status');
  } catch (error) {
    console.error('Error toggling instructor status:', error);
    throw error;
  }
};
