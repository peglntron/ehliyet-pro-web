import { useState } from 'react';
import type { StudentDocument, DocumentType } from '../types/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export const useStudentDocuments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDocuments = async (studentId: string): Promise<StudentDocument[]> => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/student-documents/student/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Evraklar yüklenemedi');
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

  const createDocument = async (
    studentId: string,
    documentData: Partial<StudentDocument>
  ): Promise<StudentDocument> => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/student-documents/student/${studentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(documentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Evrak eklenemedi');
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

  const updateDocument = async (
    documentId: string,
    documentData: Partial<StudentDocument>
  ): Promise<StudentDocument> => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/student-documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(documentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Evrak güncellenemedi');
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

  const deleteDocument = async (documentId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/student-documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Evrak silinemedi');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypes = async (): Promise<DocumentType[]> => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/student-documents/types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Evrak tipleri yüklenemedi');
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

  return {
    loading,
    error,
    getDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocumentTypes
  };
};
