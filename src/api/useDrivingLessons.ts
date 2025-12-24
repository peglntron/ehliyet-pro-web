import { useState } from 'react';
import type {
  DrivingLesson,
  CreateTomorrowScheduleRequest,
  CreateTomorrowScheduleResult,
  UpdateLessonTimeRequest,
  MarkInstructorDoneRequest
} from '../types/drivingLesson';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface EligibleStudent {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  totalLessonsEntitled: number;
  lessonsCompleted: number;
  lessonsRemaining: number;
}

export const useDrivingLessons = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEligibleStudents = async (): Promise<EligibleStudent[]> => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/driving-lessons/eligible-students`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Öğrenciler yüklenemedi');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDrivingLessons = async (params?: {
    instructorId?: string;
    date?: string;
    status?: string;
  }): Promise<DrivingLesson[]> => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (params?.instructorId) queryParams.append('instructorId', params.instructorId);
      if (params?.date) queryParams.append('date', params.date);
      if (params?.status) queryParams.append('status', params.status);

      const response = await fetch(
        `${API_URL}/api/driving-lessons?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Dersler yüklenemedi');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTomorrowSchedule = async (
    request: CreateTomorrowScheduleRequest
  ): Promise<CreateTomorrowScheduleResult[]> => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/driving-lessons/tomorrow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Plan oluşturulamadı');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLessonTime = async (
    lessonId: string,
    request: UpdateLessonTimeRequest
  ): Promise<DrivingLesson> => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/driving-lessons/${lessonId}/time`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Saat güncellenemedi');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAsInstructorDone = async (
    lessonId: string,
    request?: MarkInstructorDoneRequest
  ): Promise<DrivingLesson> => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/driving-lessons/${lessonId}/instructor-done`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request || {})
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'İşlem başarısız');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelLesson = async (lessonId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/driving-lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ders iptal edilemedi');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getEligibleStudents,
    getDrivingLessons,
    createTomorrowSchedule,
    updateLessonTime,
    markAsInstructorDone,
    cancelLesson
  };
};
