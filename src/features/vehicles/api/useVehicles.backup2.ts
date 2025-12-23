import type { Vehicle, KmRecord, VehicleAssignment } from '../types/types';

// Mock API çağrısı - gerçek uygulamada bir API endpoint'e istek yapılacak
export const getVehicles = (): Promise<Vehicle[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockVehicles);
    }, 500);
  });
};

// Belirli bir aracı ID'ye göre getir
export const getVehicleById = (id: string): Promise<Vehicle> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const vehicle = mockVehicles.find(v => v.id === id);
      if (vehicle) {
        resolve(vehicle);
      } else {
        reject(new Error('Araç bulunamadı'));
      }
    }, 300);
  });
};

// Araç kilometre kayıtlarını getir
export const getKmRecords = (vehicleId: string): Promise<KmRecord[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const records = mockKmRecords.filter(record => record.vehicleId === vehicleId);
      resolve(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, 300);
  });
};

// Araç zimmet kayıtlarını getir
export const getVehicleAssignments = (vehicleId: string): Promise<VehicleAssignment[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const assignments = mockAssignments.filter(assignment => assignment.vehicleId === vehicleId);
      resolve(assignments.sort((a, b) => new Date(b.assignmentDate).getTime() - new Date(a.assignmentDate).getTime()));
    }, 300);
  });
};

// Örnek araç verileri
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    licensePlate: '34 ABC 123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    currentKm: 85420,
    lastServiceKm: 80000,
    nextServiceKm: 90000,
    status: 'in-use',
    assignedInstructor: '1',
    assignedInstructorName: 'Mehmet Öğretmen',
    assignmentDate: '2024-01-15',
    createdAt: '2024-01-01T09:00:00',
    lastUpdated: '2024-03-15T14:30:00'
  },
  {
    id: '2',
    licensePlate: '35 XYZ 456',
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2019,
    currentKm: 92340,
    lastServiceKm: 90000,
    nextServiceKm: 100000,
    status: 'available',
    createdAt: '2023-08-15T10:20:00',
    lastUpdated: '2024-03-10T16:45:00'
  },
  {
    id: '3',
    licensePlate: '06 DEF 789',
    brand: 'Renault',
    model: 'Clio',
    year: 2021,
    currentKm: 67890,
    lastServiceKm: 60000,
    nextServiceKm: 70000,
    status: 'in-use',
    assignedInstructor: '2',
    assignedInstructorName: 'Ali Öğretmen',
    assignmentDate: '2024-02-20',
    createdAt: '2023-12-01T11:15:00',
    lastUpdated: '2024-03-12T09:20:00'
  },
  {
    id: '4',
    licensePlate: '16 GHI 012',
    brand: 'Ford',
    model: 'Focus',
    year: 2018,
    currentKm: 125670,
    lastServiceKm: 120000,
    nextServiceKm: 130000,
    status: 'maintenance',
    createdAt: '2023-06-10T13:45:00',
    lastUpdated: '2024-03-08T08:30:00'
  },
  {
    id: '5',
    licensePlate: '07 JKL 345',
    brand: 'Hyundai',
    model: 'i20',
    year: 2022,
    currentKm: 45230,
    status: 'available',
    createdAt: '2023-11-20T15:30:00',
    lastUpdated: '2024-03-14T12:15:00'
  }
];

