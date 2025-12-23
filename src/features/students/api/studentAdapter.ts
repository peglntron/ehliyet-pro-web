// Backend API'den gelen Student'ı UI Student formatına dönüştürür
import type { Student as ApiStudent } from '../../../api/students';
import type { Student as UIStudent } from '../types/types';

export const mapApiStudentToUI = (apiStudent: ApiStudent): UIStudent => {
  // instructorAssignments'tan aktif eğitmeni bul
  const activeAssignment = apiStudent.instructorAssignments?.find((a: any) => a.isActive);
  const instructorId = activeAssignment?.instructorId || apiStudent.instructor?.id;
  const instructorName = activeAssignment 
    ? `${activeAssignment.instructor.firstName} ${activeAssignment.instructor.lastName}`
    : (apiStudent.instructor 
        ? `${apiStudent.instructor.firstName} ${apiStudent.instructor.lastName}`
        : undefined);
  
  return {
    id: apiStudent.id,
    companyId: apiStudent.companyId,
    name: apiStudent.firstName,
    surname: apiStudent.lastName,
    tcNo: apiStudent.tcNo,
    phone: apiStudent.phone,
    email: apiStudent.email,
    photoUrl: apiStudent.photoUrl, // Fotoğraf URL'i
    address: apiStudent.address,
    province: apiStudent.province,
    district: apiStudent.district,
    gender: apiStudent.gender === 'MALE' ? 'male' : 'female',
    licenseType: apiStudent.licenseType as any,
    instructor: instructorId,
    instructorName: instructorName,
    instructorAssignments: apiStudent.instructorAssignments as any, // Pass through instructorAssignments
    status: mapApiStatus(apiStudent.status),
    startDate: apiStudent.startDate || apiStudent.createdAt,
    notes: apiStudent.notes,
    
    // Sınav bilgileri
    writtenExam: {
      status: mapExamStatus(apiStudent.writtenExamStatus),
      attempts: apiStudent.writtenExamAttempts,
      maxAttempts: 4,
      lastExamDate: apiStudent.writtenExamDate,
      passedAtAttempt: apiStudent.writtenExamStatus === 'PASSED' 
        ? apiStudent.writtenExamAttempts 
        : undefined
    },
    
    drivingExam: {
      status: mapExamStatus(apiStudent.drivingExamStatus),
      attempts: apiStudent.drivingExamAttempts,
      maxAttempts: 4,
      lastExamDate: apiStudent.drivingExamDate,
      passedAtAttempt: apiStudent.drivingExamStatus === 'PASSED' 
        ? apiStudent.drivingExamAttempts 
        : undefined
    },
    
    // Sınav tarih ve saatleri (Backend'den direk gelen alanlar)
    writtenExamDate: apiStudent.writtenExamDate,
    writtenExamTime: apiStudent.writtenExamTime,
    drivingExamDate: apiStudent.drivingExamDate,
    drivingExamTime: apiStudent.drivingExamTime,
    
    // Tarihler
    createdAt: apiStudent.createdAt,
    lastUpdated: apiStudent.updatedAt,
    
    // Payments - varsa dönüştür
    payments: apiStudent.payments?.map(p => ({
      id: p.id,
      amount: Number(p.amount),
      date: p.paymentDate,
      method: mapPaymentMethod(p.paymentMethod),
      status: mapPaymentStatus(p.status),
      type: p.type || 'PAYMENT', // DEBT, INSTALLMENT, PAYMENT
      description: p.description,
      isInstallment: p.installmentNumber !== null,
      installmentNumber: p.installmentNumber,
      totalInstallments: p.totalInstallments,
      relatedDebtId: p.relatedDebtId || null
    }))
  };
};

// API Student status'unu UI status'una dönüştür
const mapApiStatus = (status: string): 'active' | 'inactive' | 'completed' | 'failed' => {
  switch (status) {
    case 'ACTIVE':
      return 'active';
    case 'INACTIVE':
      return 'inactive';
    case 'COMPLETED':
      return 'completed';
    case 'FAILED':
    case 'CANCELLED': // Vazgeçen öğrenci
      return 'failed';
    default:
      return 'active';
  }
};

// Exam status mapping
const mapExamStatus = (status: string): 'not-taken' | 'passed' | 'failed' => {
  switch (status) {
    case 'PASSED':
      return 'passed';
    case 'FAILED':
      return 'failed';
    case 'NOT_TAKEN':
    default:
      return 'not-taken';
  }
};

// Payment method mapping
const mapPaymentMethod = (method: string): 'cash' | 'credit' | 'bank' | 'pos' => {
  switch (method) {
    case 'CASH':
      return 'cash';
    case 'CREDIT_CARD':
      return 'credit';
    case 'BANK_TRANSFER':
      return 'bank';
    case 'CHECK':
      return 'pos';
    default:
      return 'cash';
  }
};

// Payment status mapping - Frontend uppercase kullanıyor
const mapPaymentStatus = (status: string): 'PENDING' | 'PAID' | 'CANCELLED' => {
  switch (status) {
    case 'PAID':
    case 'COMPLETED':
      return 'PAID';
    case 'PENDING':
      return 'PENDING';
    case 'CANCELLED':
    case 'CANCELED':
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
};
