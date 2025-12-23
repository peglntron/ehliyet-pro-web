export const INSTRUCTOR_SPECIALIZATIONS = [
  { value: 'Direksiyon Eğitmeni', label: 'Direksiyon Eğitmeni' },
  { value: 'Teorik Eğitmen', label: 'Teorik Eğitmen' },
  { value: 'Motorsiklet Eğitmeni', label: 'Motorsiklet Eğitmeni' },
  { value: 'Ağır Vasıta Eğitmeni', label: 'Ağır Vasıta Eğitmeni' },
  { value: 'Tehlikeli Madde Eğitmeni', label: 'Tehlikeli Madde Eğitmeni' },
  { value: 'Yolcu Taşıma Eğitmeni', label: 'Yolcu Taşıma Eğitmeni' },
  { value: 'Genel Eğitmen', label: 'Genel Eğitmen' }
] as const;

export const LICENSE_TYPES = [
  { value: 'M', label: 'M - Motorsiklet' },
  { value: 'A1', label: 'A1 - Hafif Motorsiklet' },
  { value: 'A2', label: 'A2 - Orta Motorsiklet' },
  { value: 'A', label: 'A - Motorsiklet' },
  { value: 'B1', label: 'B1 - Motorlu 3-4 Tekerlekli' },
  { value: 'B', label: 'B - Otomobil' },
  { value: 'BE', label: 'BE - Otomobil + Römork' },
  { value: 'C1', label: 'C1 - Kamyonet' },
  { value: 'C1E', label: 'C1E - Kamyonet + Römork' },
  { value: 'C', label: 'C - Kamyon' },
  { value: 'CE', label: 'CE - Kamyon + Römork' },
  { value: 'D1', label: 'D1 - Minibüs' },
  { value: 'D1E', label: 'D1E - Minibüs + Römork' },
  { value: 'D', label: 'D - Otobüs' },
  { value: 'DE', label: 'DE - Otobüs + Römork' },
  { value: 'F', label: 'F - Traktör' },
  { value: 'G', label: 'G - İş Makinesi' }
] as const;

export type InstructorStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';
export type Gender = 'MALE' | 'FEMALE';

export interface Instructor {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  tcNo: string;
  phone: string;
  email?: string;
  address?: string;
  province?: string;
  district?: string;
  gender?: Gender;
  licenseTypes: string[];
  specialization?: string;
  experience?: number;
  maxStudentsPerPeriod?: number; // Bir dönemde alabileceği max öğrenci sayısı
  status: InstructorStatus;
  profilePhoto?: string;
  profileImage?: string; // Alias for profilePhoto
  startDate?: string;
  notes?: string;
  vehicleId?: string;
  createdAt: string;
  updatedAt: string;
}
