import { useState, useEffect } from 'react';
import { apiClient } from '../../../utils/api';
import type { ExpenseCategory, ExpenseCategoryFormData } from '../types/types';

export const useExpenseCategories = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/expense-categories');
      if (response.success && response.data) {
        setCategories(response.data);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Gider kalemleri yüklenirken hata oluştu');
      console.error('Error fetching expense categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};

export const createExpenseCategory = async (data: Partial<ExpenseCategoryFormData> & { 
  defaultAmount?: number; 
  autoCreateDay?: number;
}): Promise<ExpenseCategory> => {
  const response = await apiClient.post('/expense-categories', data);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error('Gider kalemi oluşturulamadı');
};

export const updateExpenseCategory = async (id: string, data: Partial<ExpenseCategoryFormData> & {
  defaultAmount?: number;
  autoCreateDay?: number;
}): Promise<ExpenseCategory> => {
  const response = await apiClient.put(`/expense-categories/${id}`, data);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error('Gider kalemi güncellenemedi');
};

export const deleteExpenseCategory = async (id: string): Promise<boolean> => {
  const response = await apiClient.delete(`/expense-categories/${id}`);
  return response.success;
};
