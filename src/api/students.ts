import axios from 'axios';
import { API_URL } from '../config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

export interface Student {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  tcNo: string;
  phone: string;
  email?: string;
  photoUrl?: string; // Öğrenci fotoğrafı
  address?: string;
  province?: string;
  district?: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  licenseType: string;              // DEPRECATED: String "B"
  licenseClassId?: string;          // NEW: UUID relation
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
    licenseTypes: string[];
    licenseClassIds?: string[];     // NEW: UUID array
  };
  writtenExamStatus: 'NOT_TAKEN' | 'PASSED' | 'FAILED';
  writtenExamAttempts: number;
  writtenExamDate?: string;
  writtenExamTime?: string;
  drivingExamStatus: 'NOT_TAKEN' | 'PASSED' | 'FAILED';
  drivingExamAttempts: number;
  drivingExamDate?: string;
  drivingExamTime?: string;
  notes?: string;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
  payments?: Payment[];
  user?: {
    id: string;
    email?: string;
    phone: string;
    role: string;
    isActive: boolean;
  };
}

export interface Payment {
  id: string;
  studentId: string;
  companyId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CHECK';
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED';
  type?: 'DEBT' | 'INSTALLMENT' | 'PAYMENT'; // Yeni field
  description?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentData {
  firstName: string;
  lastName: string;
  tcNo: string;
  phone: string;
  email?: string;
  address?: string;
  province?: string;
  district?: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  licenseType: string;              // DEPRECATED: String "B" 
  licenseClassId?: string;          // NEW: UUID relation (backend handles lookup)
  notes?: string;
  startDate?: string;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
  status?: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
}

export interface ExamUpdateData {
  status: 'NOT_TAKEN' | 'PASSED' | 'FAILED';
  examDate?: string;
}

export interface StudentFilters {
  status?: string;
  instructorId?: string;
  licenseType?: string;
  writtenExamStatus?: string;
  drivingExamStatus?: string;
  search?: string;
}

export const studentAPI = {
  // Öğrenci listesi
  getAll: async (filters?: StudentFilters): Promise<Student[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await axios.get(
      `${API_URL}/api/students?${params.toString()}`,
      getAuthHeaders()
    );
    return response.data.data;
  },

  // Tek öğrenci getir
  getById: async (id: string): Promise<Student> => {
    const response = await axios.get(
      `${API_URL}/api/students/${id}`,
      getAuthHeaders()
    );
    return response.data.data;
  },

  // Yeni öğrenci oluştur
  create: async (data: CreateStudentData): Promise<Student> => {
    const response = await axios.post(
      `${API_URL}/api/students`,
      data,
      getAuthHeaders()
    );
    return response.data.data;
  },

  // Öğrenci güncelle
  update: async (id: string, data: UpdateStudentData): Promise<Student> => {
    const response = await axios.put(
      `${API_URL}/api/students/${id}`,
      data,
      getAuthHeaders()
    );
    return response.data.data;
  },

  // Öğrenci sil
  delete: async (id: string): Promise<void> => {
    await axios.delete(
      `${API_URL}/api/students/${id}`,
      getAuthHeaders()
    );
  },

  // Yazılı sınav durumu güncelle
  updateWrittenExam: async (id: string, data: ExamUpdateData): Promise<Student> => {
    const response = await axios.patch(
      `${API_URL}/api/students/${id}/written-exam`,
      data,
      getAuthHeaders()
    );
    return response.data.data;
  },

  // Direksiyon sınavı durumu güncelle
  updateDrivingExam: async (id: string, data: ExamUpdateData): Promise<Student> => {
    const response = await axios.patch(
      `${API_URL}/api/students/${id}/driving-exam`,
      data,
      getAuthHeaders()
    );
    return response.data.data;
  },

  // Sınav durumunu sıfırla
  resetExam: async (id: string, examType: 'written' | 'driving' | 'all'): Promise<Student> => {
    const response = await axios.post(
      `${API_URL}/api/students/${id}/reset-exam`,
      { examType },
      getAuthHeaders()
    );
    return response.data.data;
  },

  // Tamamlanmış öğrencileri getir (her iki sınavı da geçmiş)
  getCompleted: async (): Promise<Student[]> => {
    const response = await axios.get(
      `${API_URL}/api/students/completed`,
      getAuthHeaders()
    );
    return response.data.data;
  },

  // Yazılı sınavı geçmiş öğrenciler (eşleştirme için)
  getPassedWrittenExam: async (licenseType?: string): Promise<Student[]> => {
    const params = licenseType ? `?licenseType=${licenseType}` : '';
    const response = await axios.get(
      `${API_URL}/api/students/passed-written-exam${params}`,
      getAuthHeaders()
    );
    return response.data.data;
  },
};
