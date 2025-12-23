import type { Student } from '../../students/types/types';
import type { Instructor } from '../../instructors/types/types';

export interface MatchingResult {
  studentId: string;
  instructorId: string;
  studentName: string;
  instructorName: string;
  studentGender: 'male' | 'female';
  instructorGender: 'male' | 'female';
  studentStatus: 'active' | 'inactive' | 'completed' | 'failed';
  licenseType: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  matchDate: string;
  // Yeni sınav bilgileri
  writtenExamAttempts?: number;
  writtenExamMaxAttempts?: number;
  writtenExamStatus?: 'not-taken' | 'passed' | 'failed';
  drivingExamAttempts?: number;
  drivingExamMaxAttempts?: number;
  drivingExamStatus?: 'not-taken' | 'passed' | 'failed';
}

export interface MatchingStats {
  totalStudents: number;
  totalInstructors: number;
  matchedStudents: number;
  unmatchedStudents: number;
  instructorUtilization: InstructorUtilization[];
}

export interface InstructorUtilization {
  instructorId: string;
  instructorName: string;
  currentStudents: number;
  newAssignments: number;
  utilization: number; // percentage
  licenseTypes: string[];
  gender: 'male' | 'female';
}

export interface MatchingRequest {
  licenseTypes: string[]; // ['A', 'A1', 'A2'] - Çoklu ehliyet türü desteği
  considerGender: boolean; // Cinsiyet eşleştirmesi yapılsın mı
  prioritizeFirstDrivingAttempt?: boolean; // İlk direksiyon hakkı olan öğrencileri önceliklendir
}

export interface MatchingError {
  studentId?: string;
  studentName?: string;
  reason: 'NO_SUITABLE_INSTRUCTOR' | 'INSTRUCTOR_FULL' | 'LICENSE_TYPE_MISMATCH' | 'GENDER_MISMATCH' | 'NO_ELIGIBLE_STUDENTS';
  details: string;
}