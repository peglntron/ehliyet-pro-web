import { apiClient } from '../../../utils/api';
import type { StudentPaymentStatus, PaymentSummary } from '../types/types';

// Geciken ödemelerin özet bilgilerini getir
export const getPaymentSummary = async (): Promise<PaymentSummary> => {
  try {
    const response = await apiClient.get('/payments/overdue/summary');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Özet bilgiler alınamadı');
  } catch (error) {
    console.error('Ödeme özeti hatası:', error);
    throw error;
  }
};

// Borçlu öğrenci listesini getir
export const getOverduePayments = async (status?: 'all' | 'overdue' | 'upcoming' | 'partial'): Promise<StudentPaymentStatus[]> => {
  try {
    const queryParams = status && status !== 'all' ? `?status=${status}` : '';
    const response = await apiClient.get(`/payments/overdue/students${queryParams}`);
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Borçlu öğrenci listesi hatası:', error);
    return [];
  }
};

// Öğrencinin detaylı ödeme bilgilerini getir
export const getStudentPaymentDetails = async (studentId: string): Promise<StudentPaymentStatus | null> => {
  try {
    const response = await apiClient.get(`/payments/student/${studentId}/details`);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Öğrenci ödeme detayları hatası:', error);
    return null;
  }
};

// Taksiti ödendi olarak işaretle
export const markInstallmentAsPaid = async (
  installmentId: string,
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'POS'
): Promise<void> => {
  try {
    await apiClient.patch(`/payments/${installmentId}/mark-paid`, {
      method: paymentMethod,
      paymentDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Taksit ödeme hatası:', error);
    throw error;
  }
};