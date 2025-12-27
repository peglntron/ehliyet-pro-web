// Sınav durumu güncelleme işlemleri - Backend API ile
import { studentAPI } from '../../../api/students';
import type { Student } from '../types/types';
import { mapApiStudentToUI } from '../api/studentAdapter';

export const updateWrittenExamStatus = async (
  studentId: string,
  status: 'PASSED' | 'FAILED',
  examDate?: string
): Promise<Student> => {
  try {
    const apiStudent = await studentAPI.updateWrittenExam(studentId, {
      status,
      examDate
    });
    return mapApiStudentToUI(apiStudent);
  } catch (error: any) {
    console.error('Yazılı sınav güncellenirken hata:', error);
    // Backend'den gelen hata mesajını kullan
    const message = error?.response?.data?.message || 'Yazılı sınav durumu güncellenemedi';
    throw new Error(message);
  }
};

export const updateDrivingExamStatus = async (
  studentId: string,
  status: 'PASSED' | 'FAILED',
  examDate?: string
): Promise<Student> => {
  try {
    const apiStudent = await studentAPI.updateDrivingExam(studentId, {
      status,
      examDate
    });
    return mapApiStudentToUI(apiStudent);
  } catch (error: any) {
    console.error('Direksiyon sınavı güncellenirken hata:', error);
    console.error('Error response:', error?.response);
    console.error('Error response data:', error?.response?.data);
    console.error('Error message:', error?.response?.data?.message);
    
    // Backend'den gelen hata mesajını kullan
    const message = error?.response?.data?.message || error?.message || 'Direksiyon sınavı durumu güncellenemedi';
    throw new Error(message);
  }
};

export const resetExamStatus = async (
  studentId: string,
  examType: 'written' | 'driving' | 'all'
): Promise<Student> => {
  try {
    const apiStudent = await studentAPI.resetExam(studentId, examType);
    return mapApiStudentToUI(apiStudent);
  } catch (error: any) {
    console.error('Sınav durumu sıfırlanırken hata:', error);
    // Backend'den gelen hata mesajını kullan
    const message = error?.response?.data?.message || 'Sınav durumu sıfırlanamadı';
    throw new Error(message);
  }
};
