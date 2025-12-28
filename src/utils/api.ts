// API Base Configuration
export const getBaseUrl = () => {
  // Production'da window.location.origin kullan, development'ta localhost
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    return window.location.origin;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3002';
};

export const getApiBaseUrl = () => `${getBaseUrl()}/api`;
export const API_BASE_URL = getApiBaseUrl(); // Backward compatibility
export const UPLOADS_BASE_URL = getBaseUrl();

// Token yardımcı fonksiyonu - hem localStorage hem sessionStorage'dan kontrol eder
export const getToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// HTTP Client with token management
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    // Token'ı hem localStorage hem sessionStorage'dan kontrol et
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Helper method to add companyId filter for multi-tenant queries
  private addCompanyFilter(endpoint: string, companyId?: string): string {
    if (!companyId) return endpoint;
    
    const separator = endpoint.includes('?') ? '&' : '?';
    return `${endpoint}${separator}companyId=${companyId}`;
  }

  private async handleResponse(response: Response) {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  async get(endpoint: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async post(endpoint: string, data?: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(response);
  }

  async put(endpoint: string, data?: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(response);
  }

  async patch(endpoint: string, data?: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(response);
  }

  async delete(endpoint: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Company-filtered methods for multi-tenant support
  async getWithCompanyFilter(endpoint: string, companyId?: string) {
    const filteredEndpoint = this.addCompanyFilter(endpoint, companyId);
    return this.get(filteredEndpoint);
  }

  async postWithCompanyData(endpoint: string, data: any, companyId?: string) {
    const dataWithCompany = companyId ? { ...data, companyId } : data;
    return this.post(endpoint, dataWithCompany);
  }

  async putWithCompanyData(endpoint: string, data: any, companyId?: string) {
    const dataWithCompany = companyId ? { ...data, companyId } : data;
    return this.put(endpoint, dataWithCompany);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User Types
export interface User {
  id: string;
  phone: string;
  firstName?: string | null;
  lastName?: string | null;
  role: 'ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_USER' | 'INSTRUCTOR' | 'COMPANY_STUDENT' | 'STUDENT';
  companyId: string | null;
  company?: {
    id: string;
    name: string;
    isActive: boolean;
    logo?: string | null;
  } | null;
  isActive: boolean;
  createdAt: string;
  avatar?: string | null;
  photo?: string | null;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  address?: string;
  district?: string;
  province?: string;
  phone: string;
  phones?: string[];
  email?: string;
  taxNumber?: string;
  owner?: string;
  ownerPhone?: string;
  registrationDate?: string;
  licenseEndDate?: string;
  logo?: string;
  authorizedPerson?: string;
  ibans?: string[];
  website?: string;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
    mapLink?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Student Types
export interface Student {
  id: string;
  tcNo: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  profilePhoto?: string;
  licenseType: string;              // DEPRECATED: String "B"
  licenseClassId?: string;          // NEW: UUID relation
  status: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED';
  registrationDate: string;
  companyId: string;
  company?: Company;
  createdAt: string;
  updatedAt: string;
}

// Instructor Types
export interface Instructor {
  id: string;
  tcNo: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: string;
  province?: string;
  district?: string;
  gender?: 'MALE' | 'FEMALE';
  birthDate?: string;
  hireDate?: string;
  startDate?: string;
  salary?: number;
  licenseTypes: string[];           // DEPRECATED: String array ["A", "B"]
  licenseClassIds?: string[];       // NEW: UUID array
  specialization?: string;
  experience?: number;
  maxStudentsPerPeriod?: number;    // Bir dönemde alabileceği max öğrenci sayısı
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  profileImage?: string;
  companyId: string;
  company?: Company;
  createdAt: string;
  updatedAt: string;
  // Dashboard İstatistikleri - Bu Dönem (Aylık)
  monthlyTotalStudents?: number;
  monthlyPassedStudents?: number;
  monthlySuccessRate?: number;
  // Dashboard İstatistikleri - Tüm Zamanlar
  studentCount?: number;
  passedStudents?: number;
  totalAttempts?: number;
  successRate?: number;
  currentActiveStudents?: number;
  firstAttemptSuccessRate?: number;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  currentKm: number;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  lastServiceKm?: number;
  nextServiceKm?: number;
  companyId: string;
  company?: Company;
  createdAt: string;
  updatedAt: string;
}

// License Class Types
export interface LicenseClass {
  id: string;
  tip: string;
  arac: string;
  yas: number;
  kapsam: string;
  degisim_suresi: number;
  tecrube_sarti: string;
  icerik?: string;
  renk: string;
  ikon_url?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Utility functions
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  
  // Eğer localhost URL ise path'e çevir
  if (imagePath.includes('localhost:3002')) {
    imagePath = imagePath.replace('http://localhost:3002', '');
  }
  
  // Eğer zaten production URL ise direkt dön
  if (imagePath.startsWith('http')) return imagePath;
  
  // Uploads klasörü path'ini tam URL'e çevir (runtime'da hesapla)
  return `${getBaseUrl()}${imagePath}`;
};

// Company Profile API functions
export const companyProfileApi = {
  // Get company profile
  getProfile: async (): Promise<ApiResponse<Company>> => {
    return await apiClient.get('/auth/company-profile');
  },

  // Update company profile
  updateProfile: async (data: Partial<Company>): Promise<ApiResponse<Company>> => {
    return await apiClient.put('/auth/company-profile', data);
  }
};

// License Classes API functions
export const licenseClassApi = {
  // Get all license classes
  getAll: async (): Promise<ApiResponse<LicenseClass[]>> => {
    return await apiClient.get('/license-classes');
  },

  // Get license class by ID
  getById: async (id: string): Promise<ApiResponse<LicenseClass>> => {
    return await apiClient.get(`/license-classes/${id}`);
  },

  // Create new license class (Admin only)
  create: async (data: Partial<LicenseClass>): Promise<ApiResponse<LicenseClass>> => {
    return await apiClient.post('/license-classes', data);
  },

  // Update license class (Admin only)
  update: async (id: string, data: Partial<LicenseClass>): Promise<ApiResponse<LicenseClass>> => {
    return await apiClient.put(`/license-classes/${id}`, data);
  },

  // Delete license class (Admin only)
  delete: async (id: string): Promise<ApiResponse> => {
    return await apiClient.delete(`/license-classes/${id}`);
  },

  // Upload license class icon (Admin only)
  uploadIcon: async (licenseClassId: string, iconFile: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('icon', iconFile);
    formData.append('licenseClassId', licenseClassId);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/license-classes/upload-icon`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }
};

// Traffic Sign Category Types
export interface TrafficSignCategory {
  id: string;
  name: string;
  value: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    trafficSigns: number;
  };
}

// Traffic Sign Types
export interface TrafficSign {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    value: string;
  };
}

// Traffic Signs API functions
export const trafficSignApi = {
  // Get all traffic sign categories
  getCategories: async (): Promise<ApiResponse<TrafficSignCategory[]>> => {
    return await apiClient.get('/traffic-signs/categories');
  },

  // Get all traffic signs
  getAll: async (categoryId?: string, isActive?: boolean): Promise<ApiResponse<TrafficSign[]>> => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/traffic-signs?${queryString}` : '/traffic-signs';
    
    return await apiClient.get(endpoint);
  },

  // Get traffic sign by ID
  getById: async (id: string): Promise<ApiResponse<TrafficSign>> => {
    return await apiClient.get(`/traffic-signs/${id}`);
  },

  // Create new traffic sign (Admin only)
  create: async (data: Partial<TrafficSign>): Promise<ApiResponse<TrafficSign>> => {
    return await apiClient.post('/traffic-signs', data);
  },

  // Update traffic sign (Admin only)
  update: async (id: string, data: Partial<TrafficSign>): Promise<ApiResponse<TrafficSign>> => {
    return await apiClient.put(`/traffic-signs/${id}`, data);
  },

  // Delete traffic sign (Admin only)
  delete: async (id: string): Promise<ApiResponse> => {
    return await apiClient.delete(`/traffic-signs/${id}`);
  },

  // Toggle traffic sign status (Admin only)
  toggleStatus: async (id: string): Promise<ApiResponse<TrafficSign>> => {
    return await apiClient.patch(`/traffic-signs/${id}/toggle-status`);
  },

  // Upload traffic sign image (Admin only)
  uploadImage: async (trafficSignId: string, imageFile: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('trafficSignId', trafficSignId);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/traffic-signs/upload-image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }
};

// Lesson Types
export interface Lesson {
  id: string;
  name: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    units: number;
    questions: number;
  };
}

// Unit Types
export interface Unit {
  id: string;
  lessonId: string;
  name: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lesson?: {
    id: string;
    name: string;
  };
  _count?: {
    questions: number;
  };
}

// Question Types
export interface Question {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  lessonId: string;
  unitId: string;
  lessonName: string;
  unitName: string;
  mediaUrl?: string | null;
  cikmis: boolean;
  animasyonlu: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lesson?: {
    id: string;
    name: string;
  };
  unit?: {
    id: string;
    name: string;
  };
}

// Questions API functions
export const questionApi = {
  // Get all lessons
  getLessons: async (): Promise<ApiResponse<Lesson[]>> => {
    return await apiClient.get('/questions/lessons');
  },

  // Get units by lesson
  getUnitsByLesson: async (lessonId: string): Promise<ApiResponse<Unit[]>> => {
    return await apiClient.get(`/questions/lessons/${lessonId}/units`);
  },

  // Get all questions
  getAll: async (filters?: {
    lessonId?: string;
    unitId?: string;
    isActive?: boolean;
    cikmis?: boolean;
    animasyonlu?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    questions: Question[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> => {
    const params = new URLSearchParams();
    
    if (filters?.lessonId) params.append('lessonId', filters.lessonId);
    if (filters?.unitId) params.append('unitId', filters.unitId);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.cikmis !== undefined) params.append('cikmis', filters.cikmis.toString());
    if (filters?.animasyonlu !== undefined) params.append('animasyonlu', filters.animasyonlu.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/questions?${queryString}` : '/questions';
    
    return await apiClient.get(endpoint);
  },

  // Get question by ID
  getById: async (id: string): Promise<ApiResponse<Question>> => {
    return await apiClient.get(`/questions/${id}`);
  },

  // Create new question (Admin only)
  create: async (data: Partial<Question>): Promise<ApiResponse<Question>> => {
    return await apiClient.post('/questions', data);
  },

  // Update question (Admin only)
  update: async (id: string, data: Partial<Question>): Promise<ApiResponse<Question>> => {
    return await apiClient.put(`/questions/${id}`, data);
  },

  // Delete question (Admin only)
  delete: async (id: string): Promise<ApiResponse> => {
    return await apiClient.delete(`/questions/${id}`);
  },

  // Toggle question status (Admin only)
  toggleStatus: async (id: string): Promise<ApiResponse<Question>> => {
    return await apiClient.patch(`/questions/${id}/toggle-status`);
  }
};

// Dashboard Stats Types
export interface DashboardStats {
  main: {
    examQuestions: {
      title: string;
      value: number;
      description: string;
    };
    animatedQuestions: {
      title: string;
      value: number;
      description: string;
    };
    courseStudents: {
      title: string;
      value: number;
      description: string;
    };
    independentStudents: {
      title: string;
      value: number;
      description: string;
    };
    activeCourses: {
      title: string;
      value: number;
      description: string;
    };
  };
  totals: {
    totalLessons: {
      title: string;
      value: number;
      description: string;
    };
    totalUnits: {
      title: string;
      value: number;
      description: string;
    };
    totalQuestions: {
      title: string;
      value: number;
      description: string;
    };
    totalStudents: {
      title: string;
      value: number;
      description: string;
    };
    totalCourses: {
      title: string;
      value: number;
      description: string;
    };
  };
}

// Dashboard API functions
export const dashboardApi = {
  // Get dashboard statistics
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return await apiClient.get('/dashboard/stats');
  },
  
  // Get recent activities (last 10)
  getRecentActivities: async (limit?: number): Promise<ApiResponse<Activity[]>> => {
    const params = limit ? `?limit=${limit}` : '';
    return await apiClient.get(`/dashboard/activities/recent${params}`);
  },
  
  // Get today's activities
  getTodayActivities: async (): Promise<ApiResponse<TodayActivitiesResponse>> => {
    return await apiClient.get('/dashboard/activities/today');
  },

  // Get today's activity count
  getTodayActivityCount: async (): Promise<ApiResponse<{ date: string; count: number }>> => {
    return await apiClient.get('/dashboard/activities/today-count');
  },

  // Get company trends (new + renewed)
  getCompanyTrends: async (): Promise<ApiResponse<CompanyTrendsResponse>> => {
    return await apiClient.get('/dashboard/company-trends');
  },

  // Get API logs
  getApiLogs: async (): Promise<ApiResponse<ApiLogsResponse>> => {
    return await apiClient.get('/dashboard/api-logs');
  },

  // Get user role distribution
  getUserRoleDistribution: async (): Promise<ApiResponse<UserRoleDistributionResponse>> => {
    return await apiClient.get('/dashboard/user-roles');
  },

  // Get financial statistics
  getFinancialStats: async (): Promise<ApiResponse<FinancialStatsResponse>> => {
    return await apiClient.get('/dashboard/financial-stats');
  },

  // Get license statistics
  getLicenseStats: async (): Promise<ApiResponse<LicenseStatsResponse>> => {
    return await apiClient.get('/dashboard/license-stats');
  },

  // Get user activity statistics
  getUserActivityStats: async (): Promise<ApiResponse<UserActivityStatsResponse>> => {
    return await apiClient.get('/dashboard/user-activity-stats');
  },

  // Get company growth statistics
  getCompanyGrowthStats: async (): Promise<ApiResponse<CompanyGrowthStatsResponse>> => {
    return await apiClient.get('/dashboard/company-growth-stats');
  }
};

// Activity Types
export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

export interface TodayActivitiesResponse {
  date: string;
  count: number;
  activities: Activity[];
}

// Company Trends Types
export interface CompanyTrendsResponse {
  last30Days: {
    new: number;
    renewed: number;
    total: number;
  };
  monthly: {
    month: string;
    newCompanies: number;
    renewedCompanies: number;
  }[];
}

// API Logs Types
export interface ApiLogsResponse {
  daily: {
    date: string;
    success: number;
    error: number;
  }[];
  totals: {
    success: number;
    error: number;
    total: number;
    successRate: string;
  };
}

// User Role Distribution Types
export interface UserRoleDistributionResponse {
  distribution: {
    role: string;
    label: string;
    count: number;
  }[];
  total: number;
}

// Financial Statistics Types
export interface FinancialStatsResponse {
  monthlyRevenue: number;
  totalRevenue: number;
  pendingPayments: {
    amount: number;
    count: number;
  };
  monthlyData: {
    month: string;
    revenue: number;
    count: number;
  }[];
}

// License Statistics Types
export interface LicenseStatsResponse {
  expiringLicenses: number;
  expiredLicenses: number;
  activeLicenses: number;
  total: number;
}

// User Activity Statistics Types
export interface UserActivityStatsResponse {
  totalInstructors: number;
  dailyActiveUsers: number;
  newUsersThisMonth: number;
  dailyActivity: {
    date: string;
    activeUsers: number;
  }[];
}

// Company Growth Statistics Types
export interface CompanyGrowthStatsResponse {
  newCompaniesThisMonth: number;
  inactiveCompanies: number;
}