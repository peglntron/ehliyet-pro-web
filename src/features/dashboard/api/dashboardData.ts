import { useState, useEffect } from 'react';
import type { StatItem, ActivityItem } from '../types/types';
import { dashboardApi } from '../../../utils/api';
import {
  School,
  QuestionAnswer,
  History,
  Animation,
  BusinessCenter,
  Person,
  Book,
  Category,
  HelpOutline,
  Group,
  Domain,
  Traffic,
  Badge,
  Article,
  VideoLibrary
} from '@mui/icons-material';

// Gruplandırılmış istatistikler için interface
export interface GroupedStats {
  questions: StatItem[];    // Soru İstatistikleri
  content: StatItem[];      // İçerik İstatistikleri
  students: StatItem[];     // Kullanıcı İstatistikleri
  courses: StatItem[];      // Kurs İstatistikleri
}

export const useDashboardStats = (): GroupedStats => {
  const [stats, setStats] = useState<GroupedStats>({
    questions: [],
    content: [],
    students: [],
    courses: []
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardApi.getStats();
        if (response.success && response.data) {
          const data = response.data;
          
          // GRUP 1: Soru İstatistikleri (Yeşil, Mor, Mavi tonları)
          const questionStats: StatItem[] = [
            { 
              id: 'q1',
              title: data.totals.totalQuestions.title,
              value: data.totals.totalQuestions.value,
              iconComponent: HelpOutline,
              color: '#4caf50', // Yeşil
              description: data.totals.totalQuestions.description
            },
            { 
              id: 'q2',
              title: data.main.examQuestions.title,
              value: data.main.examQuestions.value,
              iconComponent: History,
              color: '#9c27b0', // Mor
              description: data.main.examQuestions.description
            },
            { 
              id: 'q3',
              title: data.main.animatedQuestions.title,
              value: data.main.animatedQuestions.value,
              iconComponent: Animation,
              color: '#2196f3', // Mavi
              description: data.main.animatedQuestions.description
            }
          ];
          
          // GRUP 2: İçerik İstatistikleri (Kırmızı, Turuncu/Sarı tonları)
          const contentStats: StatItem[] = [
            {
              id: 'c1',
              title: data.totals.totalLessons.title,
              value: data.totals.totalLessons.value,
              iconComponent: Book,
              color: '#f44336', // Kırmızı
              description: data.totals.totalLessons.description
            },
            {
              id: 'c2',
              title: data.totals.totalUnits.title,
              value: data.totals.totalUnits.value,
              iconComponent: Category,
              color: '#ff9800', // Turuncu
              description: data.totals.totalUnits.description
            },
            {
              id: 'c3',
              title: 'Toplam Video',
              value: 0, // İleride eklenecek
              iconComponent: VideoLibrary,
              color: '#ffc107', // Sarı
              description: 'Ünite içeriklerindeki video sayısı (Yakında)'
            }
          ];
          
          // GRUP 3: Kullanıcı İstatistikleri (Koyu Yeşil, Koyu Mor, Koyu Mavi)
          const studentStats: StatItem[] = [
            {
              id: 's1',
              title: data.totals.totalStudents.title,
              value: data.totals.totalStudents.value,
              iconComponent: Group,
              color: '#2e7d32', // Koyu Yeşil
              description: data.totals.totalStudents.description
            },
            { 
              id: 's2',
              title: data.main.courseStudents.title,
              value: data.main.courseStudents.value,
              iconComponent: BusinessCenter,
              color: '#6a1b9a', // Koyu Mor
              description: data.main.courseStudents.description
            },
            { 
              id: 's3',
              title: data.main.independentStudents.title,
              value: data.main.independentStudents.value,
              iconComponent: Person,
              color: '#1565c0', // Koyu Mavi
              description: data.main.independentStudents.description
            }
          ];
          
          // GRUP 4: Kurs İstatistikleri (Koyu Kırmızı, Koyu Turuncu)
          const courseStats: StatItem[] = [
            {
              id: 'co1',
              title: data.totals.totalCourses.title,
              value: data.totals.totalCourses.value,
              iconComponent: Domain,
              color: '#c62828', // Koyu Kırmızı
              description: data.totals.totalCourses.description
            },
            { 
              id: 'co2',
              title: data.main.activeCourses.title,
              value: data.main.activeCourses.value,
              iconComponent: School,
              color: '#e65100', // Koyu Turuncu
              description: data.main.activeCourses.description
            },
            {
              id: 'co3',
              title: 'Lisansı Bitecek Kurslar',
              value: 0, // Yeni eklenecek
              iconComponent: Badge,
              color: '#f57c00', // Turuncu
              description: '30 gün içinde lisansı bitecek kurs sayısı (Yakında)'
            }
          ];
          
          setStats({
            questions: questionStats,
            content: contentStats,
            students: studentStats,
            courses: courseStats
          });
        }
      } catch (error) {
        console.error('Dashboard stats fetch error:', error);
        setStats({
          questions: [],
          content: [],
          students: [],
          courses: []
        });
      }
    };
    
    fetchStats();
  }, []);
  
  return stats;
};

