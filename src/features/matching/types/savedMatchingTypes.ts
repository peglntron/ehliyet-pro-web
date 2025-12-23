// Saved matching kayıt türü
export interface SavedMatching {
  id: string;
  name: string; // Eşleştirme adı (örn: "Ocak 2024 A Grubu")
  description?: string;
  licenseTypes: string[]; // Çoklu ehliyet türü - ["A", "A1", "A2"]
  createdDate: string;
  createdBy: string; // Kim tarafından oluşturuldu
  totalStudents: number;
  totalInstructors: number;
  matches: MatchingResult[];
  status: 'active' | 'archived' | 'draft';
  lastModified?: string;
  modifiedBy?: string;
  isLocked?: boolean; // Eşleştirme kilitli mi?
}

// Mevcut MatchingResult interface'ini genişletiyoruz
export interface MatchingResult {
  id?: string;
  studentId: string;
  instructorId: string;
  matchedAt: string;
  studentName?: string;
  instructorName?: string;
  studentGender?: 'male' | 'female';
  instructorGender?: 'male' | 'female';
  licenseType?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  isTransferred?: boolean; // Öğrenci transfer edildi mi?
  transferReason?: string; // Transfer nedeni
  previousInstructorId?: string; // Önceki eğitmen
}

// Eşleştirme güncelleme için
export interface MatchingUpdate {
  matchingId: string;
  studentId: string;
  oldInstructorId: string;
  newInstructorId: string;
  reason?: string;
}