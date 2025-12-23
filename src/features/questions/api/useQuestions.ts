import { useState, useEffect } from 'react';
import { questionApi, getImageUrl } from '../../../utils/api';
import type { Question, Lesson, Unit } from '../types/types';

// Questions hook with real API integration
export const useQuestions = (filters?: {
  lessonId?: string;
  unitId?: string;
  isActive?: boolean;
  cikmis?: boolean;
  animasyonlu?: boolean;
  page?: number;
  limit?: number;
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await questionApi.getAll(filters);
      
      if (response.success && response.data) {
        // Process questions to ensure proper image URLs
        const processedQuestions = response.data.questions.map(question => ({
          ...question,
          mediaUrl: question.mediaUrl ? getImageUrl(question.mediaUrl) : null
        }));
        
        setQuestions(processedQuestions);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.message || 'Failed to fetch questions');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [
    filters?.lessonId,
    filters?.unitId,
    filters?.isActive,
    filters?.cikmis,
    filters?.animasyonlu,
    filters?.page,
    filters?.limit
  ]);

  const refreshQuestions = () => {
    fetchQuestions();
  };

  return {
    questions,
    loading,
    error,
    pagination,
    refreshQuestions
  };
};

// Lessons hook
export const useLessons = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await questionApi.getLessons();
      
      if (response.success && response.data) {
        setLessons(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch lessons');
      }
    } catch (err) {
      console.error('Error fetching lessons:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  return {
    lessons,
    loading,
    error,
    refreshLessons: fetchLessons
  };
};

// Units hook
export const useUnits = (lessonId?: string) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await questionApi.getUnitsByLesson(id);
      
      if (response.success && response.data) {
        setUnits(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch units');
      }
    } catch (err) {
      console.error('Error fetching units:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lessonId) {
      fetchUnits(lessonId);
    } else {
      setUnits([]);
    }
  }, [lessonId]);

  return {
    units,
    loading,
    error,
    fetchUnits
  };
};

// Get question by ID
export const getQuestionById = async (id: string): Promise<Question> => {
  try {
    const response = await questionApi.getById(id);
    
    if (response.success && response.data) {
      // Process question to ensure proper image URL
      const question = {
        ...response.data,
        mediaUrl: response.data.mediaUrl ? getImageUrl(response.data.mediaUrl) : null
      };
      return question;
    } else {
      throw new Error(response.message || 'Question not found');
    }
  } catch (error) {
    console.error('Error fetching question:', error);
    throw new Error('Soru bulunamadı');
  }
};
