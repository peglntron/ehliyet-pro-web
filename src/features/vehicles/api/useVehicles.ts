import { useState, useEffect } from 'react';
import { apiClient, type Vehicle as ApiVehicle, type ApiResponse } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import type { Vehicle, KmRecord } from '../types/types';

// Vehicle interface mapping
const mapApiVehicleToLocal = (apiVehicle: ApiVehicle): Vehicle => ({
  id: apiVehicle.id,
  companyId: apiVehicle.companyId,
  licensePlate: apiVehicle.licensePlate,
  brand: apiVehicle.brand,
  model: apiVehicle.model,
  year: apiVehicle.year,
  currentKm: apiVehicle.currentKm,
  status: apiVehicle.status.toLowerCase() as any,
  lastServiceKm: apiVehicle.lastServiceKm,
  nextServiceKm: apiVehicle.nextServiceKm,
  createdAt: apiVehicle.createdAt,
  lastUpdated: apiVehicle.updatedAt
});

// API functions
export const getVehicles = async (companyId?: string): Promise<Vehicle[]> => {
  try {
    const response: ApiResponse<ApiVehicle[]> = await apiClient.getWithCompanyFilter('/vehicles', companyId);
    if (response.success && response.data) {
      return response.data.map(mapApiVehicleToLocal);
    }
    return [];
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
};

export const getVehicleById = async (id: string): Promise<Vehicle> => {
  try {
    const response: ApiResponse<ApiVehicle> = await apiClient.get(`/vehicles/${id}`);
    if (response.success && response.data) {
      return mapApiVehicleToLocal(response.data);
    }
    throw new Error('Vehicle not found');
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    throw new Error('Araç bulunamadı');
  }
};

export const createVehicle = async (vehicleData: Partial<Vehicle>, companyId?: string): Promise<Vehicle> => {
  try {
    const apiData = {
      licensePlate: vehicleData.licensePlate,
      brand: vehicleData.brand,
      model: vehicleData.model,
      year: vehicleData.year,
      currentKm: vehicleData.currentKm || 0
    };
    
    const response: ApiResponse<ApiVehicle> = await apiClient.postWithCompanyData('/vehicles', apiData, companyId);
    if (response.success && response.data) {
      return mapApiVehicleToLocal(response.data);
    }
    throw new Error('Failed to create vehicle');
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
};

export const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>, companyId?: string): Promise<Vehicle> => {
  try {
    const apiData = {
      licensePlate: vehicleData.licensePlate,
      brand: vehicleData.brand,
      model: vehicleData.model,
      year: vehicleData.year,
      currentKm: vehicleData.currentKm,
      status: vehicleData.status
    };
    
    const response: ApiResponse<ApiVehicle> = await apiClient.putWithCompanyData(`/vehicles/${id}`, apiData, companyId);
    if (response.success && response.data) {
      return mapApiVehicleToLocal(response.data);
    }
    throw new Error('Failed to update vehicle');
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

export const deleteVehicle = async (id: string): Promise<boolean> => {
  try {
    const response: ApiResponse = await apiClient.delete(`/vehicles/${id}`);
    return response.success;
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
};

export const getVehiclesByInstructorId = async (instructorId: string): Promise<Vehicle[]> => {
  try {
    const response: ApiResponse<ApiVehicle[]> = await apiClient.get(`/vehicles/instructor/${instructorId}`);
    if (response.success && response.data) {
      return response.data.map(mapApiVehicleToLocal);
    }
    return [];
  } catch (error) {
    console.error('Error fetching vehicles by instructor:', error);
    return [];
  }
};

export const getKmRecords = async (vehicleId: string): Promise<KmRecord[]> => {
  try {
    const response: ApiResponse<KmRecord[]> = await apiClient.get(`/vehicles/${vehicleId}/km-records`);
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching km records:', error);
    return [];
  }
};

export const addKmRecord = async (vehicleId: string, kmData: Partial<KmRecord>): Promise<KmRecord> => {
  try {
    const response: ApiResponse<KmRecord> = await apiClient.post(`/vehicles/${vehicleId}/km-records`, kmData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to add km record');
  } catch (error) {
    console.error('Error adding km record:', error);
    throw error;
  }
};

export const saveVehicle = async (vehicleData: any, id?: string): Promise<Vehicle> => {
  try {
    if (id) {
      // Update existing vehicle
      return await updateVehicle(id, vehicleData);
    } else {
      // Create new vehicle
      return await createVehicle(vehicleData);
    }
  } catch (error) {
    console.error('Error saving vehicle:', error);
    throw error;
  }
};

// Hook for using vehicles (list)
export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        // Use company filter for company users
        const companyId = user?.role !== 'SYSTEM_ADMIN' ? user?.companyId : undefined;
        const data = await getVehicles(companyId);
        setVehicles(data);
        setError(null);
      } catch (err) {
        setError('Araçlar yüklenirken hata oluştu');
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [user]);

  return {
    vehicles,
    loading,
    error,
    refetch: () => {
      const fetchVehicles = async () => {
        try {
          setLoading(true);
          const companyId = user?.role !== 'SYSTEM_ADMIN' ? user?.companyId : undefined;
          const data = await getVehicles(companyId);
          setVehicles(data);
          setError(null);
        } catch (err) {
          setError('Araçlar yüklenirken hata oluştu');
          console.error('Error fetching vehicles:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchVehicles();
    }
  };
};

// Hook for using single vehicle
export const useVehicle = (id: string) => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setVehicle(null);
      setLoading(false);
      return;
    }

    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const data = await getVehicleById(id);
        setVehicle(data);
        setError(null);
      } catch (err) {
        setError('Araç yüklenirken hata oluştu');
        console.error('Error fetching vehicle:', err);
        setVehicle(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  return {
    vehicle,
    loading,
    error,
    refetch: () => {
      if (!id) return;
      
      const fetchVehicle = async () => {
        try {
          setLoading(true);
          const data = await getVehicleById(id);
          setVehicle(data);
          setError(null);
        } catch (err) {
          setError('Araç yüklenirken hata oluştu');
          console.error('Error fetching vehicle:', err);
          setVehicle(null);
        } finally {
          setLoading(false);
        }
      };
      fetchVehicle();
    }
  };
};