import { apiClient } from '../../../utils/api';

export interface MatchingGroup {
  id: string;
  name: string;
  date: string;
  licenseClass: string;
  totalStudents: number;
  status: 'PENDING' | 'APPLIED' | 'CANCELLED' | 'ARCHIVED';
}

export interface InstructorStat {
  id: string;
  name: string;
  matchingGroup: string;
  matchingId: string;
  totalStudents: number;
  passedStudents: number;
  failedStudents: number;
  successRate: number;
  averageScore: number;
  rank: number;
  trend?: 'up' | 'down' | 'stable'; // Performans trendi
  previousSuccessRate?: number; // Önceki dönem başarı oranı
  avatar?: string; // Eğitmen avatarı
}

/**
 * Eşleştirme listesini getir (APPLIED olanlar)
 */
export const getMatchingList = async (): Promise<MatchingGroup[]> => {
  try {
    const response = await apiClient.get('/matching/history?status=APPLIED');
    
    if (response.success && response.data) {
      // Backend { matchings: [], total: number } şeklinde dönüyor
      const matchingsData = response.data.matchings || [];
      
      return matchingsData.map((matching: any) => ({
        id: matching.id,
        name: matching.name || `${matching.licenseTypes?.join(', ')} Sınıfı Eşleştirmesi`,
        date: matching.createdAt,
        licenseClass: matching.licenseTypes?.[0] || 'B',
        totalStudents: matching._count?.results || matching.matches?.length || 0,
        status: matching.status
      }));
    }
    return [];
  } catch (error) {
    console.error('Eşleştirmeler yüklenirken hata:', error);
    throw error;
  }
};

/**
 * Belirli bir eşleştirmeye ait eğitmen istatistiklerini getir
 */
export const getInstructorStatsByMatching = async (
  matchingId: string
): Promise<InstructorStat[]> => {
  try {
    const response = await apiClient.get(`/matching/${matchingId}`);
    
    console.log('🔍 API Response:', response);
    
    if (response.success && response.data) {
      const matching = response.data;
      // Backend'den gelen results array'i (MatchingResult modeli)
      const results = matching.results || [];
      
      console.log('📊 Matching Results:', results);
      
      // Eğitmenlere göre grupla
      const instructorMap = new Map<string, {
        id: string;
        name: string;
        students: any[];
      }>();
      
      results.forEach((result: any) => {
        const instructorId = result.instructorId;
        const instructorName = result.instructorName || 'Bilinmeyen';
        
        if (!instructorMap.has(instructorId)) {
          instructorMap.set(instructorId, {
            id: instructorId,
            name: instructorName,
            students: []
          });
        }
        
        instructorMap.get(instructorId)?.students.push(result);
      });
      
      console.log('👥 Instructor Map:', Array.from(instructorMap.entries()));
      
      // İstatistikleri hesapla
      const stats: InstructorStat[] = [];
      let rank = 1;
      
      instructorMap.forEach((data, instructorId) => {
        const totalStudents = data.students.length;
        
        console.log(`📝 Calculating stats for ${data.name}:`, {
          totalStudents,
          students: data.students.map(s => ({
            id: s.studentId,
            name: s.studentName,
            student: s.student,
            writtenStatus: s.student?.writtenExamStatus,
            drivingStatus: s.student?.drivingExamStatus,
            score: s.student?.writtenExamScore
          }))
        });
        
        // Sınav durumlarını kontrol et
        // Not: Eşleştirme sonuçlarında student bilgisi varsa kullan
        const passedStudents = data.students.filter(s => {
          const student = s.student;
          return student?.writtenExamStatus === 'PASSED' && 
                 student?.drivingExamStatus === 'PASSED';
        }).length;
        
        const failedStudents = data.students.filter(s => {
          const student = s.student;
          return student?.writtenExamStatus === 'FAILED' || 
                 student?.drivingExamStatus === 'FAILED';
        }).length;
        
        const successRate = totalStudents > 0 
          ? Math.round((passedStudents / totalStudents) * 100)
          : 0;
        
        // Ortalama puan hesapla
        // Not: Student modelinde writtenExamScore field'ı yok
        // Bunun yerine başarı oranını kullanıyoruz veya 0 veriyoruz
        const averageScore = successRate; // Başarı oranını puan olarak göster
        
        console.log(`✅ Stats for ${data.name}:`, {
          totalStudents,
          passedStudents,
          failedStudents,
          successRate,
          averageScore
        });
        
        stats.push({
          id: instructorId,
          name: data.name,
          matchingGroup: matching.name || `${matching.licenseTypes?.join(', ')} Sınıfı`,
          matchingId: matchingId,
          totalStudents,
          passedStudents,
          failedStudents,
          successRate,
          averageScore,
          rank: rank++
        });
      });
      
      // Başarı oranına göre sırala
      stats.sort((a, b) => b.successRate - a.successRate);
      
      // Sıralamayı yeniden düzenle
      stats.forEach((stat, index) => {
        stat.rank = index + 1;
      });
      
      console.log('📈 Final Stats:', stats);
      
      return stats;
    }
    
    return [];
  } catch (error) {
    console.error('Eğitmen istatistikleri yüklenirken hata:', error);
    throw error;
  }
};
