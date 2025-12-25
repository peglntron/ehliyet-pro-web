export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    expenses: number;
  };
}

export interface ExpenseCategoryFormData {
  name: string;
  description: string;
  isActive: boolean;
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
