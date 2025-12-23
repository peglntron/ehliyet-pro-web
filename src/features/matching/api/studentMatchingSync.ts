import type { Student } from '../../students/types/types';
import type { Instructor } from '../../instructors/types/types';
import type { MatchingResult } from '../types/types';
import { MatchingService } from './matchingService';

/**
 * Eşleştirme sonuçlarını öğrenci kayıtlarına uygular
 * Backend API'sini kullanarak gerçek veritabanı güncellemesi yapar
 */
export const applyMatchingToStudents = async (
  matchingId: string
): Promise<boolean> => {
  try {
    await MatchingService.applyMatching(matchingId);
    return true;
  } catch (error) {
    console.error('Error applying matching to students:', error);
    throw error;
  }
};

/**
 * LEGACY: Eski fonksiyon - Sadece UI güncellemesi için
 * @deprecated Backend'den güncel data çekilmeli
 */
export const applyMatchingToStudentsLocal = (
  students: Student[],
  instructors: Instructor[],
  matches: MatchingResult[]
): Student[] => {
  // Eşleştirme haritası oluştur
  const matchMap = new Map<string, MatchingResult>();
  matches.forEach(match => {
    matchMap.set(match.studentId, match);
  });

  // Öğrencileri güncelle
  return students.map(student => {
    const match = matchMap.get(student.id);
    
    if (match) {
      // Eğitmen bilgilerini al
      const instructor = instructors.find(i => i.id === match.instructorId);
      
      return {
        ...student,
        instructor: match.instructorId,
        instructorName: match.instructorName,
        vehicle: instructor?.vehicleId,
        vehiclePlate: match.vehiclePlate,
        vehicleModel: match.vehicleModel,
        // Eşleştirme tarihi bilgisini de güncelle
        lastUpdated: match.matchDate
      };
    }
    
    return student; // Eşleştirilmeyen öğrenciler değişmez
  });
};

/**
 * LEGACY: Mock API fonksiyonu
 * @deprecated Backend API kullanılmalı (applyMatchingToStudents)
 */
export const updateStudentsWithMatching = async (
  updatedStudents: Student[]
): Promise<boolean> => {
  try {
    console.log('Updating students with matching results:', updatedStudents);
    
    // Simülasyon için gecikme
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Gerçek uygulamada burada API çağrısı yapılacak
    // await api.post('/students/bulk-update', updatedStudents);
    
    return true;
  } catch (error) {
    console.error('Error updating students with matching:', error);
    return false;
  }
};