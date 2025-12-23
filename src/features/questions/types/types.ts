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

export interface Question {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string; // A, B, C, D
  lessonId: string;
  unitId: string;
  lessonName: string; // For backward compatibility
  unitName: string; // For backward compatibility
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
