import type { Student } from '../types/types';

// Sınav durumlarını hesaplayan utility functions
export const getExamStatusDisplay = (student: Student) => {
  const { writtenExam, drivingExam } = student;
  
  // Yazılı sınav durumu
  const writtenStatus = {
    status: writtenExam.status,
    display: getExamStatusText(writtenExam.status, writtenExam.attempts, writtenExam.passedAtAttempt),
    attempts: writtenExam.attempts,
    maxAttempts: writtenExam.maxAttempts,
    passedAtAttempt: writtenExam.passedAtAttempt
  };
  
  // Direksiyon sınav durumu
  const drivingStatus = {
    status: drivingExam.status,
    display: getExamStatusText(drivingExam.status, drivingExam.attempts, drivingExam.passedAtAttempt),
    attempts: drivingExam.attempts,
    maxAttempts: drivingExam.maxAttempts,
    passedAtAttempt: drivingExam.passedAtAttempt
  };
  
  return {
    written: writtenStatus,
    driving: drivingStatus
  };
};

// Sınav durumu metnini oluştur
export const getExamStatusText = (
  status: 'not-taken' | 'passed' | 'failed',
  attempts: number,
  passedAtAttempt?: number
): string => {
  switch (status) {
    case 'not-taken':
      return attempts === 0 ? 'Henüz Girmedi' : `${attempts}. Hak Kullanıldı`;
    case 'passed':
      // İlk denemede geçti (attempts = 1) ise "İlk Denemede Geçti"
      if (passedAtAttempt === 1) {
        return 'İlk Denemede Geçti';
      }
      return passedAtAttempt ? `${passedAtAttempt}. Denemede Geçti` : 'Geçti';
    case 'failed':
      return `${attempts}. Hakta Kaldı`;
    default:
      return 'Bilinmiyor';
  }
};

// Sınav durumu rengini belirle
export const getExamStatusColor = (
  status: 'not-taken' | 'passed' | 'failed',
  attempts: number,
  maxAttempts: number
): 'default' | 'success' | 'error' | 'warning' => {
  switch (status) {
    case 'not-taken':
      return 'default';
    case 'passed':
      return 'success';
    case 'failed':
      return attempts >= maxAttempts ? 'error' : 'warning';
    default:
      return 'default';
  }
};

// Öğrencinin genel durumunu belirle
export const getStudentOverallStatus = (student: Student): {
  status: 'waiting' | 'written-only' | 'driving-only' | 'completed' | 'failed';
  display: string;
  color: 'default' | 'info' | 'success' | 'warning' | 'error';
} => {
  const { writtenExam, drivingExam } = student;
  
  // Her iki sınav da geçildi
  if (writtenExam.status === 'passed' && drivingExam.status === 'passed') {
    return {
      status: 'completed',
      display: 'Tamamlandı',
      color: 'success'
    };
  }
  
  // Yazılıdan geçti, direksiyon bekliyor
  if (writtenExam.status === 'passed' && drivingExam.status === 'not-taken') {
    return {
      status: 'written-only',
      display: 'Direksiyon Bekliyor',
      color: 'info'
    };
  }
  
  // Yazılıdan geçti, direksiyondan kaldı
  if (writtenExam.status === 'passed' && drivingExam.status === 'failed') {
    return {
      status: 'written-only',
      display: `Direksiyondan Kaldı (${drivingExam.attempts}/${drivingExam.maxAttempts})`,
      color: drivingExam.attempts >= drivingExam.maxAttempts ? 'error' : 'warning'
    };
  }
  
  // Yazılıdan kaldı
  if (writtenExam.status === 'failed') {
    return {
      status: 'failed',
      display: `Yazılıdan Kaldı (${writtenExam.attempts}/${writtenExam.maxAttempts})`,
      color: writtenExam.attempts >= writtenExam.maxAttempts ? 'error' : 'warning'
    };
  }
  
  // Henüz sınava girmedi
  return {
    status: 'waiting',
    display: 'Sınav Bekliyor',
    color: 'default'
  };
};

// 2+ kez direksiyondan kalan öğrenciler
export const getMultipleDrivingFailedStudents = (students: Student[]): Student[] => {
  return students.filter(student => 
    student.drivingExam.status === 'failed' && 
    student.drivingExam.attempts >= 2
  );
};

// Sınav hakkı biten öğrenciler
export const getExamRightsExhaustedStudents = (students: Student[]): Student[] => {
  return students.filter(student => 
    (student.writtenExam.attempts >= student.writtenExam.maxAttempts && student.writtenExam.status === 'failed') ||
    (student.drivingExam.attempts >= student.drivingExam.maxAttempts && student.drivingExam.status === 'failed')
  );
};