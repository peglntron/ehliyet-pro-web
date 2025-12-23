import { useState, useEffect } from 'react';
import type { Instructor, InstructorFormData } from '../types/types';

// Mock eğitmen verileri
const mockInstructors: Instructor[] = [
  {
    id: '1',
    companyId: 'comp1',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    tcNo: '12345678901',
    phone: '05321234567',
    email: 'ahmet.yilmaz@example.com',
    address: 'Atatürk Caddesi No:123 Daire:5',
    province: 'İstanbul',
    district: 'Beşiktaş',
    gender: 'male',
    licenseTypes: ['B', 'A2'],
    vehicleId: 'v1',
    vehiclePlate: '34 ABC 123',
    vehicleModel: '2020 Renault Clio',
    maxStudents: 8,
    currentStudents: 2,
    specialization: 'Direksiyon Eğitimi',
    experience: 5,
    status: 'active',
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    startDate: '2019-06-15',
    notes: 'Deneyimli direksiyon eğitmeni',
    createdAt: '2019-06-15T09:00:00',
    updatedAt: '2023-03-20T14:30:00',
    documents: [
      {
        id: 'd1',
        title: 'Sürücü Belgesi',
        fileUrl: '/documents/ahmet-driver-license.pdf',
        uploadDate: '2019-06-15',
        expiryDate: '2029-06-15',
        type: 'license'
      },
      {
        id: 'd2',
        title: 'Eğitmenlik Sertifikası',
        fileUrl: '/documents/ahmet-certificate.pdf',
        uploadDate: '2019-06-15',
        type: 'certificate'
      }
    ]
  },
  {
    id: '2',
    firstName: 'Ayşe',
    lastName: 'Demir',
    tcNo: '23456789012',
    phone: '05331234567',
    email: 'ayse.demir@example.com',
    address: 'Bağdat Caddesi No:45 Blok:B Daire:12',
    province: 'İstanbul',
    district: 'Kadıköy',
    gender: 'female',
    licenseTypes: ['B'],
    vehicleId: 'v2',
    vehiclePlate: '34 XYZ 456',
    vehicleModel: '2021 Toyota Corolla',
    maxStudents: 10,
    currentStudents: 3,
    specialization: 'Teorik Dersler',
    experience: 8,
    status: 'active',
    profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
    startDate: '2018-03-10',
    notes: 'Trafik ve motor bilgisi derslerine giriyor',
    createdAt: '2018-03-10T10:15:00',
    updatedAt: '2023-02-12T11:20:00',
    documents: [
      {
        id: 'd3',
        title: 'Sürücü Belgesi',
        fileUrl: '/documents/ayse-driver-license.pdf',
        uploadDate: '2018-03-10',
        expiryDate: '2028-03-10',
        type: 'license'
      }
    ]
  },
  {
    id: '3',
    firstName: 'Mehmet',
    lastName: 'Kaya',
    tcNo: '34567890123',
    phone: '05341234567',
    email: 'mehmet.kaya@example.com',
    address: 'Mimar Sinan Mah. No:78 Daire:3',
    province: 'İstanbul',
    district: 'Üsküdar',
    gender: 'male',
    licenseTypes: ['A', 'A1', 'A2', 'B'],
    vehicleId: 'v3',
    vehiclePlate: '34 MNK 789',
    vehicleModel: '2019 Honda Civic',
    maxStudents: 6,
    currentStudents: 1,
    specialization: 'Motosiklet Eğitimi',
    experience: 6,
    status: 'active',
    profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
    startDate: '2017-09-05',
    createdAt: '2017-09-05T08:30:00',
    updatedAt: '2022-11-18T16:45:00',
    documents: [
      {
        id: 'd4',
        title: 'Motosiklet Eğitmenliği Sertifikası',
        fileUrl: '/documents/mehmet-certificate.pdf',
        uploadDate: '2017-09-05',
        type: 'certificate'
      }
    ]
  },
  {
    id: '4',
    firstName: 'Zeynep',
    lastName: 'Şahin',
    tcNo: '45678901234',
    phone: '05351234567',
    email: 'zeynep.sahin@example.com',
    address: 'Fatih Sultan Mehmet Cad. No:34 Daire:7',
    province: 'İstanbul',
    district: 'Ataşehir',
    gender: 'female',
    licenseTypes: ['B'],
    vehicleId: 'v4',
    vehiclePlate: '34 ZEY 012',
    vehicleModel: '2020 Volkswagen Polo',
    maxStudents: 7,
    currentStudents: 0,
    specialization: 'İlk Yardım',
    experience: 4,
    status: 'active', // inactive iken aktif yapalım
    startDate: '2020-02-20',
    createdAt: '2020-02-20T14:00:00',
    updatedAt: '2023-01-05T09:10:00'
  },
  {
    id: '5',
    firstName: 'Ali',
    lastName: 'Öztürk',
    tcNo: '56789012345',
    phone: '05361234567',
    email: 'ali.ozturk@example.com',
    address: 'İnönü Mah. No:56 Blok:C Daire:9',
    province: 'İstanbul',
    district: 'Beylikdüzü',
    gender: 'male',
    licenseTypes: ['C', 'CE', 'D', 'DE'],
    vehicleId: 'v5',
    vehiclePlate: '34 ALI 345',
    vehicleModel: '2018 Ford Focus',
    maxStudents: 5,
    currentStudents: 0,
    specialization: 'Ağır Vasıta Eğitimi',
    experience: 10,
    status: 'active',
    profileImage: 'https://randomuser.me/api/portraits/men/5.jpg',
    startDate: '2015-11-15',
    notes: 'Kamyon ve otobüs eğitiminde uzman',
    createdAt: '2015-11-15T11:30:00',
    updatedAt: '2023-04-02T13:25:00',
    documents: [
      {
        id: 'd5',
        title: 'Ağır Vasıta Eğitmenliği Sertifikası',
        fileUrl: '/documents/ali-certificate.pdf',
        uploadDate: '2015-11-15',
        type: 'certificate'
      }
    ]
  },
  // B sınıfı için daha fazla eğitmen ekleyelim
  {
    id: '6',
    firstName: 'Fatma',
    lastName: 'Erdoğan',
    tcNo: '67890123456',
    phone: '05371234567',
    email: 'fatma.erdogan@example.com',
    address: 'Cumhuriyet Mah. No:89 Daire:4',
    province: 'İstanbul',
    district: 'Şişli',
    gender: 'female',
    licenseTypes: ['B'],
    vehicleId: 'v6',
    vehiclePlate: '34 FAT 567',
    vehicleModel: '2021 Hyundai i20',
    maxStudents: 9,
    currentStudents: 1,
    specialization: 'Direksiyon Eğitimi',
    experience: 3,
    status: 'active',
    profileImage: 'https://randomuser.me/api/portraits/women/6.jpg',
    startDate: '2021-04-10',
    createdAt: '2021-04-10T08:00:00',
    updatedAt: '2023-05-15T10:30:00'
  },
  // B sınıfı için daha fazla eğitmen ekleyelim (test için)
  {
    id: '7',
    firstName: 'Emre',
    lastName: 'Aksoy',
    tcNo: '78901234567',
    phone: '05381234567',
    email: 'emre.aksoy@example.com',
    address: 'Barbaros Mah. No:65 Daire:3',
    province: 'İstanbul',
    district: 'Beykoz',
    gender: 'male',
    licenseTypes: ['B'],
    vehicleId: 'v7',
    vehiclePlate: '34 EMR 678',
    vehicleModel: '2020 Opel Corsa',
    maxStudents: 8,
    currentStudents: 0,
    specialization: 'Direksiyon Eğitimi',
    experience: 2,
    status: 'active',
    profileImage: 'https://randomuser.me/api/portraits/men/7.jpg',
    startDate: '2022-01-15',
    createdAt: '2022-01-15T09:00:00',
    updatedAt: '2023-06-20T14:15:00'
  }
];

