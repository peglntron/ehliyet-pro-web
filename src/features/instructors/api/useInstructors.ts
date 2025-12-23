import { useState, useEffect } from 'react';
import { apiClient, type Instructor, type ApiResponse } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import type { InstructorMonthlyTrend } from '../types/types';

// API functions
export const getInstructors = async (companyId?: string): Promise<Instructor[]> => {
  try {
    const response: ApiResponse<Instructor[]> = await apiClient.getWithCompanyFilter('/instructors', companyId);
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return [];
  }
};

export const getInstructorById = async (id: string): Promise<Instructor> => {
  try {
    const response: ApiResponse<Instructor> = await apiClient.get(`/instructors/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Instructor not found');
  } catch (error) {
    console.error('Error fetching instructor:', error);
    throw new Error('Eğitmen bulunamadı');
  }
};

export const createInstructor = async (instructorData: any, companyId?: string): Promise<Instructor> => {
  try {
    const response: ApiResponse<Instructor> = await apiClient.postWithCompanyData('/instructors', instructorData, companyId);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to create instructor');
  } catch (error) {
    console.error('Error creating instructor:', error);
    throw error;
  }
};

export const updateInstructor = async (id: string, instructorData: any, companyId?: string): Promise<Instructor> => {
  try {
    const response: ApiResponse<Instructor> = await apiClient.putWithCompanyData(`/instructors/${id}`, instructorData, companyId);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to update instructor');
  } catch (error) {
    console.error('Error updating instructor:', error);
    throw error;
  }
};

export const deleteInstructor = async (id: string): Promise<boolean> => {
  try {
    const response: ApiResponse = await apiClient.delete(`/instructors/${id}`);
    return response.success;
  } catch (error) {
    console.error('Error deleting instructor:', error);
    throw error;
  }
};

// Hook for using instructors (list)
export const useInstructors = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        // Use company filter for company users
        const companyId = user?.role !== 'SYSTEM_ADMIN' ? user?.companyId : undefined;
        const data = await getInstructors(companyId);
        setInstructors(data);
        setError(null);
      } catch (err) {
        setError('Eğitmenler yüklenirken hata oluştu');
        console.error('Error fetching instructors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, [user]);

  return {
    instructors,
    loading,
    error,
    refetch: () => {
      const fetchInstructors = async () => {
        try {
          setLoading(true);
          const companyId = user?.role !== 'SYSTEM_ADMIN' ? user?.companyId : undefined;
          const data = await getInstructors(companyId);
          setInstructors(data);
          setError(null);
        } catch (err) {
          setError('Eğitmenler yüklenirken hata oluştu');
          console.error('Error fetching instructors:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchInstructors();
    }
  };
};

// Hook for using single instructor
export const useInstructor = (id: string) => {
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setInstructor(null);
      setLoading(false);
      return;
    }

    const fetchInstructor = async () => {
      try {
        setLoading(true);
        const data = await getInstructorById(id);
        
        // Dashboard istatistiklerini çek
        try {
          const statsResponse = await apiClient.get('/dashboard/instructor-stats');
          const instructorStats = statsResponse.data.instructors.find(
            (stat: any) => stat.instructor_id === id
          );
          
          if (instructorStats) {
            // Bu Dönem (Aylık)
            data.monthlyTotalStudents = instructorStats.monthly_total_students;
            data.monthlyPassedStudents = instructorStats.monthly_passed_students;
            data.monthlySuccessRate = instructorStats.monthly_success_rate;
            // Tüm Zamanlar
            data.studentCount = instructorStats.total_students_all_time;
            data.passedStudents = instructorStats.total_passed_students;
            data.totalAttempts = instructorStats.total_exam_attempts;
            data.successRate = instructorStats.all_time_success_rate;
            data.currentActiveStudents = instructorStats.current_active_students;
            data.firstAttemptSuccessRate = instructorStats.first_attempt_success_rate;
          }
        } catch (statsErr) {
          console.warn('İstatistikler yüklenemedi:', statsErr);
        }
        
        setInstructor(data);
        setError(null);
      } catch (err) {
        setError('Eğitmen yüklenirken hata oluştu');
        console.error('Error fetching instructor:', err);
        setInstructor(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [id]);

  return {
    instructor,
    loading,
    error,
    refetch: () => {
      if (!id) return;
      
      const fetchInstructor = async () => {
        try {
          setLoading(true);
          const data = await getInstructorById(id);
          setInstructor(data);
          setError(null);
        } catch (err) {
          setError('Eğitmen yüklenirken hata oluştu');
          console.error('Error fetching instructor:', err);
          setInstructor(null);
        } finally {
          setLoading(false);
        }
      };
      fetchInstructor();
    }
  };
};

// Hook: Eğitmen aylık performans trendi (son 6 ay)
export const useInstructorMonthlyTrend = (instructorId: string) => {
  const [trends, setTrends] = useState<InstructorMonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!instructorId) {
      setTrends([]);
      setLoading(false);
      return;
    }

    const fetchTrend = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/dashboard/instructor-stats/${instructorId}/trend`);
        if (response.data.success && response.data.data.trends) {
          setTrends(response.data.data.trends);
          setError(null);
        }
      } catch (err) {
        setError('Performans trendi yüklenemedi');
        console.error('Error fetching instructor trend:', err);
        setTrends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrend();
  }, [instructorId]);

  return { trends, loading, error };
};