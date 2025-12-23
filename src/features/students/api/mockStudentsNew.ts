import type { Student } from '../types/types';

// Test amaçlı basit mock veriler - Yeni sınav sistemi ile
export const mockStudentsNew: Student[] = [
  {
    id: '1',
    name: 'Ahmet',
    surname: 'Yılmaz',
    tcNo: '12345678901',
    phone: '05321234567',
    gender: 'male',
    licenseType: 'B',
    instructor: 'Mehmet Öğretmen',
    instructorName: 'Mehmet Öğretmen',
    status: 'active',
    
    // Yazılıdan 2. hakta geçti, direksiyon henüz girmedi
    writtenExam: {
      status: 'passed',
      attempts: 2,
      maxAttempts: 4,
      lastExamDate: '2023-10-15',
      passedAtAttempt: 2,
      failedAttempts: [1]
    },
    drivingExam: {
      status: 'not-taken',
      attempts: 0,
      maxAttempts: 4
    },
    
    totalPayment: 5000,
    paidAmount: 3000,
    createdAt: '2023-09-01T09:00:00',
    lastUpdated: '2023-11-05T14:30:00'
  },
  
  {
    id: '2',
    name: 'Ayşe',
    surname: 'Demir',
    tcNo: '23456789012',
    phone: '05331234567',
    gender: 'female',
    licenseType: 'B',
    instructor: 'Ali Öğretmen',
    instructorName: 'Ali Öğretmen',
    status: 'active',
    
    // Yazılıdan 1. hakta geçti, direksiyondan 3 kez kaldı
    writtenExam: {
      status: 'passed',
      attempts: 1,
      maxAttempts: 4,
      lastExamDate: '2023-10-10',
      passedAtAttempt: 1
    },
    drivingExam: {
      status: 'failed',
      attempts: 3,
      maxAttempts: 4,
      lastExamDate: '2023-12-15',
      failedAttempts: [1, 2, 3]
    },
    
    totalPayment: 4500,
    paidAmount: 4500,
    createdAt: '2023-08-15T11:20:00',
    lastUpdated: '2023-12-16T16:45:00'
  },
  
  {
    id: '3',
    name: 'Mehmet',
    surname: 'Kaya',
    tcNo: '34567890123',
    phone: '05341234567',
    gender: 'male',
    licenseType: 'B',
    instructor: 'Zeynep Öğretmen',
    instructorName: 'Zeynep Öğretmen',
    status: 'completed',
    
    // Her iki sınavdan da geçti
    writtenExam: {
      status: 'passed',
      attempts: 1,
      maxAttempts: 4,
      lastExamDate: '2023-09-20',
      passedAtAttempt: 1
    },
    drivingExam: {
      status: 'passed',
      attempts: 2,
      maxAttempts: 4,
      lastExamDate: '2023-11-25',
      passedAtAttempt: 2,
      failedAttempts: [1]
    },
    
    totalPayment: 5500,
    paidAmount: 5500,
    createdAt: '2023-07-20T13:10:00',
    lastUpdated: '2023-11-26T10:20:00'
  },
  
  {
    id: '4',
    name: 'Fatma',
    surname: 'Şahin',
    tcNo: '45678901234',
    phone: '05351234567',
    gender: 'female',
    licenseType: 'A',
    instructor: 'Mustafa Öğretmen',
    instructorName: 'Mustafa Öğretmen',
    status: 'failed',
    
    // Yazılıdan 4 kez kaldı - hakkı bitti
    writtenExam: {
      status: 'failed',
      attempts: 4,
      maxAttempts: 4,
      lastExamDate: '2023-12-10',
      failedAttempts: [1, 2, 3, 4]
    },
    drivingExam: {
      status: 'not-taken',
      attempts: 0,
      maxAttempts: 4
    },
    
    totalPayment: 6000,
    paidAmount: 4000,
    createdAt: '2023-06-10T15:30:00',
    lastUpdated: '2023-12-11T09:15:00'
  },
  
  {
    id: '5',
    name: 'Ali',
    surname: 'Yıldız',
    tcNo: '56789012345',
    phone: '05361234567',
    gender: 'male',
    licenseType: 'B',
    instructor: 'Ayşe Öğretmen',
    instructorName: 'Ayşe Öğretmen',
    status: 'completed',
    
    // İki sınavı da geçmiş - tamamlanmış
    writtenExam: {
      status: 'passed',
      attempts: 1,
      maxAttempts: 4,
      lastExamDate: '2023-11-05',
      passedAtAttempt: 1
    },
    drivingExam: {
      status: 'passed',
      attempts: 2,
      maxAttempts: 4,
      lastExamDate: '2023-11-20',
      passedAtAttempt: 2,
      failedAttempts: [1]
    },
    
    totalPayment: 5000,
    paidAmount: 5000,
    createdAt: '2023-11-01T10:00:00',
    lastUpdated: '2023-11-20T14:30:00'
  },
  
  {
    id: '6',
    name: 'Zeynep',
    surname: 'Demir',
    tcNo: '67890123456',
    phone: '05371234567',
    gender: 'female',
    licenseType: 'B',
    instructor: 'Mehmet Öğretmen',
    instructorName: 'Mehmet Öğretmen',
    status: 'completed',
    
    // İki sınavı da geçmiş - tamamlanmış
    writtenExam: {
      status: 'passed',
      attempts: 3,
      maxAttempts: 4,
      lastExamDate: '2023-10-15',
      passedAtAttempt: 3,
      failedAttempts: [1, 2]
    },
    drivingExam: {
      status: 'passed',
      attempts: 1,
      maxAttempts: 4,
      lastExamDate: '2023-11-10',
      passedAtAttempt: 1
    },
    
    totalPayment: 5200,
    paidAmount: 5200,
    createdAt: '2023-09-15T09:00:00',
    lastUpdated: '2023-11-10T16:45:00'
  }
];

// API functions
export const getStudentsNew = (): Promise<Student[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockStudentsNew);
    }, 500);
  });
};

export const getStudentByIdNew = (id: string): Promise<Student> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const student = mockStudentsNew.find(s => s.id === id);
      if (student) {
        resolve(student);
      } else {
        reject(new Error('Öğrenci bulunamadı'));
      }
    }, 300);
  });
};