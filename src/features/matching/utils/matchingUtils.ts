import type { Student } from '../../students/types/types';
import type { Instructor } from '../../instructors/types/types';
import type { MatchingResult, MatchingStats, MatchingRequest, MatchingError, InstructorUtilization } from '../types/types';

/**
 * Öğrenci-Eğitmen Eşleştirme Utility Functions
 */
export class MatchingUtils {
  
  /**
   * Ana eşleştirme fonksiyonu
   */
  static async performMatching(
    students: Student[], 
    instructors: Instructor[], 
    request: MatchingRequest,
    selectedStudentIds: Set<string>,
    selectedInstructorIds: Set<string>
  ): Promise<{
    matches: MatchingResult[];
    errors: MatchingError[];
    stats: MatchingStats;
  }> {
    
    const matches: MatchingResult[] = [];
    const errors: MatchingError[] = [];
    
    // Seçili öğrencileri filtrele
    let eligibleStudents = students.filter(student => {
      const isEligible = student.writtenExam?.status === 'passed' && 
        student.drivingExam?.status !== 'passed' &&
        student.licenseType === request.licenseType;
      
      if (!isEligible) return false;
      
      // Eğer özel seçim yapılmışsa, sadece seçilenleri dahil et
      if (selectedStudentIds.size > 0) {
        return selectedStudentIds.has(student.id);
      }
      
      return true;
    });

    // İlk direksiyon hakkı filtresi
    if (request.prioritizeFirstDrivingAttempt) {
      eligibleStudents = eligibleStudents.filter(student => 
        (student.drivingExam?.attempts || 0) === 0
      );
    }
    
    // Seçili eğitmenleri filtrele
    const availableInstructors = instructors.filter(instructor => {
      const isAvailable = instructor.status === 'active' &&
        instructor.licenseTypes?.includes(request.licenseType);
      
      if (!isAvailable) return false;
      
      // Eğer özel seçim yapılmışsa, sadece seçilenleri dahil et
      if (selectedInstructorIds.size > 0) {
        return selectedInstructorIds.has(instructor.id);
      }
      
      return true;
    });
    
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
    
    // Eğitmenlere hedef öğrenci sayısı ata
    const instructorTargets = this.calculateInstructorTargets(
      availableInstructors, 
      eligibleStudents.length, 
      request
    );
    
    // Öğrencileri cinsiyete göre ayır
    const maleStudents = eligibleStudents.filter(s => s.gender === 'male');
    const femaleStudents = eligibleStudents.filter(s => s.gender === 'female');
    
    console.log(`Total eligible students: ${eligibleStudents.length} (Male: ${maleStudents.length}, Female: ${femaleStudents.length})`);
    console.log(`Available instructors: ${availableInstructors.length}`);
    
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
          details: 'Seçili eğitmenlerin kapasitesi dolu'
        });
      }
    });
    
    const stats = this.calculateStats(eligibleStudents, availableInstructors, matches);
    
    console.log(`Final matches: ${matches.length}`);
    console.log(`Final errors: ${errors.length}`);
    
    return { matches, errors, stats };
  }

  /**
   * Eğitmenlere hedef öğrenci sayısı ata
   */
  private static calculateInstructorTargets(
    instructors: Instructor[], 
    totalStudents: number, 
    request: MatchingRequest
  ) {
    const targets = instructors.map(instructor => ({
      ...instructor,
      targetStudentCount: Math.floor(totalStudents / instructors.length),
      assignedStudents: 0,
      assignedMale: 0,
      assignedFemale: 0
    }));
    
    // Kalan öğrencileri dağıt
    const remainder = totalStudents % instructors.length;
    for (let i = 0; i < remainder; i++) {
      targets[i].targetStudentCount++;
    }
    
    return targets;
  }

  /**
   * Cinsiyet bazında öğrenci dağılımı
   */
  private static distributeStudentsByGender(
    students: Student[],
    instructorTargets: any[],
    gender: 'male' | 'female',
    matches: MatchingResult[]
  ) {
    const assignedProperty = gender === 'male' ? 'assignedMale' : 'assignedFemale';
    
    students.forEach(student => {
      // En az atanmış eğitmeni bul
      const availableInstructor = instructorTargets
        .filter(instructor => instructor.assignedStudents < instructor.targetStudentCount)
        .sort((a, b) => {
          // Önce toplam atanmış öğrenci sayısına göre sırala
          if (a.assignedStudents !== b.assignedStudents) {
            return a.assignedStudents - b.assignedStudents;
          }
          // Sonra cinsiyet dengesine göre sırala
          return a[assignedProperty] - b[assignedProperty];
        })[0];
      
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
          console.log(`Overflow assigned ${student.name} ${student.surname} to ${anyAvailableInstructor.firstName} ${anyAvailableInstructor.lastName}`);
        }
      }
    });
  }

  /**
   * İstatistikleri hesapla
   */
  private static calculateStats(
    students: Student[],
    instructors: Instructor[],
    matches: MatchingResult[]
  ): MatchingStats {
    const instructorUtilization: InstructorUtilization[] = instructors.map(instructor => {
      const instructorMatches = matches.filter(m => m.instructorId === instructor.id);
      const currentStudents = instructorMatches.length;
      const utilization = currentStudents * 10; // Her öğrenci %10 kullanım oranı (basit hesaplama)
      
      return {
        instructorId: instructor.id,
        instructorName: `${instructor.firstName} ${instructor.lastName}`,
        currentStudents: currentStudents,
        newAssignments: instructorMatches.length,
        utilization: utilization,
        licenseTypes: instructor.licenseTypes || [],
        gender: instructor.gender
      };
    });

    return {
      totalStudents: students.length,
      totalInstructors: instructors.length,
      matchedStudents: matches.length,
      unmatchedStudents: students.length - matches.length,
      instructorUtilization
    };
  }
}

// Dışa aktarım fonksiyonları
export const performMatching = (
  students: Student[], 
  instructors: Instructor[], 
  request: MatchingRequest,
  selectedStudentIds: Set<string> = new Set(),
  selectedInstructorIds: Set<string> = new Set()
) => {
  return MatchingUtils.performMatching(students, instructors, request, selectedStudentIds, selectedInstructorIds);
};