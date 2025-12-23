export type ExpenseCategoryType = 'RECURRING' | 'ONE_TIME';

export interface ExpenseCategory {
  id: string;
  companyId: string;
  name: string;
  type: ExpenseCategoryType;
  description?: string;
  isActive: boolean;
  autoCreateDay?: number; // 1-28, her ayın bu günü otomatik gider oluştur
  defaultAmount?: number; // Varsayılan tutar
  paymentMethod?: string; // Varsayılan ödeme yöntemi
  autoDescription?: string; // Otomatik oluşturulan giderlerin açıklaması
  createdAt: string;
  updatedAt: string;
  _count?: {
    expenses: number;
  };
}

export interface ExpenseCategoryFormData {
  name: string;
  type: ExpenseCategoryType;
  description: string;
  isActive: boolean;
  autoCreateDay: number | '';
  defaultAmount: string;
  paymentMethod: string;
  autoDescription: string;
}

export interface Expense {
  id: string;
  companyId: string;
  expenseCategoryId: string;
  amount: number;
  date: string;
  description?: string;
  invoiceNumber?: string;
  paymentMethod?: string;
  isPaid: boolean;
  paidDate?: string;
  attachments: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  expenseCategory?: ExpenseCategory;
}

export interface ExpenseFormData {
  expenseCategoryId: string;
  amount: string;
  date: string;
  description: string;
  invoiceNumber: string;
  paymentMethod: string;
  isPaid: boolean;
  paidDate: string;
}

export interface ExpenseStats {
  totalExpenses: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  categoryType: ExpenseCategoryType;
  totalAmount: number;
  count: number;
}

export interface MonthlyTrend {
  month: string;
  total: number;
  paid: number;
  unpaid: number;
  count: number;
}