// Icon mapping helper
const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    domain: Domain,
    person: Person,
    business_center: BusinessCenter,
    help_outline: HelpOutline,
    book: Book,
    category: Category,
    article: Article,
    traffic: Traffic,
    badge: Badge,
    school: School
  };
  return icons[iconName] || QuestionAnswer;
};

// Time ago helper
const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffMs = now.getTime() - activityTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  return `${diffDays} gün önce`;
};

export const useActivities = (limit?: number): ActivityItem[] => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await dashboardApi.getRecentActivities(limit);
        if (response.success && response.data) {
          const formattedActivities: ActivityItem[] = response.data.map(activity => ({
            id: activity.id,
            title: activity.title,
            time: getTimeAgo(activity.timestamp),
            iconComponent: getIconComponent(activity.icon),
            color: activity.color,
            isNew: getTimeAgo(activity.timestamp).includes('dakika') || getTimeAgo(activity.timestamp).includes('Az önce')
          }));
          setActivities(formattedActivities);
        }
      } catch (error) {
        console.error('Activities fetch error:', error);
        setActivities([]);
      }
    };
    
    fetchActivities();
  }, [limit]);
  
  return activities;
};

// Today Activity Count Hook
export const useTodayActivityCount = (): number => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await dashboardApi.getTodayActivityCount();
        if (response.success && response.data) {
          setCount(response.data.count);
        }
      } catch (error) {
        console.error('Today activity count fetch error:', error);
        setCount(0);
      }
    };

    fetchCount();
  }, []);

  return count;
};

// Company Trends Hook
export const useCompanyTrends = () => {
  const [trends, setTrends] = useState<any>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await dashboardApi.getCompanyTrends();
        if (response.success && response.data) {
          setTrends(response.data);
        }
      } catch (error) {
        console.error('Company trends fetch error:', error);
        setTrends(null);
      }
    };

    fetchTrends();
  }, []);

  return trends;
};

// API Logs Hook
export const useApiLogs = () => {
  const [logs, setLogs] = useState<any>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await dashboardApi.getApiLogs();
        if (response.success && response.data) {
          setLogs(response.data);
        }
      } catch (error) {
        console.error('API logs fetch error:', error);
        setLogs(null);
      }
    };

    fetchLogs();
  }, []);

  return logs;
};

// User Role Distribution Hook
export const useUserRoleDistribution = () => {
  const [roleData, setRoleData] = useState<any>(null);

  useEffect(() => {
    const fetchRoleData = async () => {
      try {
        const response = await dashboardApi.getUserRoleDistribution();
        if (response.success && response.data) {
          setRoleData(response.data);
        }
      } catch (error) {
        console.error('User role distribution fetch error:', error);
        setRoleData(null);
      }
    };

    fetchRoleData();
  }, []);

  return roleData;
};

// Financial Statistics Hook
export const useFinancialStats = () => {
  const [financialData, setFinancialData] = useState<any>(null);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const response = await dashboardApi.getFinancialStats();
        if (response.success && response.data) {
          setFinancialData(response.data);
        }
      } catch (error) {
        console.error('Financial stats fetch error:', error);
        setFinancialData(null);
      }
    };

    fetchFinancialData();
  }, []);

  return financialData;
};

// License Statistics Hook
export const useLicenseStats = () => {
  const [licenseData, setLicenseData] = useState<any>(null);

  useEffect(() => {
    const fetchLicenseData = async () => {
      try {
        const response = await dashboardApi.getLicenseStats();
        if (response.success && response.data) {
          setLicenseData(response.data);
        }
      } catch (error) {
        console.error('License stats fetch error:', error);
        setLicenseData(null);
      }
    };

    fetchLicenseData();
  }, []);

  return licenseData;
};

// User Activity Statistics Hook
export const useUserActivityStats = () => {
  const [activityData, setActivityData] = useState<any>(null);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const response = await dashboardApi.getUserActivityStats();
        if (response.success && response.data) {
          setActivityData(response.data);
        }
      } catch (error) {
        console.error('User activity stats fetch error:', error);
        setActivityData(null);
      }
    };

    fetchActivityData();
  }, []);

  return activityData;
};

// Company Growth Statistics Hook
export const useCompanyGrowthStats = () => {
  const [growthData, setGrowthData] = useState<any>(null);

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const response = await dashboardApi.getCompanyGrowthStats();
        if (response.success && response.data) {
          setGrowthData(response.data);
        }
      } catch (error) {
        console.error('Company growth stats fetch error:', error);
        setGrowthData(null);
      }
    };

    fetchGrowthData();
  }, []);

  return growthData;
};

// Backward compatibility - mock data yerine API kullan
export const getActivities = (): ActivityItem[] => {
  return [];
};