export const useInstructors = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        // API çağrısı simülasyonu
        await new Promise(resolve => setTimeout(resolve, 800));
        setInstructors(mockInstructors);
        setError(null);
      } catch (err) {
        setError('Eğitmenler yüklenirken bir hata oluştu');
        console.error('Error fetching instructors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  return { instructors, loading, error };
};

export const useInstructor = (id: string) => {
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        setLoading(true);
        // API çağrısı simülasyonu
        await new Promise(resolve => setTimeout(resolve, 500));
        const found = mockInstructors.find(i => i.id === id);
        if (found) {
          setInstructor(found);
          setError(null);
        } else {
          setError('Eğitmen bulunamadı');
        }
      } catch (err) {
        setError('Eğitmen bilgileri yüklenirken bir hata oluştu');
        console.error('Error fetching instructor:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInstructor();
    }
  }, [id]);

  return { instructor, loading, error };
};

export const createInstructor = async (data: InstructorFormData): Promise<Instructor> => {
  // API çağrısı simülasyonu
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newInstructor: Instructor = {
    id: `${Date.now()}`,
    firstName: data.firstName,
    lastName: data.lastName,
    tcNo: data.tcNo,
    phone: data.phone,
    email: data.email,
    address: data.address,
    province: data.province,
    district: data.district,
    gender: 'male', // default değer, form'da eklenecek
    licenseTypes: data.licenseTypes,
    maxStudents: 8, // default değer
    currentStudents: 0, // yeni eğitmen için 0
    specialization: data.specialization,
    experience: parseInt(data.experience) || 0,
    status: data.status,
    profileImage: data.profileImage,
    startDate: data.startDate,
    notes: data.notes,
    createdAt: new Date().toISOString(),
    documents: []
  };
  
  return newInstructor;
};

export const updateInstructor = async (id: string, data: Partial<InstructorFormData>): Promise<Instructor> => {
  // API çağrısı simülasyonu
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const instructor = mockInstructors.find(i => i.id === id);
  if (!instructor) {
    throw new Error('Eğitmen bulunamadı');
  }
  
  const updatedInstructor: Instructor = {
    ...instructor,
    ...data,
    experience: data.experience ? parseInt(data.experience) : instructor.experience,
    updatedAt: new Date().toISOString()
  };
  
  return updatedInstructor;
};

export const deleteInstructor = async (id: string): Promise<boolean> => {
  // API çağrısı simülasyonu
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Gerçek uygulamada burada eğitmen silinecek
  console.log('Deleting instructor with id:', id);
  return true;
};
