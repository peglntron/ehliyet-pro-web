import type { Student, Payment } from '../types/types';

// Mock API çağrısı - gerçek uygulamada bir API endpoint'e istek yapılacak
export const getStudents = (): Promise<Student[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockStudents);
    }, 500);
  });
};

// Belirli bir öğrenciyi ID'ye göre getir
export const getStudentById = (id: string): Promise<Student> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const student = mockStudents.find(s => s.id === id);
      if (student) {
        resolve(student);
      } else {
        reject(new Error('Öğrenci bulunamadı'));
      }
    }, 300);
  });
};

// Örnek kursiyer verileri
const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Ahmet',
    surname: 'Yılmaz',
    tcNo: '12345678901',
    phone: '05321234567',
    gender: 'male',
    licenseType: 'B',
    instructor: 'Mehmet Öğretmen',
    examDate: '2023-12-15',
    examTime: '10:30',
    examLocation: 'İstanbul Sürücü Sınav Merkezi',
    examVehicle: '34 ABC 123',
    examType: 'Direksiyon',
    licenseClass: 'B',
    status: 'active',
    
    // Yeni sınav sistemi
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
    
    totalPayment: 10000,
    initialPayment: 4000,
    paidAmount: 7000,
    remainingDebt: 3000,
    installmentCount: 3,
    installments: [
      {
        id: 'i1',
        installmentNumber: 1,
        amount: 2000,
        dueDate: '2023-10-01',
        status: 'paid',
        paymentDate: '2023-09-28',
        paymentMethod: 'cash',
        paymentId: 'p2'
      },
      {
        id: 'i2',
        installmentNumber: 2,
        amount: 2000,
        dueDate: '2023-11-01',
        status: 'paid',
        paymentDate: '2023-10-30',
        paymentMethod: 'pos',
        paymentId: 'p3'
      },
      {
        id: 'i3',
        installmentNumber: 3,
        amount: 2000,
        dueDate: '2023-12-01',
        status: 'pending'
      }
    ],
    createdAt: '2023-09-01T09:00:00',
    lastUpdated: '2023-11-05T14:30:00',
    payments: [
      {
        id: 'p1',
        amount: 4000,
        date: '2023-09-01',
        method: 'cash',
        status: 'paid',
        description: 'İlk ödeme (peşin)',
        isInstallment: false
      },
      {
        id: 'p2',
        amount: 2000,
        date: '2023-09-28',
        method: 'cash',
        status: 'paid',
        description: '1. Taksit',
        installmentId: 'i1',
        isInstallment: true
      },
      {
        id: 'p3',
        amount: 2000,
        date: '2023-10-30',
        method: 'pos',
        status: 'paid',
        description: '2. Taksit',
        installmentId: 'i2',
        isInstallment: true
      }
    ]
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
    examDate: '2023-12-20',
    examTime: '13:45',
    examLocation: 'Ankara Sürücü Sınav Merkezi',
    examVehicle: '06 XYZ 789',
    examType: 'Teorik',
    licenseClass: 'A2',
    status: 'active',
    
    // Yazılıdan geçti, direksiyon bekliyor
    writtenExam: {
      status: 'passed',
      attempts: 1,
      maxAttempts: 4,
      lastExamDate: '2023-10-10',
      passedAtAttempt: 1
    },
    drivingExam: {
      status: 'not-taken',
      attempts: 0,
      maxAttempts: 4
    },
    
    totalPayment: 4500,
    paidAmount: 4500,
    createdAt: '2023-08-15T11:20:00',
    lastUpdated: '2023-10-10T16:45:00',
    payments: [
      {
        id: 'p4',
        amount: 4500,
        date: '2023-08-15',
        method: 'cash',
        status: 'paid',
        description: 'Tek seferde ödeme'
      }
    ]
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
    examDate: '2023-12-18',
    examTime: '09:15',
    examLocation: 'İzmir Sürücü Sınav Merkezi',
    examVehicle: '35 DEF 456',
    examType: 'Direksiyon',
    licenseClass: 'B',
    status: 'active',
    
    // Yazılıdan geçti, direksiyon geçti
    writtenExam: {
      status: 'passed',
      attempts: 1,
      maxAttempts: 4,
      lastExamDate: '2023-10-15',
      passedAtAttempt: 1
    },
    drivingExam: {
      status: 'passed',
      attempts: 1,
      maxAttempts: 4,
      lastExamDate: '2023-11-01',
      passedAtAttempt: 1
    },
    
    totalPayment: 5500,
    paidAmount: 4000,
    createdAt: '2023-07-20T13:10:00',
    lastUpdated: '2023-11-01T10:20:00',
    payments: [
      {
        id: 'p5',
        amount: 2000,
        date: '2023-07-20',
        method: 'bank',
        status: 'paid',
        description: 'İlk taksit'
      },
      {
        id: 'p6',
        amount: 2000,
        date: '2023-08-20',
        method: 'bank',
        status: 'paid',
        description: 'İkinci taksit'
      },
      {
        id: 'p7',
        amount: 1500,
        date: '2023-09-20',
        method: 'bank',
        status: 'pending',
        description: 'Son taksit'
      }
    ]
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
    examDate: '2023-12-25',
    examTime: '14:00',
    examLocation: 'Bursa Sürücü Sınav Merkezi',
    examVehicle: '16 GHI 789',
    examType: 'Direksiyon',
    licenseClass: 'A',
    status: 'failed',
    // Eksik alanlar eklendi
    writtenExam: {
      status: 'failed',
      attempts: 4,
      maxAttempts: 4,
      lastExamDate: '2023-10-01',
      failedAttempts: [1, 2, 3, 4]
    },
    drivingExam: {
      status: 'not-taken',
      attempts: 0,
      maxAttempts: 4
    },
    totalPayment: 6000,
    paidAmount: 6000,
    createdAt: '2023-06-10T09:45:00',
    lastUpdated: '2023-10-15T11:30:00',
    payments: [
      {
        id: 'p8',
        amount: 3000,
        date: '2023-06-10',
        method: 'cash',
        status: 'paid',
        description: 'İlk taksit'
      },
      {
        id: 'p9',
        amount: 3000,
        date: '2023-07-10',
        method: 'credit',
        status: 'paid',
        description: 'Son taksit'
      }
    ]
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
    examDate: '2023-12-22',
    examTime: '11:30',
    examLocation: 'Antalya Sürücü Sınav Merkezi',
    examVehicle: '07 JKL 012',
    examType: 'Teorik',
    licenseClass: 'B1',
    status: 'active',
    // Eksik alanlar eklendi
    writtenExam: {
      status: 'not-taken',
      attempts: 0,
      maxAttempts: 4
    },
    drivingExam: {
      status: 'not-taken',
      attempts: 0,
      maxAttempts: 4
    },
    totalPayment: 5200,
    paidAmount: 2600,
    createdAt: '2023-09-05T14:30:00',
    lastUpdated: '2023-10-25T15:40:00',
    payments: [
      {
        id: 'p10',
        amount: 2600,
        date: '2023-09-05',
        method: 'bank',
        status: 'paid',
        description: 'İlk taksit'
      },
      {
        id: 'p11',
        amount: 2600,
        date: '2023-10-05',
        method: 'bank',
        status: 'pending',
        description: 'Son taksit'
      }
    ]
  },
  {
    id: '6',
    name: 'Zeynep',
    surname: 'Özkan',
    tcNo: '67890123456',
    phone: '05371234567',
    gender: 'female',
    licenseType: 'B',
    examDate: '2023-12-28',
    examTime: '08:45',
    examLocation: 'İstanbul Sürücü Sınav Merkezi',
    examType: 'Teorik',
    licenseClass: 'B',
    status: 'active',
    
    // Yazılıdan geçti, direksiyon bekliyor
    writtenExam: {
      status: 'passed',
      attempts: 1,
      maxAttempts: 4,
      lastExamDate: '2023-11-01',
      passedAtAttempt: 1
    },
    drivingExam: {
      status: 'not-taken',
      attempts: 0,
      maxAttempts: 4
    },
    
    totalPayment: 4800,
    paidAmount: 4800,
    createdAt: '2023-09-10T10:15:00',
    lastUpdated: '2023-11-20T12:30:00',
    payments: [
      {
        id: 'p12',
        amount: 4800,
        date: '2023-09-10',
        method: 'bank',
        status: 'paid',
        description: 'Tek seferde ödeme'
      }
    ]
  },
  {
    id: '7',
    name: 'Burak',
    surname: 'Aydın',
    tcNo: '78901234567',
    phone: '05381234567',
    gender: 'male',
    licenseType: 'A',
    examDate: '2023-12-30',
    examTime: '15:20',
    examLocation: 'Ankara Sürücü Sınav Merkezi',
    examType: 'Teorik',
    licenseClass: 'A',
    status: 'active',
    
    // Yazılıdan geçti, direksiyon bekliyor
    writtenExam: {
      status: 'passed',
      attempts: 1,
      maxAttempts: 4,
      lastExamDate: '2023-11-15',
      passedAtAttempt: 1
    },
    drivingExam: {
      status: 'not-taken',
      attempts: 0,
      maxAttempts: 4
    },
    
    totalPayment: 5800,
    paidAmount: 5800,
    createdAt: '2023-08-20T16:45:00',
    lastUpdated: '2023-11-25T14:20:00',
    payments: [
      {
        id: 'p13',
        amount: 5800,
        date: '2023-08-20',
        method: 'cash',
        status: 'paid',
        description: 'Tek seferde ödeme'
      }
    ]
  },
  {
    id: '8',
    name: 'Seda',
    surname: 'Tekin',
    tcNo: '89012345678',
    phone: '05391234567',
    gender: 'female',
    licenseType: 'B',
    examDate: '2024-01-02',
    examTime: '11:00',
    examLocation: 'İzmir Sürücü Sınav Merkezi',
    examType: 'Teorik',
    licenseClass: 'B',
    status: 'active',
    
    // Yazılıdan geçti, direksiyon bekliyor
    writtenExam: {
      status: 'passed',
      attempts: 1,
      maxAttempts: 4,
      lastExamDate: '2023-11-20',
      passedAtAttempt: 1
    },
    drivingExam: {
      status: 'not-taken',
      attempts: 0,
      maxAttempts: 4
    },
    
    totalPayment: 4700,
    paidAmount: 3000,
    createdAt: '2023-09-15T13:30:00',
    lastUpdated: '2023-11-28T09:15:00',
    payments: [
      {
        id: 'p14',
        amount: 3000,
        date: '2023-09-15',
        method: 'bank',
        status: 'paid',
        description: 'İlk taksit'
      },
      {
        id: 'p15',
        amount: 1700,
        date: '2023-12-15',
        method: 'bank',
        status: 'pending',
        description: 'Son taksit'
      }
    ]
  },
  {
    id: '9',
    name: 'Murat',
    surname: 'Çelik',
    tcNo: '90123456789',
    phone: '05401234567',
    gender: 'male',
    licenseType: 'B',
    examDate: '2024-01-05',
    examTime: '14:30',
    examLocation: 'Bursa Sürücü Sınav Merkezi',
    examType: 'Teorik',
    licenseClass: 'B',
    status: 'active',
    
    // Yazılıdan geçti, direksiyon bekliyor
    writtenExam: {
      status: 'passed',
      attempts: 1,
      maxAttempts: 4,
      lastExamDate: '2023-11-25',
      passedAtAttempt: 1
    },
    drivingExam: {
      status: 'not-taken',
      attempts: 0,
      maxAttempts: 4
    },
    
    totalPayment: 5100,
    paidAmount: 5100,
    createdAt: '2023-08-25T08:20:00',
    lastUpdated: '2023-12-01T11:45:00',
    payments: [
      {
        id: 'p16',
        amount: 5100,
        date: '2023-08-25',
        method: 'cash',
        status: 'paid',
        description: 'Tek seferde ödeme'
      }
    ]
  },
  {
    id: '10',
    name: 'Elif',
    surname: 'Koç',
    tcNo: '01234567890',
    phone: '05411234567',
    gender: 'female',
    licenseType: 'A',
    examDate: '2024-01-08',
    examTime: '10:15',
    examLocation: 'Antalya Sürücü Sınav Merkezi',
    examType: 'Teorik',
    licenseClass: 'A',
    status: 'active',
    
    // Yazılıdan geçti, direksiyon bekliyor
    writtenExam: {
      status: 'passed',
      attempts: 1,
      maxAttempts: 4,
      lastExamDate: '2023-12-01',
      passedAtAttempt: 1
    },
    drivingExam: {
      status: 'not-taken',
      attempts: 0,
      maxAttempts: 4
    },
    
    totalPayment: 5900,
    paidAmount: 4000,
    createdAt: '2023-09-05T14:50:00',
    lastUpdated: '2023-12-05T16:20:00',
    payments: [
      {
        id: 'p17',
        amount: 4000,
        date: '2023-09-05',
        method: 'bank',
        status: 'paid',
        description: 'İlk taksit'
      },
      {
        id: 'p18',
        amount: 1900,
        date: '2024-01-05',
        method: 'bank',
        status: 'pending',
        description: 'Son taksit'
      }
    ]
  },
  {
    id: '11',
    name: 'Ceren',
    surname: 'Yılmaz',
    tcNo: '12345098765',
    phone: '05421234567',
    gender: 'female',
    licenseType: 'B',
    examDate: '2024-01-10',
    examTime: '09:30',
    examLocation: 'İstanbul Sürücü Sınav Merkezi',
    examType: 'Teorik',
    licenseClass: 'B',
    status: 'active',
    
    // Yazılıdan geçti, direksiyon bekliyor
    writtenExam: {
      status: 'passed',
      attempts: 1,
      maxAttempts: 4,
      lastExamDate: '2023-12-01',
      passedAtAttempt: 1
    },
    drivingExam: {
      status: 'not-taken',
      attempts: 0,
      maxAttempts: 4
    },
    
    totalPayment: 4900,
    paidAmount: 4900,
    createdAt: '2023-09-20T11:00:00',
    lastUpdated: '2023-12-08T10:00:00',
    payments: [
      {
        id: 'p19',
        amount: 4900,
        date: '2023-09-20',
        method: 'bank',
        status: 'paid',
        description: 'Tek seferde ödeme'
      }
    ]
  },
  {
    id: '12',
    name: 'Kaan',
    surname: 'Öztürk',
    tcNo: '23456109876',
    phone: '05431234567',
    gender: 'male',
    licenseType: 'B',
    examDate: '2024-01-12',
    examTime: '14:15',
    examLocation: 'Ankara Sürücü Sınav Merkezi',
    examType: 'Teorik',
    licenseClass: 'B',
    status: 'active',
    
    // Yazılıdan geçti, direksiyon bekliyor
    writtenExam: {
      status: 'passed',
      attempts: 1,
      maxAttempts: 4,
      lastExamDate: '2023-12-05',
      passedAtAttempt: 1
    },
    drivingExam: {
      status: 'not-taken',
      attempts: 0,
      maxAttempts: 4
    },
    
    totalPayment: 5200,
    paidAmount: 3500,
    createdAt: '2023-09-25T14:30:00',
    lastUpdated: '2023-12-10T16:00:00',
    payments: [
      {
        id: 'p20',
        amount: 3500,
        date: '2023-09-25',
        method: 'cash',
        status: 'paid',
        description: 'İlk ödeme'
      },
      {
        id: 'p21',
        amount: 1700,
        date: '2024-01-15',
        method: 'bank',
        status: 'pending',
        description: 'Son taksit'
      }
    ]
  },
  {
    id: '13',
    name: 'Deniz',
    surname: 'Kara',
    tcNo: '34567210987',
    phone: '05441234567',
    gender: 'female',
    licenseType: 'B',
    examDate: '2024-01-15',
    examTime: '11:45',
    examLocation: 'İzmir Sürücü Sınav Merkezi',
    examType: 'Teorik',
    licenseClass: 'B',
    status: 'active',
    
    // Yazılıdan geçti, direksiyon bekliyor
    writtenExam: {
      status: 'passed',
      attempts: 1,
      maxAttempts: 4,
      lastExamDate: '2023-12-08',
      passedAtAttempt: 1
    },
    drivingExam: {
      status: 'not-taken',
      attempts: 0,
      maxAttempts: 4
    },
    
    totalPayment: 4800,
    paidAmount: 4800,
    createdAt: '2023-10-01T09:15:00',
    lastUpdated: '2023-12-12T14:20:00',
    payments: [
      {
        id: 'p22',
        amount: 4800,
        date: '2023-10-01',
        method: 'bank',
        status: 'paid',
        description: 'Tek seferde ödeme'
      }
    ]
  },
  {
    id: '14',
    name: 'Ege',
    surname: 'Aksoy',
    tcNo: '45678321098',
    phone: '05451234567',
    gender: 'male',
    licenseType: 'B',
    examDate: '2024-01-18',
    examTime: '08:30',
    examLocation: 'Bursa Sürücü Sınav Merkezi',
    examType: 'Teorik',
    licenseClass: 'B',
    status: 'active',
    totalPayment: 5100,
    paidAmount: 5100,
    createdAt: '2023-10-05T13:45:00',
    lastUpdated: '2023-12-15T11:30:00',
    payments: [
      {
        id: 'p23',
        amount: 5100,
        date: '2023-10-05',
        method: 'cash',
        status: 'paid',
        description: 'Tek seferde ödeme'
      }
    ]
  },
  {
    id: '15',
    name: 'Hale',
    surname: 'Demir',
    tcNo: '56789432109',
    phone: '05461234567',
    gender: 'female',
    licenseType: 'B',
    examDate: '2024-01-20',
    examTime: '15:00',
    examLocation: 'Antalya Sürücü Sınav Merkezi',
    examType: 'Teorik',
    licenseClass: 'B',
    status: 'active',
    totalPayment: 4700,
    paidAmount: 3000,
    createdAt: '2023-10-10T16:20:00',
    lastUpdated: '2023-12-18T09:45:00',
    payments: [
      {
        id: 'p24',
        amount: 3000,
        date: '2023-10-10',
        method: 'bank',
        status: 'paid',
        description: 'İlk taksit'
      },
      {
        id: 'p25',
        amount: 1700,
        date: '2024-01-20',
        method: 'bank',
        status: 'pending',
        description: 'Son taksit'
      }
    ]
  },
  {
    id: '16',
    name: 'İbrahim',
    surname: 'Çelik',
    tcNo: '67890543210',
    phone: '05471234567',
    gender: 'male',
    licenseType: 'B',
    examDate: '2024-01-22',
    examTime: '12:15',
    examLocation: 'Trabzon Sürücü Sınav Merkezi',
    examType: 'Teorik',
    licenseClass: 'B',
    status: 'active',
    totalPayment: 5000,
    paidAmount: 5000,
    createdAt: '2023-10-15T10:30:00',
    lastUpdated: '2023-12-20T15:10:00',
    payments: [
      {
        id: 'p26',
        amount: 5000,
        date: '2023-10-15',
        method: 'cash',
        status: 'paid',
        description: 'Tek seferde ödeme'
      }
    ]
  },
  {
    id: '17',
    name: 'Jale',
    surname: 'Koç',
    tcNo: '78901654321',
    phone: '05481234567',
    gender: 'female',
    licenseType: 'B',
    examDate: '2024-01-25',
    examTime: '10:45',
    examLocation: 'Adana Sürücü Sınav Merkezi',
    examType: 'Teorik',
    licenseClass: 'B',
    status: 'active',
    totalPayment: 4600,
    paidAmount: 4600,
    createdAt: '2023-10-20T08:45:00',
    lastUpdated: '2023-12-22T12:30:00',
    payments: [
      {
        id: 'p27',
        amount: 4600,
        date: '2023-10-20',
        method: 'bank',
        status: 'paid',
        description: 'Tek seferde ödeme'
      }
    ]
  },
  {
    id: '18',
    name: 'Kerem',
    surname: 'Şahin',
    tcNo: '89012765432',
    phone: '05491234567',
    gender: 'male',
    licenseType: 'B',
    examDate: '2024-01-28',
    examTime: '13:30',
    examLocation: 'Eskişehir Sürücü Sınav Merkezi',
    examType: 'Teorik',
    licenseClass: 'B',
    status: 'active',
    totalPayment: 5300,
    paidAmount: 4000,
    createdAt: '2023-10-25T12:15:00',
    lastUpdated: '2023-12-25T14:45:00',
    payments: [
      {
        id: 'p28',
        amount: 4000,
        date: '2023-10-25',
        method: 'bank',
        status: 'paid',
        description: 'İlk ödeme'
      },
      {
        id: 'p29',
        amount: 1300,
        date: '2024-02-01',
        method: 'bank',
        status: 'pending',
        description: 'Son taksit'
      }
    ]
  }
];

// Bildirim gönderme işlevi
export const sendNotification = (studentId: string, notification: any): Promise<boolean> => {
  return new Promise((resolve) => {
    // Gerçek API çağrısı burada yapılacak
    console.log(`Bildirim gönderiliyor: ${studentId}`, notification);
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
};

// Öğrenci durumunu güncelleme fonksiyonu
export const updateStudentStatus = (studentId: string, newStatus: Student['status']): Promise<Student> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const studentIndex = mockStudents.findIndex(s => s.id === studentId);
      if (studentIndex !== -1) {
        mockStudents[studentIndex] = {
          ...mockStudents[studentIndex],
          status: newStatus,
          lastUpdated: new Date().toISOString()
        };
        resolve(mockStudents[studentIndex]);
      } else {
        reject(new Error('Öğrenci bulunamadı'));
      }
    }, 500);
  });
};
