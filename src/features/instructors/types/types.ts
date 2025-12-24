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
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  profileImage: string;
  startDate: string;
  notes: string;
}
