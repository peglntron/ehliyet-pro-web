export interface LicenseClass {
  id: string;
  type: string;        // Ehliyet tipi (M, A1, B1, vs.)
  vehicle: string;     // Araç tipi (Moped, Motosiklet, vs.)
  minAge: number;      // Minimum yaş şartı
  scope: string;       // Kapsam
  renewalPeriod: number; // Değişim süresi (yıl)
  experienceRequired: string; // Tecrübe şartı
  description: string; // İçerik açıklaması
  color: string;       // Renk kodu
  iconUrl: string;     // İkon URL'i
  isActive: boolean;   // Aktif/Pasif durumu
  createdAt: string;   // Oluşturulma tarihi
  updatedAt: string;   // Güncellenme tarihi
}
