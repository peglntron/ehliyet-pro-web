export interface PhoneInfo {
  id: string;
  number: string;
  description: string;
}

export interface IbanInfo {
  id: string;
  iban: string;
  bankName: string;
  accountHolder: string; // Hesap sahibi adı soyadı
  description: string;
}

export interface CompanyUser {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  district: string;
  province: string;
  email?: string;
  taxNumber?: string;
  phones?: PhoneInfo[]; // Birden fazla telefon numarası açıklamalı
  users?: CompanyUser[]; // İşletme kullanıcıları
  owner: string;
  ownerPhone?: string; // Şirket sahibi telefonu
  registrationDate: string;
  licenseEndDate: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  
  // Yeni eklenen alanlar
  logo?: string; // Logo URL'si
  authorizedPerson?: string; // Yetkili kişi
  ibans?: IbanInfo[]; // Birden fazla IBAN açıklamalı
  email?: string;
  website?: string;
  description?: string;
  
  location?: {
    latitude: string;
    longitude: string;
    mapLink?: string; // Google Maps linki için eklendi
  };
}

export interface Province {
  id: number;
  name: string;
}

export interface District {
  id: number;
  provinceId: number;
  name: string;
}
