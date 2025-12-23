import { apiClient } from '../../../utils/api';
import type { InstructorStat } from './instructorStatisticsApi';

/**
 * Bu ay oluşturulan tüm eşleştirmelerden eğitmen istatistiklerini getir
 */
export const getInstructorStatsForCurrentMonth = async (): Promise<InstructorStat[]> => {
  try {
    // Bu ayın başlangıç ve bitiş tarihlerini hesapla
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Geçen ayın başlangıç ve bitiş tarihlerini hesapla (trend için)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    console.log('📅 Fetching matchings for:', {
      currentMonth: { start: startOfMonth.toISOString(), end: endOfMonth.toISOString() },
      lastMonth: { start: startOfLastMonth.toISOString(), end: endOfLastMonth.toISOString() }
    });
    
    // Tüm eşleştirmeleri getir
    const response = await apiClient.get('/matching/history?status=APPLIED&limit=200');
    
    if (!response.success || !response.data) {
      return [];
    }
    
    const allMatchings = response.data.matchings || [];
    
    // Bu ay ve geçen ay oluşturulanları filtrele
    const thisMonthMatchings = allMatchings.filter((m: any) => {
      const createdDate = new Date(m.createdAt);
      return createdDate >= startOfMonth && createdDate <= endOfMonth;
    });
    
    const lastMonthMatchings = allMatchings.filter((m: any) => {
      const createdDate = new Date(m.createdAt);
      return createdDate >= startOfLastMonth && createdDate <= endOfLastMonth;
    });
    
    console.log('📊 Matchings:', {
      thisMonth: thisMonthMatchings.length,
      lastMonth: lastMonthMatchings.length
    });
    
    if (thisMonthMatchings.length === 0) {
      return [];
    }
    
    // Bu ayın detaylarını çek
    const thisMonthDetails = await Promise.all(
      thisMonthMatchings.map((m: any) => 
        apiClient.get(`/matching/${m.id}`)
      )
    );
    
    // Tüm eğitmenlerin bilgilerini çek (avatar için)
    const instructorsResponse = await apiClient.get('/instructors');
    const instructorsData = instructorsResponse.success ? instructorsResponse.data : [];
    const instructorInfoMap = new Map<string, any>();
    instructorsData.forEach((inst: any) => {
      instructorInfoMap.set(inst.id, inst);
    });
    
    // Geçen ayın detaylarını çek (trend hesaplama için)
    const lastMonthDetails = lastMonthMatchings.length > 0 
      ? await Promise.all(
          lastMonthMatchings.map((m: any) => 
            apiClient.get(`/matching/${m.id}`)
          )
        )
      : [];
    
    // Bu ay için eğitmenlere göre grupla
    const instructorMap = new Map<string, {
      id: string;
      name: string;
      students: any[];
      matchings: string[];
    }>();
    
    thisMonthDetails.forEach((detailResponse) => {
      if (!detailResponse.success || !detailResponse.data) return;
      
      const matching = detailResponse.data;
      const results = matching.results || [];
      
      results.forEach((result: any) => {
        const instructorId = result.instructorId;
        const instructorName = result.instructorName || 'Bilinmeyen';
        
        if (!instructorMap.has(instructorId)) {
          instructorMap.set(instructorId, {
            id: instructorId,
            name: instructorName,
            students: [],
            matchings: []
          });
        }
        
        const instructorData = instructorMap.get(instructorId)!;
        instructorData.students.push(result);
        
        if (!instructorData.matchings.includes(matching.id)) {
          instructorData.matchings.push(matching.id);
        }
      });
    });
    
    // Geçen ay için eğitmenlere göre grupla (başarı oranı hesapla)
    const lastMonthInstructorStats = new Map<string, number>();
    
    lastMonthDetails.forEach((detailResponse) => {
      if (!detailResponse.success || !detailResponse.data) return;
      
      const results = detailResponse.data.results || [];
      const instructorGroups = new Map<string, any[]>();
      
      results.forEach((result: any) => {
        const instructorId = result.instructorId;
        if (!instructorGroups.has(instructorId)) {
          instructorGroups.set(instructorId, []);
        }
        instructorGroups.get(instructorId)!.push(result);
      });
      
      instructorGroups.forEach((students, instructorId) => {
        const total = students.length;
        const passed = students.filter(s => {
          const student = s.student;
          return student?.writtenExamStatus === 'PASSED' && 
                 student?.drivingExamStatus === 'PASSED';
        }).length;
        
        const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
        
        // Eğer zaten varsa ortalama al
        if (lastMonthInstructorStats.has(instructorId)) {
          const existing = lastMonthInstructorStats.get(instructorId)!;
          lastMonthInstructorStats.set(instructorId, Math.round((existing + successRate) / 2));
        } else {
          lastMonthInstructorStats.set(instructorId, successRate);
        }
      });
    });
    
    console.log('📈 Last month stats:', Array.from(lastMonthInstructorStats.entries()));
    
    // Bu ay için istatistikleri hesapla
    const stats: InstructorStat[] = [];
    
    instructorMap.forEach((data, instructorId) => {
      const totalStudents = data.students.length;
      
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
      
      const averageScore = successRate;
      
      // Geçen ayla karşılaştır ve trend hesapla
      const previousSuccessRate = lastMonthInstructorStats.get(instructorId);
      const trend = calculateTrend(successRate, previousSuccessRate);
      
      // Eğitmen bilgilerini al
      const instructorInfo = instructorInfoMap.get(instructorId);
      const avatar = instructorInfo?.profilePhoto || undefined;
      
      stats.push({
        id: instructorId,
        name: data.name,
        matchingGroup: `Bu Ay (${data.matchings.length} Eşleştirme)`,
        matchingId: 'current-month',
        totalStudents,
        passedStudents,
        failedStudents,
        successRate,
        averageScore,
        rank: 0,
        trend,
        previousSuccessRate,
        avatar
      });
    });
    
    // Başarı oranına göre sırala
    stats.sort((a, b) => b.successRate - a.successRate);
    
    // Sıralamayı güncelle
    stats.forEach((stat, index) => {
      stat.rank = index + 1;
    });
    
    console.log('📈 Monthly stats with trends:', stats.map(s => ({
      name: s.name,
      current: s.successRate,
      previous: s.previousSuccessRate,
      trend: s.trend
    })));
    
    return stats;
  } catch (error) {
    console.error('Bu ay istatistikleri yüklenirken hata:', error);
    throw error;
  }
};

/**
 * Geçmiş ay ile karşılaştırarak trend hesapla
 */
export const calculateTrend = (
  currentRate: number,
  previousRate?: number
): 'up' | 'down' | 'stable' => {
  if (!previousRate || previousRate === 0) return 'stable';
  
  const diff = currentRate - previousRate;
  
  if (diff > 5) return 'up';
  if (diff < -5) return 'down';
  return 'stable';
};
