// Gerçek backend API'yi kullanan student servisleri
import { studentAPI } from '../../../api/students';
import type { Student } from '../types/types';
import { mapApiStudentToUI } from './studentAdapter';

export const getActiveStudents = async (): Promise<Student[]> => {
  try {
    const apiStudents = await studentAPI.getAll({ 
      status: 'ACTIVE'
    });
    return apiStudents.map(mapApiStudentToUI);
  } catch (error) {
    console.error('Error fetching active students:', error);
    throw error;
  }
};

export const getCompletedStudents = async (): Promise<Student[]> => {
  try {
    // Backend'den tamamlanmış öğrencileri getir (her iki sınavı da geçmiş)
    const apiStudents = await studentAPI.getCompleted();
    return apiStudents.map(mapApiStudentToUI);
  } catch (error) {
    console.error('Error fetching completed students:', error);
    throw error;
  }
};

export const getAllStudents = async (): Promise<Student[]> => {
  try {
    const apiStudents = await studentAPI.getAll();
    return apiStudents.map(mapApiStudentToUI);
  } catch (error) {
    console.error('Error fetching all students:', error);
    throw error;
  }
};

export const getStudentById = async (id: string): Promise<Student | null> => {
  try {
    const apiStudent = await studentAPI.getById(id);
    return mapApiStudentToUI(apiStudent);
  } catch (error) {
    console.error('Error fetching student:', error);
    return null;
  }
};
