export interface Instructor {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  tcNo: string;
  phone: string;
  email?: string;
  address?: string;
  province?: string; // İl bilgisi eklendi
  district?: string; // İlçe bilgisi eklendi
  gender: 'male' | 'female'; // Cinsiyet - eşleştirme için gerekli
  licenseTypes?: string[]; // Ehliyet türleri (A, B, C, vb.)
  vehicleId?: string; // Eşleştirilen araç ID'si
  vehiclePlate?: string; // Eşleştirilen araç plakası
  vehicleModel?: string; // Araç model bilgisi
  specialization?: string; // Uzmanlık alanı
  experience?: number; // Deneyim (yıl olarak)
  maxStudentsPerPeriod?: number; // Bir dönemde alabileceği max öğrenci sayısı
  status: 'active' | 'inactive' | 'pending';
  profileImage?: string; // Profil resmi URL
  startDate?: string; // İşe başlama tarihi
  documents?: InstructorDocument[]; // Eğitmen belgeleri
  notes?: string; // Notlar
  user?: { // Kullanıcı bilgisi
    id: string;
    phone: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    role: string;
  };
  createdAt: string;
  updatedAt?: string;
  // Dashboard İstatistikleri - Bu Dönem (Aylık)
  monthlyTotalStudents?: number; // Bu ay eşleştirilen öğrenci
  monthlyPassedStudents?: number; // Bu ay başarılı olan
  monthlySuccessRate?: number; // Bu ay başarı oranı (%)
  // Dashboard İstatistikleri - Tüm Zamanlar
  studentCount?: number; // Toplam öğrenci sayısı (tüm zamanlar)
  passedStudents?: number; // Sınavı geçen öğrenci sayısı (tüm zamanlar)
  totalAttempts?: number; // Toplam deneme sayısı (tüm zamanlar)
  successRate?: number; // Başarı oranı (tüm zamanlar %)
  currentActiveStudents?: number; // Mevcut aktif öğrenci sayısı
  firstAttemptSuccessRate?: number; // İlk denemede başarı oranı (%)
}

export interface InstructorDocument {
  id: string;
  title: string;
  fileUrl: string;
  uploadDate: string;
  expiryDate?: string;
  type: 'certificate' | 'license' | 'other';
}

export interface InstructorMonthlyTrend {
  month: string; // YYYY-MM formatında
  total_attempts: number;
  passed_attempts: number;
  passed_students: number;
  success_rate: number;
}

export interface InstructorFormData {
  firstName: string;
  lastName: string;
  tcNo: string;
  phone: string;
  email: string;
  address: string;
  province: string; // İl bilgisi eklendi
  district: string; // İlçe bilgisi eklendi
  licenseTypes: string[];
  specialization: string;
  experience: string;
  maxStudentsPerPeriod: string; // Bir dönemde alabileceği max öğrenci sayısı
  status: 'active' | 'inactive' | 'pending';
  profileImage: string;
  startDate: string;
  notes: string;
}
