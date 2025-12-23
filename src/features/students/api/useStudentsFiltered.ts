import type { Student } from '../types/types';
import { getStudents } from './useStudents';

// Tamamlanmış öğrencileri getir
export const getCompletedStudents = async (): Promise<Student[]> => {
  try {
    // Gerçek API çağrısı yerine mock data kullanıyoruz
    const allStudents = await getStudents();
    
    // Sadece tamamlanmış öğrencileri filtrele
    const completedStudents = allStudents.filter(student => 
      student.status === 'completed'
    );
    
    return completedStudents;
  } catch (error) {
    console.error('Tamamlanmış öğrenciler getirilirken hata:', error);
    throw error;
  }
};

// Aktif öğrencileri getir (tamamlanmışlar hariç)
export const getActiveStudents = async (): Promise<Student[]> => {
  try {
    // Gerçek API çağrısı yerine mock data kullanıyoruz
    const allStudents = await getStudents();
    
    // Tamamlanmış öğrenciler hariç aktif öğrencileri filtrele
    const activeStudents = allStudents.filter(student => 
      student.status !== 'completed'
    );
    
    return activeStudents;
  } catch (error) {
    console.error('Aktif öğrenciler getirilirken hata:', error);
    throw error;
  }
};

// Öğrenci istatistikleri
export const getStudentStats = async () => {
  try {
    const allStudents = await getStudents();
    
    const stats = {
      total: allStudents.length,
      active: allStudents.filter(s => s.status !== 'completed').length,
      completed: allStudents.filter(s => s.status === 'completed').length,
      failed: allStudents.filter(s => s.status === 'failed').length,
      newRegistrations: allStudents.filter(s => s.writtenExam.status === 'not-taken').length,
      writtenPassed: allStudents.filter(s => 
        s.writtenExam.status === 'passed' && s.drivingExam.status !== 'passed'
      ).length
    };
    
    return stats;
  } catch (error) {
    console.error('Öğrenci istatistikleri getirilirken hata:', error);
    throw error;
  }
};