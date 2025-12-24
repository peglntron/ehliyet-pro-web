import type { Student } from '../../students/types/types';
import type { Instructor } from '../../instructors/types/types';
import type { MatchingResult, MatchingStats, MatchingRequest, MatchingError, InstructorUtilization } from '../types/types';
import { getToken } from '../../../utils/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
const API_BASE_URL = `${API_URL}/api`; // /api prefix ekle

/**
 * Backend API çağrıları için yardımcı fonksiyon
 */
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Öğrenci-Eğitmen Eşleştirme Servisi
 * 
 * Backend API'sine bağlanır ve eşleştirme işlemlerini yönetir
 */

export class MatchingService {
  
  /**
   * Backend'den eşleştirme hesaplama (önizleme - kaydetmeden)
   */
  static async calculateMatching(
    licenseTypes: string[],
    considerGender: boolean,
    prioritizeFirstDrivingAttempt: boolean,
    selectedStudentIds: string[],
    selectedInstructorIds: string[]
  ): Promise<{
    matches: MatchingResult[];
    errors: MatchingError[];
    stats: MatchingStats;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/matching/calculate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          licenseTypes,
          considerGender,
          prioritizeFirstDrivingAttempt,
          selectedStudentIds,
          selectedInstructorIds
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eşleştirme hesaplaması başarısız oldu');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Eşleştirme hesaplama hatası:', error);
      throw error;
    }
  }

  /**
   * Eşleştirmeyi kaydet (uygulama için)
   */
  static async saveMatching(
    licenseTypes: string[],
    considerGender: boolean,
    prioritizeFirstDrivingAttempt: boolean,
    selectedStudentIds: string[],
    selectedInstructorIds: string[],
    matchingData: {
      matches: MatchingResult[];
      stats: MatchingStats;
    },
    notes?: string
  ): Promise<{ matchingId: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/matching/save`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          licenseTypes,
          considerGender,
          prioritizeFirstDrivingAttempt,
          selectedStudentIds,
          selectedInstructorIds,
          matchingData,
          notes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eşleştirme kaydedilemedi');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Eşleştirme kaydetme hatası:', error);
      throw error;
    }
  }

  /**
   * Eşleştirmeyi öğrencilere uygula
   */
  static async applyMatching(matchingId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/matching/${matchingId}/apply`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eşleştirme uygulanamadı');
      }
    } catch (error) {
      console.error('Eşleştirme uygulama hatası:', error);
      throw error;
    }
  }

  /**
   * Eşleştirme geçmişini getir
   */
  static async getMatchingHistory(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/matching/history`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eşleştirme geçmişi alınamadı');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Eşleştirme geçmişi hatası:', error);
      throw error;
    }
  }

  /**
   * Eşleştirme detayını getir
   */
  static async getMatchingDetail(matchingId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/matching/${matchingId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eşleştirme detayı alınamadı');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Eşleştirme detayı hatası:', error);
      throw error;
    }
  }

  /**
   * LEGACY: Eski frontend algoritması - Sadece fallback için
   * @deprecated Backend API kullanılmalı
   */
  static async performMatching(
    students: Student[], 
    instructors: Instructor[], 
    request: MatchingRequest
  ): Promise<{
    matches: MatchingResult[];
    errors: MatchingError[];
    stats: MatchingStats;
  }> {
    
    const matches: MatchingResult[] = [];
    const errors: MatchingError[] = [];
    
    // Uygun öğrencileri filtrele (sadece yazılı sınavı geçenler, direksiyon henüz geçmemiş)
    const eligibleStudents = students.filter(student => 
      student.writtenExam?.status === 'passed' && 
      student.drivingExam?.status !== 'passed' &&
      student.licenseType === request.licenseType
    );
    
    // Uygun eğitmenleri filtrele
    const availableInstructors = instructors.filter(instructor => 
      instructor.status === 'active' &&
      instructor.licenseTypes?.includes(request.licenseType)
    ).map(instructor => ({
      ...instructor,
      assignedStudents: 0, // Bu eşleştirmede atanan öğrenci sayısı
      assignedMales: 0,    // Atanan erkek öğrenci sayısı
      assignedFemales: 0   // Atanan kadın öğrenci sayısı
    }));
    
    console.log(`Eligible students: ${eligibleStudents.length}`);
    console.log(`Available instructors: ${availableInstructors.length}`);
    
    // Eğitmen yoksa hata
    if (availableInstructors.length === 0) {
      eligibleStudents.forEach(student => {
        errors.push({
          studentId: student.id,
          studentName: `${student.name} ${student.surname}`,
          reason: 'NO_SUITABLE_INSTRUCTOR',
          details: `${request.licenseType} sınıfı ehliyet için uygun eğitmen bulunamadı`
        });
      });
      
      return {
        matches,
        errors,
        stats: this.calculateStats(eligibleStudents, availableInstructors, matches)
      };
    }
    
    // Öğrencileri cinsiyete göre ayır
    const maleStudents = eligibleStudents.filter(s => s.gender === 'male');
    const femaleStudents = eligibleStudents.filter(s => s.gender === 'female');
    
    console.log(`Male students: ${maleStudents.length}`);
    console.log(`Female students: ${femaleStudents.length}`);
    
    // Her eğitmene düşen öğrenci sayısını hesapla
    const instructorCount = availableInstructors.length;
    const totalStudents = eligibleStudents.length;
    const baseStudentsPerInstructor = Math.floor(totalStudents / instructorCount);
    const remainderStudents = totalStudents % instructorCount;
    
    console.log(`Base students per instructor: ${baseStudentsPerInstructor}`);
    console.log(`Remainder students: ${remainderStudents}`);
    
    // Her eğitmene kaç öğrenci atanacağını belirle
    const instructorTargets = availableInstructors.map((instructor, index) => ({
      ...instructor,
      targetStudentCount: baseStudentsPerInstructor + (index < remainderStudents ? 1 : 0),
      targetMales: 0,
      targetFemales: 0
    }));
    
    // Cinsiyet dengeli dağıtımı için her eğitmene düşen cinsiyet hedeflerini hesapla
    const maleFemaleDistribution = this.calculateGenderDistribution(
      maleStudents.length, 
      femaleStudents.length, 
      instructorTargets
    );
    
    // Final hedefleri ayarla
    instructorTargets.forEach((instructor, index) => {
      instructor.targetMales = maleFemaleDistribution[index].males;
      instructor.targetFemales = maleFemaleDistribution[index].females;
    });
    
    console.log('Instructor targets:', instructorTargets.map(i => 
      `${i.firstName} ${i.lastName}: ${i.targetStudentCount} total (${i.targetMales}M, ${i.targetFemales}F)`
    ));
    
    // Önce erkek öğrencileri dağıt
    this.distributeStudentsByGender(maleStudents, instructorTargets, 'male', matches);
    
    // Sonra kadın öğrencileri dağıt  
    this.distributeStudentsByGender(femaleStudents, instructorTargets, 'female', matches);
    
    // Eşleştirilemeyenleri errors'a ekle
    const matchedStudentIds = matches.map(m => m.studentId);
    eligibleStudents.forEach(student => {
      if (!matchedStudentIds.includes(student.id)) {
        errors.push({
          studentId: student.id,
          studentName: `${student.name} ${student.surname}`,
          reason: 'INSTRUCTOR_FULL',
          details: 'Tüm eğitmenlerin kapasitesi dolu'
        });
      }
    });
    
    const stats = this.calculateStats(eligibleStudents, availableInstructors, matches);
    
    console.log(`Final matches: ${matches.length}`);
    console.log(`Final errors: ${errors.length}`);
    
    return { matches, errors, stats };
  }
  
  /**
   * Cinsiyet dağılımını hesaplar
   */
  private static calculateGenderDistribution(
    totalMales: number,
    totalFemales: number,
    instructorTargets: any[]
  ): { males: number; females: number }[] {
    const distribution: { males: number; females: number }[] = [];
    
    // Her eğitmene düşen ortalama erkek/kadın sayısını hesapla
    const instructorCount = instructorTargets.length;
    const baseMalesPerInstructor = Math.floor(totalMales / instructorCount);
    const remainderMales = totalMales % instructorCount;
    const baseFemalesPerInstructor = Math.floor(totalFemales / instructorCount);
    const remainderFemales = totalFemales % instructorCount;
    
    for (let i = 0; i < instructorCount; i++) {
      const targetMales = baseMalesPerInstructor + (i < remainderMales ? 1 : 0);
      const targetFemales = baseFemalesPerInstructor + (i < remainderFemales ? 1 : 0);
      
      // Eğitmenin toplam hedef öğrenci sayısını aşmayacak şekilde ayarla
      const instructorTarget = instructorTargets[i].targetStudentCount;
      const totalAssigned = targetMales + targetFemales;
      
      if (totalAssigned <= instructorTarget) {
        distribution.push({ males: targetMales, females: targetFemales });
      } else {
        // Hedef sayıyı aşıyorsa orantılı olarak azalt
        const ratio = instructorTarget / totalAssigned;
        distribution.push({
          males: Math.floor(targetMales * ratio),
          females: Math.floor(targetFemales * ratio)
        });
      }
    }
    
    return distribution;
  }
  
  /**
   * Belirli cinsiyetteki öğrencileri eğitmenlere dağıtır
   */
  private static distributeStudentsByGender(
    studentsToDistribute: Student[],
    instructorTargets: any[],
    gender: 'male' | 'female',
    matches: MatchingResult[]
  ): void {
    const genderProperty = gender === 'male' ? 'targetMales' : 'targetFemales';
    const assignedProperty = gender === 'male' ? 'assignedMales' : 'assignedFemales';
    
    // Öğrencileri karıştır
    const shuffledStudents = [...studentsToDistribute].sort(() => Math.random() - 0.5);
    
    for (const student of shuffledStudents) {
      // En az yükü olan ve hedefine ulaşmamış eğitmeni bul
      const availableInstructor = instructorTargets
        .filter(instructor => 
          instructor[assignedProperty] < instructor[genderProperty] &&
          instructor.assignedStudents < instructor.targetStudentCount
        )
        .sort((a, b) => a.assignedStudents - b.assignedStudents)[0];
      
      if (availableInstructor) {
        // Eşleştirme yap
        matches.push({
          studentId: student.id,
          instructorId: availableInstructor.id,
          studentName: `${student.name} ${student.surname}`,
          instructorName: `${availableInstructor.firstName} ${availableInstructor.lastName}`,
          studentGender: student.gender,
          instructorGender: availableInstructor.gender,
          studentStatus: student.status,
          licenseType: student.licenseType,
          vehiclePlate: availableInstructor.vehiclePlate,
          vehicleModel: availableInstructor.vehicleModel,
          matchDate: new Date().toISOString(),
          // Yeni sınav bilgileri
          writtenExamAttempts: student.writtenExam?.attempts || 0,
          writtenExamMaxAttempts: student.writtenExam?.maxAttempts || 4,
          writtenExamStatus: student.writtenExam?.status || 'not-taken',
          drivingExamAttempts: student.drivingExam?.attempts || 0,
          drivingExamMaxAttempts: student.drivingExam?.maxAttempts || 4,
          drivingExamStatus: student.drivingExam?.status || 'not-taken'
        });
        
        // Sayaçları güncelle
        availableInstructor.assignedStudents++;
        availableInstructor[assignedProperty]++;
        
        console.log(`Assigned ${student.name} ${student.surname} (${gender}) to ${availableInstructor.firstName} ${availableInstructor.lastName}`);
      } else {
        // Hedeflere ulaşıldı ama hala öğrenci var, herhangi bir uygun eğitmene ata
        const anyAvailableInstructor = instructorTargets
          .filter(instructor => instructor.assignedStudents < instructor.targetStudentCount)
          .sort((a, b) => a.assignedStudents - b.assignedStudents)[0];
          
        if (anyAvailableInstructor) {
          matches.push({
            studentId: student.id,
            instructorId: anyAvailableInstructor.id,
            studentName: `${student.name} ${student.surname}`,
            instructorName: `${anyAvailableInstructor.firstName} ${anyAvailableInstructor.lastName}`,
            studentGender: student.gender,
            instructorGender: anyAvailableInstructor.gender,
            studentStatus: student.status,
            licenseType: student.licenseType,
            vehiclePlate: anyAvailableInstructor.vehiclePlate,
            vehicleModel: anyAvailableInstructor.vehicleModel,
            matchDate: new Date().toISOString(),
            // Yeni sınav bilgileri
            writtenExamAttempts: student.writtenExam?.attempts || 0,
            writtenExamMaxAttempts: student.writtenExam?.maxAttempts || 4,
            writtenExamStatus: student.writtenExam?.status || 'not-taken',
            drivingExamAttempts: student.drivingExam?.attempts || 0,
            drivingExamMaxAttempts: student.drivingExam?.maxAttempts || 4,
            drivingExamStatus: student.drivingExam?.status || 'not-taken'
          });
          
          anyAvailableInstructor.assignedStudents++;
          anyAvailableInstructor[assignedProperty]++;
          
          console.log(`Assigned ${student.name} ${student.surname} (${gender}) to ${anyAvailableInstructor.firstName} ${anyAvailableInstructor.lastName} (overflow)`);
        }
      }
    }
  }
  
  /**
   * İstatistikleri hesaplar
   */
  private static calculateStats(
    eligibleStudents: Student[], 
    instructors: any[], 
    matches: MatchingResult[]
  ): MatchingStats {
    
    const instructorUtilization: InstructorUtilization[] = instructors.map(instructor => {
      // Bu eğitmene atanan öğrenci sayısını hesapla
      const assignedToThisInstructor = matches.filter(m => m.instructorId === instructor.id);
      const newAssignments = assignedToThisInstructor.length;
      const currentStudents = 0; // Backend'den gelecek mevcut öğrenci sayısı
      const newUtilization = Math.round((newAssignments) * 10); // Basit hesaplama: her öğrenci %10
      
      return {
        instructorId: instructor.id,
        instructorName: `${instructor.firstName} ${instructor.lastName}`,
        currentStudents: currentStudents,
        newAssignments: newAssignments,
        utilization: newUtilization,
        licenseTypes: instructor.licenseTypes || [],
        gender: instructor.gender
      };
    });
    
    return {
      totalStudents: eligibleStudents.length,
      totalInstructors: instructors.length,
      matchedStudents: matches.length,
      unmatchedStudents: eligibleStudents.length - matches.length,
      instructorUtilization
    };
  }
}

/**
 * API fonksiyonları - Backend çağrıları için wrapper'lar
 */
export const performMatching = async (
  _students: Student[], 
  _instructors: Instructor[], 
  request: MatchingRequest,
  selectedStudentIds: Set<string>,
  selectedInstructorIds: Set<string>
) => {
  // Backend API'sini çağır
  return MatchingService.calculateMatching(
    request.licenseTypes,
    request.considerGender ?? true,
    request.prioritizeFirstDrivingAttempt ?? false,
    Array.from(selectedStudentIds),
    Array.from(selectedInstructorIds)
  );
};

export const saveMatchingResults = async (
  licenseTypes: string[],
  considerGender: boolean,
  prioritizeFirstDrivingAttempt: boolean,
  selectedStudentIds: string[],
  selectedInstructorIds: string[],
  matchingData: {
    matches: MatchingResult[];
    stats: MatchingStats;
  },
  notes?: string
) => {
  const result = await MatchingService.saveMatching(
    licenseTypes,
    considerGender,
    prioritizeFirstDrivingAttempt,
    selectedStudentIds,
    selectedInstructorIds,
    matchingData,
    notes
  );
  return result.matchingId;
};

/**
 * Eşleştirme için uygun öğrencileri getir
 * PENDING/APPLIED matching'lerde olmayan öğrencileri döner
 */
export const getEligibleStudents = async (
  licenseTypes: string[],
  prioritizeFirst: boolean = false,
  selectedIds: string[] = []
): Promise<Student[]> => {
  try {
    const queryParams = new URLSearchParams({
      licenseTypes: JSON.stringify(licenseTypes),
      prioritizeFirst: prioritizeFirst.toString(),
      ...(selectedIds.length > 0 && { selectedIds: JSON.stringify(selectedIds) })
    });

    const response = await fetch(`${API_BASE_URL}/matching/eligible-students?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Uygun öğrenciler getirilirken hata oluştu');
    }

    console.log('✅ [FRONTEND] Uygun öğrenciler alındı:', result.data.length);
    return result.data;
  } catch (error) {
    console.error('❌ [FRONTEND] Uygun öğrenciler getirilirken hata:', error);
    throw error;
  }
};