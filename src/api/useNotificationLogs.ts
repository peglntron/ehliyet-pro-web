import axios from 'axios';
import { useState, useCallback } from 'react';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api`;

interface NotificationLog {
  id: string;
  title: string;
  message: string;
  type: 'general' | 'payment' | 'exam' | 'lesson'; // Bildirim türü
  targetType: 'company_student' | 'instructor'; // Hedef kitle
  studentId: string;
  studentName: string;
  createdAt: string;
  isRead: boolean;
  readAt?: string;
  isAutomatic: boolean;
  deliveryStatus: string;
  templateId?: string;
  templateName?: string;
  triggerType?: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  automatic: number;
  manual: number;
  byType: {
    [key: string]: number;
  };
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useNotificationLogs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Bildirim loglarını listele
   */
  const getNotificationLogs = useCallback(async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    isRead?: boolean;
    startDate?: string;
    endDate?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const response = await axios.get(
        `${API_BASE_URL}/notification-logs?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setLoading(false);
      return {
        notifications: response.data.data.notifications as NotificationLog[],
        pagination: response.data.data.pagination as PaginationData
      };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Bildirimler yüklenirken bir hata oluştu';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Tekil bildirim detayı
   */
  const getNotificationLogById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/notification-logs/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setLoading(false);
      return response.data.data as NotificationLog;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Bildirim detayı yüklenirken bir hata oluştu';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Yeni bildirim oluştur
   */
  const createNotification = useCallback(async (data: {
    recipientId: string;
    recipientName: string;
    targetType: string; // Hedef kitle (COMPANY_STUDENT/INSTRUCTOR)
    notificationType?: string; // Bildirim türü (GENERAL/PAYMENT/EXAM/LESSON)
    title: string;
    content: string;
    templateId?: string;
    isAutomatic?: boolean;
    fcmToken?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/notification-logs`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setLoading(false);
      return response.data.data as NotificationLog;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Bildirim oluşturulurken bir hata oluştu';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Bildirimi okundu olarak işaretle
   */
  const markAsRead = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/notification-logs/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setLoading(false);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Bildirim güncellenirken bir hata oluştu';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Okunmamış bildirim sayısı
   */
  const getUnreadCount = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/notification-logs/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setLoading(false);
      return response.data.data.unreadCount as number;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Okunmamış sayısı alınırken bir hata oluştu';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Bildirim istatistikleri
   */
  const getNotificationStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/notification-logs/stats`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setLoading(false);
      return response.data.data as NotificationStats;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'İstatistikler alınırken bir hata oluştu';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    loading,
    error,
    getNotificationLogs,
    getNotificationLogById,
    createNotification,
    markAsRead,
    getUnreadCount,
    getNotificationStats
  };
};
