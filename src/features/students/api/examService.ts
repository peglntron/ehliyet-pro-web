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
  } catch (error) {
    console.error('Yazılı sınav güncellenirken hata:', error);
    throw new Error('Yazılı sınav durumu güncellenemedi');
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
  } catch (error) {
    console.error('Direksiyon sınavı güncellenirken hata:', error);
    throw new Error('Direksiyon sınavı durumu güncellenemedi');
  }
};

export const resetExamStatus = async (
  studentId: string,
  examType: 'written' | 'driving' | 'all'
): Promise<Student> => {
  try {
    const apiStudent = await studentAPI.resetExam(studentId, examType);
    return mapApiStudentToUI(apiStudent);
  } catch (error) {
    console.error('Sınav durumu sıfırlanırken hata:', error);
    throw new Error('Sınav durumu sıfırlanamadı');
  }
};
