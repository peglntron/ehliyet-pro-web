export interface Lesson {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Unit {
  id: string;
  lessonId: string;
  lessonName?: string; // Birleştirilmiş veri için
  unitNumber: number;
  title: string;
  content: string; // HTML içerik
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
