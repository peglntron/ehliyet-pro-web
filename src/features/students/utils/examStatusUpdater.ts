import type { Student } from '../types/types';

// Sınav durumu güncelleme fonksiyonu
export const updateExamStatus = (
  student: Student,
  examType: 'written' | 'driving',
  action: 'pass' | 'fail' | 'reset'
): Student => {
  const updatedStudent = { ...student };
  const currentDate = new Date().toISOString().split('T')[0];

  if (examType === 'written') {
    switch (action) {
      case 'pass':
        updatedStudent.writtenExam = {
          ...updatedStudent.writtenExam,
          status: 'passed',
          attempts: updatedStudent.writtenExam.attempts + 1,
          lastExamDate: currentDate,
          passedAtAttempt: updatedStudent.writtenExam.attempts + 1
        };
        break;
      
      case 'fail':
        const newAttempts = updatedStudent.writtenExam.attempts + 1;
        const failedAttempts = updatedStudent.writtenExam.failedAttempts || [];
        updatedStudent.writtenExam = {
          ...updatedStudent.writtenExam,
          status: 'failed',
          attempts: newAttempts,
          lastExamDate: currentDate,
          failedAttempts: [...failedAttempts, newAttempts]
        };
        break;
      
      case 'reset':
        updatedStudent.writtenExam = {
          status: 'not-taken',
          attempts: 0,
          maxAttempts: 4
        };
        // Yazılı sıfırlanırsa direksiyon da sıfırlanmalı
        if (updatedStudent.drivingExam.status !== 'not-taken') {
          updatedStudent.drivingExam = {
            status: 'not-taken',
            attempts: 0,
            maxAttempts: 4
          };
        }
        break;
    }
  } else {
    // Direksiyon sınavı için yazılı sınavın geçilmiş olması gerekir
    if (action !== 'reset' && updatedStudent.writtenExam.status !== 'passed') {
      throw new Error('Direksiyon sınavı için önce yazılı sınavı geçmelisiniz');
    }

    switch (action) {
      case 'pass':
        updatedStudent.drivingExam = {
          ...updatedStudent.drivingExam,
          status: 'passed',
          attempts: updatedStudent.drivingExam.attempts + 1,
          lastExamDate: currentDate,
          passedAtAttempt: updatedStudent.drivingExam.attempts + 1
        };
        // Her iki sınav da geçildiyse status'u güncelle
        updatedStudent.status = 'completed';
        break;
      
      case 'fail':
        const newAttempts = updatedStudent.drivingExam.attempts + 1;
        const failedAttempts = updatedStudent.drivingExam.failedAttempts || [];
        updatedStudent.drivingExam = {
          ...updatedStudent.drivingExam,
          status: 'failed',
          attempts: newAttempts,
          lastExamDate: currentDate,
          failedAttempts: [...failedAttempts, newAttempts]
        };
        break;
      
      case 'reset':
        updatedStudent.drivingExam = {
          status: 'not-taken',
          attempts: 0,
          maxAttempts: 4
        };
        // Status'u güncelle
        if (updatedStudent.status === 'completed') {
          updatedStudent.status = 'active';
        }
        break;
    }
  }

  // Genel status güncellemesi
  if (action !== 'reset') {
    if (updatedStudent.writtenExam.status === 'passed' && updatedStudent.drivingExam.status === 'passed') {
      updatedStudent.status = 'completed';
    } else if (
      (updatedStudent.writtenExam.status === 'failed' && updatedStudent.writtenExam.attempts >= updatedStudent.writtenExam.maxAttempts) ||
      (updatedStudent.drivingExam.status === 'failed' && updatedStudent.drivingExam.attempts >= updatedStudent.drivingExam.maxAttempts)
    ) {
      updatedStudent.status = 'failed';
    } else {
      updatedStudent.status = 'active';
    }
  }

  updatedStudent.lastUpdated = new Date().toISOString();
  return updatedStudent;
};

// API fonksiyonu simülasyonu
export const updateStudentExamStatus = async (
  studentId: string,
  examType: 'written' | 'driving',
  action: 'pass' | 'fail' | 'reset'
): Promise<Student> => {
  // Gerçek uygulamada burada API çağrısı yapılacak
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock işlem - gerçek API'de student güncellenmiş hali dönecek
      resolve({} as Student);
    }, 500);
  });
};