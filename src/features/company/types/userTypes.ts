export interface User {
  id: string;
  name: string;
  surname: string;
  phone: string;
  email?: string;
  companyId?: string;
  companyName?: string;
  role: 'admin' | 'company_admin' | 'student' | 'instructor' | 'company_student';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  name: string;
  surname: string;
  phone: string;
  email?: string;
  companyId?: string;
  role: 'admin' | 'company_admin' | 'student' | 'instructor' | 'company_student';
  password?: string;
  confirmPassword?: string;
}

export interface SmsVerification {
  phone: string;
  code: string;
  expiresAt: string;
  attempts: number;
}