// Örnek kilometre kayıtları
const mockKmRecords: KmRecord[] = [
  {
    id: 'km1',
    vehicleId: '1',
    km: 85420,
    date: '2024-03-15',
    recordType: 'manual',
    description: 'Haftalık kilometre kontrolü',
    recordedBy: 'Mehmet Öğretmen',
    createdAt: '2024-03-15T14:30:00'
  },
  {
    id: 'km2',
    vehicleId: '1',
    km: 84890,
    date: '2024-03-08',
    recordType: 'manual',
    description: 'Ders sonrası kayıt',
    recordedBy: 'Mehmet Öğretmen',
    createdAt: '2024-03-08T16:45:00'
  },
  {
    id: 'km3',
    vehicleId: '1',
    km: 82450,
    date: '2024-01-15',
    recordType: 'assignment',
    description: 'Araç zimmetleme - başlangıç km',
    recordedBy: 'Sistem',
    createdAt: '2024-01-15T09:00:00'
  },
  {
    id: 'km4',
    vehicleId: '2',
    km: 92340,
    date: '2024-03-10',
    recordType: 'service',
    description: 'Periyodik bakım sonrası',
    recordedBy: 'Servis',
    createdAt: '2024-03-10T16:45:00'
  },
  {
    id: 'km5',
    vehicleId: '3',
    km: 67890,
    date: '2024-03-12',
    recordType: 'manual',
    description: 'Günlük kilometre raporu',
    recordedBy: 'Ali Öğretmen',
    createdAt: '2024-03-12T09:20:00'
  }
];

// Örnek zimmet kayıtları
const mockAssignments: VehicleAssignment[] = [
  {
    id: 'assign1',
    vehicleId: '1',
    instructorId: '1',
    instructorName: 'Mehmet Öğretmen',
    assignmentDate: '2024-01-15',
    startingKm: 82450,
    status: 'active',
    notes: 'B sınıfı eğitim aracı olarak zimmetlendi'
  },
  {
    id: 'assign2',
    vehicleId: '3',
    instructorId: '2',
    instructorName: 'Ali Öğretmen',
    assignmentDate: '2024-02-20',
    startingKm: 65120,
    status: 'active',
    notes: 'A2 sınıfı eğitim aracı'
  },
  {
    id: 'assign3',
    vehicleId: '2',
    instructorId: '3',
    instructorName: 'Zeynep Öğretmen',
    assignmentDate: '2023-12-01',
    returnDate: '2024-01-15',
    startingKm: 88900,
    endingKm: 91200,
    status: 'completed',
    notes: 'Geçici zimmet - tamamlandı'
  }
];

// Eğitmen ID'sine göre zimmetli araçları getir
export const getVehiclesByInstructorId = (instructorId: string): Promise<Vehicle[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const instructorVehicles = mockVehicles.filter(vehicle => 
        vehicle.assignedInstructor === instructorId
      );
      resolve(instructorVehicles);
    }, 500);
  });
};

// Araç ekleme/güncelleme işlevi
export const saveVehicle = (vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
  return new Promise((resolve) => {
    // Gerçek API çağrısı burada yapılacak
    console.log('Araç kaydediliyor:', vehicleData);
    setTimeout(() => {
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        licensePlate: vehicleData.licensePlate || '',
        brand: vehicleData.brand || '',
        model: vehicleData.model || '',
        year: vehicleData.year || new Date().getFullYear(),
        currentKm: vehicleData.currentKm || 0,
        status: vehicleData.status || 'available',
        createdAt: new Date().toISOString(),
        ...vehicleData
      };
      resolve(newVehicle);
    }, 1000);
  });
};

// Kilometre kaydı ekleme
export const addKmRecord = (kmRecordData: Partial<KmRecord>): Promise<KmRecord> => {
  return new Promise((resolve) => {
    console.log('Km kaydı ekleniyor:', kmRecordData);
    setTimeout(() => {
      const newRecord: KmRecord = {
        id: Date.now().toString(),
        vehicleId: kmRecordData.vehicleId || '',
        km: kmRecordData.km || 0,
        date: kmRecordData.date || new Date().toISOString().split('T')[0],
        recordType: kmRecordData.recordType || 'manual',
        description: kmRecordData.description || '',
        recordedBy: kmRecordData.recordedBy || 'Kullanıcı',
        createdAt: new Date().toISOString(),
        ...kmRecordData
      };
      resolve(newRecord);
    }, 500);
  });
};