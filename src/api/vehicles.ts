import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export interface Vehicle {
  id: string;
  companyId: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  chassisNumber?: string;
  engineNumber?: string;
  transmissionType: 'MANUAL' | 'AUTOMATIC';
  fuelType: 'DIESEL' | 'GASOLINE' | 'HYBRID' | 'ELECTRIC' | 'LPG';
  engineCapacity?: string;
  horsePower?: number;
  currentKm: number;
  purchaseKm?: number;
  lastServiceDate?: string;
  lastServiceKm?: number;
  nextServiceKm?: number;
  nextServiceDate?: string;
  serviceInterval?: number;
  insuranceCompany?: string;
  insurancePolicyNo?: string;
  insuranceExpiry?: string;
  inspectionExpiry?: string;
  trafficInsuranceStart?: string;
  trafficInsuranceEnd?: string;
  kaskoInsuranceStart?: string;
  kaskoInsuranceEnd?: string;
  inspectionStart?: string;
  inspectionEnd?: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'REPAIR' | 'INACTIVE';
  currentInstructorId?: string;
  notes?: string;
  purchaseDate?: string;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
  };
  currentInstructor?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  _count?: {
    assignmentHistory: number;
    serviceRecords: number;
    fuelRecords: number;
  };
  assignmentHistory?: VehicleAssignment[];
  serviceRecords?: VehicleService[];
  fuelRecords?: VehicleFuel[];
}

export interface VehicleStats {
  total: number;
  available: number;
  assigned: number;
  maintenance: number;
  outOfService: number;
}

export interface InstructorAssignmentStats {
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;
  totalKm: number;
  totalDays: number;
  averageKmPerDay: number;
  vehicles: Array<{
    vehicleId: string;
    licensePlate: string;
    brand: string;
    model: string;
    assignedDate: string;
    returnedDate?: string;
    assignedKm: number;
    returnedKm?: number;
    totalKm?: number;
    durationDays?: number;
    isActive: boolean;
  }>;
}

export interface VehicleAssignmentStats {
  vehicle: {
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
  };
  totalAssignments: number;
  activeAssignments: number;
  totalKm: number;
  totalDays: number;
  instructors: Array<{
    instructor: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
    };
    assignedDate: string;
    returnedDate?: string;
    totalKm?: number;
    durationDays?: number;
    isActive: boolean;
  }>;
}

export interface AssignmentStats {
  summary: {
    totalAssignments: number;
    activeAssignments: number;
    completedAssignments: number;
    totalKmDriven: number;
    totalDays: number;
    uniqueInstructors: number;
    uniqueVehicles: number;
  };
  byInstructor: InstructorAssignmentStats[];
  byVehicle: VehicleAssignmentStats[];
}

export interface VehicleAssignment {
  id: string;
  vehicleId: string;
  instructorId: string;
  assignedDate: string;
  assignedKm: number;
  returnedDate?: string;
  returnedKm?: number;
  totalKm?: number;
  durationDays?: number;
  isActive: boolean;
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export interface VehicleService {
  id: string;
  vehicleId: string;
  serviceType: 'PERIODIC' | 'REPAIR' | 'ACCIDENT' | 'TIRE_CHANGE' | 'OIL_CHANGE' | 'BRAKE_SERVICE' | 'INSPECTION' | 'OTHER';
  serviceDate: string;
  serviceKm: number;
  cost?: number;
  serviceProvider?: string;
  description?: string;
  partsChanged?: string;
}

export interface VehicleFuel {
  id: string;
  vehicleId: string;
  fuelDate: string;
  currentKm: number;
  liters: number;
  pricePerLiter?: number;
  totalCost?: number;
  fuelType: string;
  station?: string;
  receiptNo?: string;
  consumption?: number;
  kmSinceLastFuel?: number;
  notes?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const vehicleAPI = {
  // Tüm araçları getir
  getAll: async (): Promise<Vehicle[]> => {
    const response = await axios.get(`${API_URL}/api/vehicles`, getAuthHeaders());
    return response.data.data;
  },

  // Araç istatistikleri
  getStats: async (): Promise<VehicleStats> => {
    const response = await axios.get(`${API_URL}/api/vehicles/stats`, getAuthHeaders());
    return response.data.data;
  },

  // Zimmet bazlı istatistikler
  getAssignmentStats: async (): Promise<AssignmentStats> => {
    const response = await axios.get(`${API_URL}/api/vehicles/assignment-stats`, getAuthHeaders());
    return response.data.data;
  },

  // Belirli bir araç
  getById: async (id: string): Promise<Vehicle> => {
    const response = await axios.get(`${API_URL}/api/vehicles/${id}`, getAuthHeaders());
    return response.data.data;
  },

  // Yeni araç ekle
  create: async (vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await axios.post(`${API_URL}/api/vehicles`, vehicleData, getAuthHeaders());
    return response.data.data;
  },

  // Araç güncelle
  update: async (id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await axios.put(`${API_URL}/api/vehicles/${id}`, vehicleData, getAuthHeaders());
    return response.data.data;
  },

  // Araç sil
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/api/vehicles/${id}`, getAuthHeaders());
  },

  // Araç zimmetle
  assign: async (id: string, assignData: { instructorId: string; assignedKm?: number; assignedNotes?: string }): Promise<any> => {
    const response = await axios.post(`${API_URL}/api/vehicles/${id}/assign`, assignData, getAuthHeaders());
    return response.data.data;
  },

  // Zimmeti kaldır
  unassign: async (id: string, unassignData: { returnedKm?: number; returnedNotes?: string }): Promise<any> => {
    const response = await axios.post(`${API_URL}/api/vehicles/${id}/unassign`, unassignData, getAuthHeaders());
    return response.data.data;
  },

  // Servis kaydı ekle
  addService: async (id: string, serviceData: Partial<VehicleService> & { nextServiceKm?: number; nextServiceDate?: string }): Promise<any> => {
    const response = await axios.post(`${API_URL}/api/vehicles/${id}/service`, serviceData, getAuthHeaders());
    return response.data.data;
  },

  // Yakıt kaydı ekle
  addFuel: async (id: string, fuelData: Partial<VehicleFuel>): Promise<any> => {
    const response = await axios.post(`${API_URL}/api/vehicles/${id}/fuel`, fuelData, getAuthHeaders());
    return response.data.data;
  },
};

// Helper functions for easier usage
export const getVehicles = () => vehicleAPI.getAll();
export const getVehicleById = (id: string) => vehicleAPI.getById(id);
export const createVehicle = (data: Partial<Vehicle>) => vehicleAPI.create(data);
export const updateVehicle = (id: string, data: Partial<Vehicle>) => vehicleAPI.update(id, data);
export const deleteVehicle = (id: string) => vehicleAPI.delete(id);
export const assignVehicle = (vehicleId: string, instructorId: string, assignedKm?: number) => 
  vehicleAPI.assign(vehicleId, { instructorId, assignedKm });
export const unassignVehicle = (vehicleId: string, returnedKm?: number) => 
  vehicleAPI.unassign(vehicleId, { returnedKm });
