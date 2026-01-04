export interface Student {
  id: string;
  companyId: string;
  name: string;
  surname: string;
  tcNo: string;
  phone: string;
  email?: string; // Opsiyonel e-posta
  photoUrl?: string; // Öğrenci fotoğrafı
  address?: string; // Adres bilgisi
  province?: string; // İl bilgisi
  district?: string; // İlçe bilgisi
  gender: 'male' | 'female'; // Cinsiyet - eşleştirme için gerekli
  licenseType: 'M' | 'A1' | 'A2' | 'A' | 'B1' | 'B' | 'B Otomatik' | 'BE' | 'C1' | 'C1E' | 'C' | 'CE' | 'D1' | 'D1E' | 'D' | 'DE' | 'F'; // DEPRECATED: Ehliyet türü string
  licenseClassId?: string; // NEW: UUID relation
  instructor?: string; // Eşleştirilen eğitmen ID'si
  instructorName?: string; // Eşleştirilen eğitmen adı
  instructorAssignments?: Array<{
    id: string;
    instructorId: string;
    isActive: boolean;
    assignedDate: string;
    instructor: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
  vehicle?: string; // Eşleştirilen araç ID'si
  vehiclePlate?: string; // Eşleştirilen araç plakası
  vehicleModel?: string; // Eşleştirilen araç model bilgisi
  examDate?: string;
  examTime?: string;
  examLocation?: string;
  examVehicle?: string;
  examType?: string;
  startDate?: string; // Kayıt/başlangıç tarihi
  notes?: string; // Öğrenci notları
  status: 'active' | 'inactive' | 'completed' | 'failed';
  
  // User bilgileri (backend'den gelir)
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    isActive: boolean;
  };
  
  // Yeni sınav sistemi
  writtenExam: {
    status: 'not-taken' | 'passed' | 'failed';
    attempts: number; // Kaç kez girdi (max 4)
    maxAttempts: 4;
    lastExamDate?: string;
    passedAtAttempt?: number; // Kaçıncı denemede geçti
    failedAttempts?: number[]; // Hangi denemelerde kaldı
  };
  
  drivingExam: {
    status: 'not-taken' | 'passed' | 'failed';
    attempts: number; // Kaç kez girdi (max 4)
    maxAttempts: 4;
    lastExamDate?: string;
    passedAtAttempt?: number; // Kaçıncı denemede geçti
    failedAttempts?: number[]; // Hangi denemelerde kaldı
  };
  
  // Sınav tarih ve saatleri (Backend'den direk gelen alanlar)
  writtenExamDate?: string;
  writtenExamTime?: string;
  drivingExamDate?: string;
  drivingExamTime?: string;
  
  totalPayment?: number;
  totalDebt?: number; // Backend'den hesaplanan toplam borç
  paidAmount?: number; // Backend'den hesaplanan ödenen miktar
  initialPayment?: number; // İlk ödeme
  remainingDebt?: number; // Backend'den hesaplanan kalan borç
  installmentCount?: number; // Taksit sayısı
  installments?: Installment[]; // Taksitler
  createdAt: string;
  lastUpdated?: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: 'cash' | 'credit' | 'bank' | 'pos';
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  type?: 'DEBT' | 'INSTALLMENT' | 'PAYMENT'; // Opsiyonel - eski kayıtlarda yok
  description?: string;
  installmentId?: string; // Hangi taksite ait
  isInstallment?: boolean; // Taksit ödemesi mi
  installmentNumber?: number | null; // Kaçıncı taksit (backend'den geliyor)
  totalInstallments?: number | null; // Toplam taksit sayısı
  relatedDebtId?: string | null; // Hangi borca ödeme yapıldı
  createdAt?: string; // Kayıt oluşturulma tarihi (Prisma'dan geliyor)
  updatedAt?: string; // Güncelleme tarihi (Prisma'dan geliyor)
}

export interface Installment {
  id: string;
  installmentNumber: number; // Kaçıncı taksit (1, 2, 3...)
  amount: number;
  dueDate: string; // Vadesi
  status: 'pending' | 'paid' | 'overdue';
  paymentDate?: string; // Ödendiği tarih
  paymentMethod?: 'cash' | 'credit' | 'bank' | 'pos';
  paymentId?: string; // Payment tablosundaki ID
  relatedDebtId?: string | null; // Hangi borç için bu taksit
}

export interface Notification {
  id?: string;
  title: string;
  message: string;
  type: 'exam' | 'payment' | 'general' | 'warning' | 'lesson';
  createdAt?: string;
  isRead?: boolean;
  studentId?: string;
  studentName?: string; // Öğrenci adı (backend'e gönderilmek için)
  isAutomatic?: boolean; // Otomatik (sistem) veya manuel (işletme) bildirimi
}

export interface StudentDocument {
  id: string;
  studentId: string;
  companyId: string;
  type: 'CRIMINAL_RECORD' | 'DIPLOMA' | 'HEALTH_REPORT' | 'PHOTO' | 'ID_CARD';
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  fileUrl?: string;
  fileName?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentType {
  value: 'CRIMINAL_RECORD' | 'DIPLOMA' | 'HEALTH_REPORT' | 'PHOTO' | 'ID_CARD';
  label: string;
}
