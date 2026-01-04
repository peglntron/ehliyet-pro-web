export interface PaymentInstallment {
  id: string;
  studentId: string;
  installmentNumber?: number; // Bazı kayıtlar DEBT olabilir, installmentNumber olmayabilir
  amount: number;
  dueDate?: string; // Bazı kayıtlarda dueDate olmayabilir
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
  paidAmount?: number;
  paymentMethod?: 'cash' | 'credit' | 'bank';
  description?: string;
}

export interface StudentPaymentStatus {
  studentId: string;
  studentName: string;
  studentSurname: string;
  phone: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  installments: PaymentInstallment[];
  overdueInstallments: PaymentInstallment[];
  upcomingInstallments: PaymentInstallment[]; // Yaklaşan taksitler (7 gün içinde)
  lastPaymentDate?: string;
  paymentStatus: 'completed' | 'partial' | 'overdue' | 'upcoming';
  overdueDays: number; // Kaç gündür gecikmiş
}

export interface PaymentSummary {
  totalStudents: number;
  overdueStudents: number;
  upcomingPayments: number;
  totalOverdueAmount: number;
  totalUpcomingAmount: number;
  totalRemainingAmount: number; // Toplam kalan borç
}

export interface PaymentFilters {
  status: 'all' | 'overdue' | 'upcoming';
  dayRange: number; // Kaç gün içindeki taksitler (7, 15, 30)
  minAmount?: number;
  maxAmount?: number;
}