import { useState, useEffect } from 'react';
import { apiClient } from '../../../utils/api';
import type { Expense, ExpenseFormData, ExpenseStats, CategoryStats, MonthlyTrend } from '../types/types';

interface UseExpensesParams {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  isPaid?: boolean;
  paymentMethod?: string;
}

export const useExpenses = (params?: UseExpensesParams) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.isPaid !== undefined) queryParams.append('isPaid', params.isPaid.toString());
      if (params?.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);

      const response = await apiClient.get(`/expenses?${queryParams.toString()}`);
      if (response.success && response.data) {
        setExpenses(response.data);
        setStats(response.stats || null);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Giderler yüklenirken hata oluştu');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [params?.categoryId, params?.startDate, params?.endDate, params?.isPaid, params?.paymentMethod]);

  return {
    expenses,
    stats,
    loading,
    error,
    refetch: fetchExpenses
  };
};

export const useExpenseStats = (startDate?: string, endDate?: string) => {
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);

        const response = await apiClient.get(`/expenses/stats?${queryParams.toString()}`);
        if (response.success && response.data) {
          setCategoryStats(response.data.byCategory || []);
          setMonthlyTrend(response.data.monthlyTrend || []);
        }
        setError(null);
      } catch (err: any) {
        setError(err.message || 'İstatistikler yüklenirken hata oluştu');
        console.error('Error fetching expense stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [startDate, endDate]);

  return {
    categoryStats,
    monthlyTrend,
    loading,
    error
  };
};

export const createExpense = async (data: ExpenseFormData): Promise<Expense> => {
  const response = await apiClient.post('/expenses', {
    ...data,
    amount: parseFloat(data.amount)
  });
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error('Gider oluşturulamadı');
};

export const updateExpense = async (id: string, data: Partial<ExpenseFormData>): Promise<Expense> => {
  const response = await apiClient.put(`/expenses/${id}`, {
    ...data,
    ...(data.amount && { amount: parseFloat(data.amount) })
  });
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error('Gider güncellenemedi');
};

export const deleteExpense = async (id: string): Promise<boolean> => {
  const response = await apiClient.delete(`/expenses/${id}`);
  return response.success;
};
