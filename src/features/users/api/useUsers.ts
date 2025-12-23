import { useState, useEffect } from 'react';
import { User, UserFormData, SmsVerification } from '../types/types';

// Simüle edilmiş kullanıcılar
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ahmet',
    surname: 'Yılmaz',
    phone: '05321234567',
    email: 'ahmet@example.com',
    companyId: '1',
    companyName: 'ABC Sürücü Kursu',
    role: 'company_admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Ayşe',
    surname: 'Demir',
    phone: '05321234568',
    email: 'ayse@example.com',
    role: 'student',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Mehmet',
    surname: 'Kaya',
    phone: '05321234569',
    companyId: '1',
    companyName: 'ABC Sürücü Kursu',
    role: 'instructor',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simüle edilmiş API çağrısı
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 500);
  }, []);

  // Kullanıcı ekleme
  const addUser = async (userData: UserFormData): Promise<{ success: boolean; message: string; userId?: string }> => {
    try {
      // API çağrısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Gerçek uygulamada bu kısım API çağrısı olacak
      const newUser: User = {
        id: String(Date.now()),
        name: userData.name,
        surname: userData.surname,
        phone: userData.phone,
        email: userData.email,
        companyId: userData.companyId,
        companyName: userData.companyId ? 'Sürücü Kursu' : undefined,
        role: userData.role,
        status: 'pending', // Yeni kullanıcılar için beklemede durumu
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setUsers(prev => [...prev, newUser]);
      
      return { success: true, message: 'Kullanıcı başarıyla oluşturuldu', userId: newUser.id };
    } catch (err) {
      console.error('Kullanıcı eklenirken hata oluştu:', err);
      return { success: false, message: 'Kullanıcı eklenirken hata oluştu' };
    }
  };

  // SMS doğrulama gönderme
  const sendSmsVerification = async (phone: string): Promise<{ success: boolean; message: string }> => {
    try {
      // API çağrısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Gerçek uygulamada burada SMS API çağrısı yapılır
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`SMS Kodu (simüle): ${verificationCode} - Telefon: ${phone}`);
      
      return { success: true, message: 'Doğrulama kodu gönderildi' };
    } catch (err) {
      console.error('SMS gönderilirken hata oluştu:', err);
      return { success: false, message: 'SMS gönderilirken hata oluştu' };
    }
  };

  // SMS doğrulama kodunu kontrol etme
  const verifySmsCode = async (phone: string, code: string): Promise<{ success: boolean; message: string }> => {
    try {
      // API çağrısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Gerçek uygulamada burada API ile kod doğrulaması yapılır
      // Basitlik için her zaman başarılı döndürelim
      return { success: true, message: 'Doğrulama başarılı' };
    } catch (err) {
      console.error('Kod doğrulanırken hata oluştu:', err);
      return { success: false, message: 'Kod doğrulanırken hata oluştu' };
    }
  };

  return { 
    users, 
    loading, 
    error, 
    addUser,
    sendSmsVerification,
    verifySmsCode
  };
};
