export interface Vehicle {
  id: string;
  companyId: string;
  licensePlate: string; // Plaka
  brand: string; // Marka (Toyota, Volkswagen, etc.)
  model: string; // Model (Corolla, Golf, etc.)
  year: number; // Model yılı
  currentKm: number; // Mevcut kilometre
  lastServiceKm?: number; // Son bakım yapılan kilometre
  nextServiceKm?: number; // Sonraki bakım yapılacak kilometre
  status: 'available' | 'in-use' | 'maintenance' | 'inactive'; // Araç durumu
  assignedInstructor?: string; // Zimmetli eğitmen ID'si
  assignedInstructorName?: string; // Zimmetli eğitmen adı
  assignmentDate?: string; // Zimmetleme tarihi
  trafficInsuranceStart?: string; // Trafik sigortası başlangıç tarihi
  trafficInsuranceEnd?: string; // Trafik sigortası bitiş tarihi
  kaskoInsuranceStart?: string; // Kasko başlangıç tarihi
  kaskoInsuranceEnd?: string; // Kasko bitiş tarihi
  createdAt: string;
  lastUpdated?: string;
  kmRecords?: KmRecord[]; // Kilometre kayıtları
}

export interface KmRecord {
  id: string;
  vehicleId: string;
  km: number; // Kilometre değeri
  date: string; // Kayıt tarihi
  recordType: 'manual' | 'service' | 'assignment' | 'return'; // Kayıt türü
  description?: string; // Açıklama
  recordedBy?: string; // Kaydı yapan kişi
  createdAt: string;
}

export interface VehicleAssignment {
  id: string;
  vehicleId: string;
  instructorId: string;
  instructorName: string;
  assignmentDate: string;
  returnDate?: string;
  startingKm: number;
  endingKm?: number;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
}

export interface VehicleFormData {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  currentKm: number;
  assignedInstructor?: string;
  trafficInsuranceStart?: string;
  trafficInsuranceEnd?: string;
  kaskoInsuranceStart?: string;
  kaskoInsuranceEnd?: string;
  notes?: string;
}