import axios from 'axios';
import type { SavedMatching, MatchingUpdate } from '../types/savedMatchingTypes';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api`;

// API helper
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token ekle (localStorage'dan)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Backend'den gelen veriyi frontend formatına dönüştür
const transformMatchingFromBackend = (backendData: any): SavedMatching => {
  // Status mapping: PENDING → draft, APPLIED → active, CANCELLED → archived, ARCHIVED → archived
  const statusMap: Record<string, 'draft' | 'active' | 'archived'> = {
    'PENDING': 'draft',
    'APPLIED': 'active',
    'CANCELLED': 'archived',
    'ARCHIVED': 'archived'
  };
  
  return {
    id: backendData.id,
    name: backendData.name || `Eşleştirme ${backendData.id.substring(0, 8)}`,
    description: backendData.description || '',
    licenseTypes: backendData.licenseTypes || [], // Çoklu ehliyet türü array
    createdDate: backendData.createdAt,
    createdBy: backendData.createdBy,
    totalStudents: backendData.totalStudents,
    totalInstructors: backendData.totalInstructors,
    status: statusMap[backendData.status] || 'draft',
    isLocked: backendData.isLocked || false,
    matches: (backendData.results || []).map((result: any) => ({
      studentId: result.studentId,
      instructorId: result.instructorId,
      matchedAt: result.createdAt,
      studentName: result.studentName,
      instructorName: result.instructorName,
      studentGender: result.studentGender?.toLowerCase(),
      instructorGender: result.instructorGender?.toLowerCase(),
      licenseType: result.licenseType,
      vehiclePlate: result.vehiclePlate,
      vehicleModel: result.vehicleModel,
      // Ekstra bilgiler (varsa) - Raporlama için
      student: result.student,
      instructor: result.instructor,
    }))
  };
};

// Frontend'den backend'e veri dönüşümü
const transformMatchingToBackend = (frontendData: Partial<SavedMatching>) => {
  const backendData: any = {};
  
  if (frontendData.name !== undefined) backendData.name = frontendData.name;
  if (frontendData.description !== undefined) backendData.description = frontendData.description;
  if (frontendData.licenseType !== undefined) backendData.licenseType = frontendData.licenseType;
  if (frontendData.totalStudents !== undefined) backendData.totalStudents = frontendData.totalStudents;
  if (frontendData.totalInstructors !== undefined) backendData.totalInstructors = frontendData.totalInstructors;
  if (frontendData.isLocked !== undefined) backendData.isLocked = frontendData.isLocked;
  
  // Status mapping: active/archived/draft → APPLIED/CANCELLED/PENDING
  if (frontendData.status !== undefined) {
    const statusMap: Record<string, string> = {
      'active': 'APPLIED',
      'archived': 'CANCELLED',
      'draft': 'PENDING'
    };
    backendData.status = statusMap[frontendData.status] || 'PENDING';
  }
  
  // Matches array - gender normalizasyonu ile
  if (frontendData.matches !== undefined) {
    backendData.matches = frontendData.matches.map(m => ({
      ...m,
      studentGender: (m.studentGender || 'male').toUpperCase(),
      instructorGender: (m.instructorGender || 'male').toUpperCase()
    }));
  }
  
  return backendData;
};

// Tüm kayıtlı eşleştirmeleri getir
export const fetchSavedMatchings = async (): Promise<SavedMatching[]> => {
  try {
    const response = await api.get('/matching/history?limit=100');
    
    if (response.data.success) {
      return response.data.data.matchings.map(transformMatchingFromBackend);
    }
    
    throw new Error(response.data.message || 'Eşleştirmeler getirilemedi');
  } catch (error: any) {
    console.error('Fetch saved matchings error:', error);
    throw new Error(error.response?.data?.message || 'Eşleştirmeler getirilemedi');
  }
};

// Yeni eşleştirme kaydet
export const saveMatching = async (matching: Omit<SavedMatching, 'id'>): Promise<SavedMatching> => {
  try {
    const backendData = {
      params: {
        companyId: localStorage.getItem('companyId') || '',
        name: matching.name,
        description: matching.description,
        licenseTypes: matching.licenseTypes, // Çoklu ehliyet türü array
        considerGender: true,
        prioritizeFirstDrivingAttempt: false
      },
      matchingData: {
        matches: (matching.matches || []).map(m => ({
          studentId: m.studentId,
          instructorId: m.instructorId,
          studentName: m.studentName || '',
          instructorName: m.instructorName || '',
          studentGender: m.studentGender?.toUpperCase() || 'MALE',
          instructorGender: m.instructorGender?.toUpperCase() || 'MALE',
          licenseType: m.licenseType || matching.licenseTypes[0] || 'B', // Student'ın kendi licenseType'ı
          vehiclePlate: m.vehiclePlate || null,
          vehicleModel: m.vehicleModel || null,
          writtenExamAttempts: 0,
          drivingExamAttempts: 0
        })),
        unmatchedStudents: [],
        stats: {
          totalStudents: matching.totalStudents,
          totalInstructors: matching.totalInstructors,
          matchedStudents: matching.matches?.length || 0,
          unmatchedStudents: 0
        }
      }
    };
    
    const response = await api.post('/matching/save', backendData);
    
    if (response.data.success) {
      return transformMatchingFromBackend(response.data.data);
    }
    
    throw new Error(response.data.message || 'Eşleştirme kaydedilemedi');
  } catch (error: any) {
    console.error('Save matching error:', error);
    throw new Error(error.response?.data?.message || 'Eşleştirme kaydedilemedi');
  }
};

// Eşleştirme detayını getir
export const fetchSavedMatching = async (id: string): Promise<SavedMatching | null> => {
  try {
    const response = await api.get(`/matching/${id}`);
    
    if (response.data.success) {
      return transformMatchingFromBackend(response.data.data);
    }
    
    return null;
  } catch (error: any) {
    console.error('Fetch matching detail error:', error);
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error(error.response?.data?.message || 'Eşleştirme detayı getirilemedi');
  }
};

// Eşleştirme güncelle
export const updateMatching = async (id: string, updates: Partial<SavedMatching>): Promise<SavedMatching> => {
  try {
    const backendData = transformMatchingToBackend(updates);
    
    const response = await api.patch(`/matching/${id}`, backendData);
    
    if (response.data.success) {
      return transformMatchingFromBackend(response.data.data);
    }
    
    throw new Error(response.data.message || 'Eşleştirme güncellenemedi');
  } catch (error: any) {
    console.error('Update matching error:', error);
    throw new Error(error.response?.data?.message || 'Eşleştirme güncellenemedi');
  }
};

// Öğrenci-eğitmen eşleştirmesi güncelle (Kullanılmıyor - updateMatching ile birleştirildi)
export const updateStudentInstructorMatch = async (_update: MatchingUpdate): Promise<void> => {
  console.warn('updateStudentInstructorMatch deprecated, use updateMatching instead');
};

// Eşleştirme sil
export const deleteMatching = async (id: string): Promise<void> => {
  try {
    const response = await api.delete(`/matching/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Eşleştirme silinemedi');
    }
  } catch (error: any) {
    console.error('Delete matching error:', error);
    throw new Error(error.response?.data?.message || 'Eşleştirme silinemedi');
  }
};

// Eşleştirmeyi arşive taşı
export const archiveMatching = async (id: string): Promise<SavedMatching> => {
  try {
    const response = await api.patch(`/matching/${id}/archive`);
    
    if (response.data.success) {
      return transformMatchingFromBackend(response.data.data);
    }
    
    throw new Error(response.data.message || 'Eşleştirme arşivlenemedi');
  } catch (error: any) {
    console.error('Archive matching error:', error);
    throw new Error(error.response?.data?.message || 'Eşleştirme arşivlenemedi');
  }
};

// Arşivlenmiş eşleştirmeleri getir
export const fetchArchivedMatchings = async (limit = 20, offset = 0): Promise<{ matchings: SavedMatching[]; total: number }> => {
  try {
    const response = await api.get(`/matching/archived?limit=${limit}&offset=${offset}`);
    
    if (response.data.success) {
      return {
        matchings: response.data.data.matchings.map(transformMatchingFromBackend),
        total: response.data.data.total
      };
    }
    
    throw new Error(response.data.message || 'Arşiv getirilemedi');
  } catch (error: any) {
    console.error('Fetch archived matchings error:', error);
    throw new Error(error.response?.data?.message || 'Arşiv getirilemedi');
  }
};