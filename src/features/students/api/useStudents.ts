import { useState, useEffect } from 'react';
import { apiClient, type ApiResponse, type Student as ApiStudent } from '../../../utils/api';
import type { Student } from '../types/types';

// Student interface mapping
const mapApiStudentToLocal = (apiStudent: any): Student => ({
  id: apiStudent.id,
  companyId: apiStudent.companyId,
  name: apiStudent.firstName,
  surname: apiStudent.lastName,
  tcNo: apiStudent.tcNo,
  phone: apiStudent.phone,
  gender: apiStudent.gender?.toLowerCase() || 'male',
  licenseType: apiStudent.licenseType || 'B',
  instructor: apiStudent.instructorId || '',
  instructorName: apiStudent.instructor ? `${apiStudent.instructor.firstName} ${apiStudent.instructor.lastName}` : undefined,
  instructorAssignments: apiStudent.instructorAssignments || [],
  examDate: '',
  status: apiStudent.status?.toLowerCase() || 'active',
  writtenExam: {
    status: apiStudent.writtenExamStatus?.toLowerCase().replace('_', '-') || 'not-taken',
    attempts: apiStudent.writtenExamAttempts || 0,
    maxAttempts: 4,
    passedAtAttempt: apiStudent.writtenExamStatus === 'PASSED' ? (apiStudent.writtenExamAttempts || 1) : undefined
  },
  drivingExam: {
    status: apiStudent.drivingExamStatus?.toLowerCase().replace('_', '-') || 'not-taken',
    attempts: apiStudent.drivingExamAttempts || 0,
    maxAttempts: 4,
    passedAtAttempt: apiStudent.drivingExamStatus === 'PASSED' ? (apiStudent.drivingExamAttempts || 1) : undefined
  },
  totalPayment: 0,
  paidAmount: apiStudent.paidAmount || 0, // Backend'den gelen hesaplanmış değer
  totalDebt: apiStudent.totalDebt || 0, // Backend'den gelen hesaplanmış değer
  remainingDebt: apiStudent.remainingDebt || 0, // Backend'den gelen hesaplanmış değer
  createdAt: apiStudent.createdAt,
  lastUpdated: apiStudent.updatedAt,
  payments: []
});

// API functions
export const getStudents = async (companyId?: string): Promise<Student[]> => {
  try {
    const response: ApiResponse<ApiStudent[]> = await apiClient.getWithCompanyFilter('/students', companyId);
    if (response.success && response.data) {
      return response.data.map(mapApiStudentToLocal);
    }
    return [];
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
};

export const getStudentById = async (id: string): Promise<Student> => {
  try {
    const response: ApiResponse<ApiStudent> = await apiClient.get(`/students/${id}`);
    if (response.success && response.data) {
      return mapApiStudentToLocal(response.data);
    }
    throw new Error('Student not found');
  } catch (error) {
    console.error('Error fetching student:', error);
    throw new Error('Öğrenci bulunamadı');
  }
};

export const createStudent = async (studentData: Partial<Student>): Promise<Student> => {
  try {
    const apiData = {
      tcNo: studentData.tcNo,
      firstName: studentData.name,
      lastName: studentData.surname,
      birthDate: new Date().toISOString(),
      phone: studentData.phone,
      email: '',
      address: '',
      licenseType: studentData.licenseType || 'B',
    };
    
    const response: ApiResponse<ApiStudent> = await apiClient.post('/students', apiData);
    if (response.success && response.data) {
      return mapApiStudentToLocal(response.data);
    }
    throw new Error('Failed to create student');
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

export const updateStudent = async (id: string, studentData: Partial<Student>): Promise<Student> => {
  try {
    const apiData = {
      tcNo: studentData.tcNo,
      firstName: studentData.name,
      lastName: studentData.surname,
      phone: studentData.phone,
      licenseType: studentData.licenseType,
    };
    
    const response: ApiResponse<ApiStudent> = await apiClient.put(`/students/${id}`, apiData);
    if (response.success && response.data) {
      return mapApiStudentToLocal(response.data);
    }
    throw new Error('Failed to update student');
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

export const deleteStudent = async (id: string): Promise<boolean> => {
  try {
    const response: ApiResponse = await apiClient.delete(`/students/${id}`);
    return response.success;
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};

export const sendNotification = async (studentId: string, notification: any): Promise<boolean> => {
  try {
    // Notification type mapping: frontend -> backend
    const typeMapping: Record<string, string> = {
      'general': 'GENERAL',
      'exam': 'EXAM',
      'payment': 'PAYMENT',
      'lesson': 'LESSON',
      'warning': 'GENERAL' // warning'i GENERAL olarak gönder
    };

    // API formatına dönüştür
    const apiData = {
      recipientId: studentId,
      recipientName: notification.studentName || 'Öğrenci', // NotificationModal'dan gelmeli
      targetType: 'COMPANY_STUDENT',
      notificationType: typeMapping[notification.type] || 'GENERAL',
      title: notification.title,
      content: notification.message,
      isAutomatic: false,
      fcmToken: null // Mobil entegrasyonda eklenecek
    };

    const response: ApiResponse = await apiClient.post('/notification-logs', apiData);
    
    if (response.success) {
      console.log('Bildirim başarıyla gönderildi ve tarihçeye kaydedildi');
      return true;
    }
    
    console.error('Bildirim gönderme başarısız:', response);
    return false;
  } catch (error) {
    console.error('Bildirim gönderme hatası:', error);
    return false;
  }
};

export const updateStudentStatus = async (id: string, status: string): Promise<Student> => {
  try {
    const response: ApiResponse = await apiClient.patch(`/students/${id}`, {
      status: status
    });
    if (response.success && response.data) {
      return mapApiStudentToLocal(response.data);
    }
    throw new Error('Failed to update student status');
  } catch (error) {
    console.error('Error updating student status:', error);
    throw error;
  }
};

// Hook for using students
export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await getStudents();
        setStudents(data);
        setError(null);
      } catch (err) {
        setError('Öğrenciler yüklenirken hata oluştu');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return {
    students,
    loading,
    error,
    refetch: () => {
      const fetchStudents = async () => {
        try {
          setLoading(true);
          const data = await getStudents();
          setStudents(data);
          setError(null);
        } catch (err) {
          setError('Öğrenciler yüklenirken hata oluştu');
          console.error('Error fetching students:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchStudents();
    }
  };
};