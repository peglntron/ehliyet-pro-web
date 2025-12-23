export interface DrivingLesson {
  id: string;
  companyId: string;
  studentId: string;
  instructorId: string;
  lessonNumber: number;
  scheduledDate: string | null;
  scheduledTime: string | null;
  scheduledBy: string | null;
  status: LessonStatus;
  instructorCompletedAt: string | null;
  studentConfirmedAt: string | null;
  actualDuration: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    totalLessonsEntitled: number;
    lessonsCompleted: number;
    lessonsRemaining: number;
  };
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export type LessonStatus = 
  | 'PLANNED'          // Oluşturuldu, tarih yok
  | 'SCHEDULED'        // Tarih/saat belirlendi
  | 'INSTRUCTOR_DONE'  // Eğitmen tamamladı
  | 'COMPLETED'        // Her ikisi de onayladı
  | 'CANCELLED'        // İptal
  | 'NO_SHOW';         // Öğrenci gelmedi

export interface EligibleStudent {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  totalLessonsEntitled: number;
  lessonsCompleted: number;
  lessonsRemaining: number;
}

export interface CreateTomorrowScheduleRequest {
  instructorId?: string; // INSTRUCTOR rolü için otomatik belirlenir
  studentIds: string[];
  date?: string; // ISO format (YYYY-MM-DD), yoksa yarın
}

export interface CreateTomorrowScheduleResult {
  studentId: string;
  studentName: string;
  success: boolean;
  reason?: string;
  lessonId?: string;
  lessonNumber?: number;
  lessonsRemaining?: number;
}

export interface UpdateLessonTimeRequest {
  scheduledTime: string;
}

export interface MarkInstructorDoneRequest {
  notes?: string;
  actualDuration?: number;
}
