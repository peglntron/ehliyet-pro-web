import {
  People as PeopleIcon,
  School as SchoolIcon,
  DriveEta as DriveEtaIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon,
  MenuBook as MenuBookIcon,
  TrendingUp as TrendingUpIcon,
  Grade as GradeIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Star as StarIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';
import type { StatItem, ActivityItem } from '../../dashboard/types/types';

export const useCompanyDashboardStats = (): StatItem[] => {
  // Mock veriler - gerçek uygulamada API'den gelecek
  const totalStudents = 126;
  const writtenPassedStudents = 98;
  const drivingPassedStudents = 75;
  const activeStudents = 84;
  const completedStudents = 42;
  const totalInstructors = 8;
  const activeInstructors = 7;
  
  // Mali hesaplamalar (örnek)
  const courseFee = 3500; // Kurs ücreti
  const totalRevenue = completedStudents * courseFee;
  
  // Başarı oranları
  const writtenSuccessRate = totalStudents > 0 ? Math.round((writtenPassedStudents / totalStudents) * 100) : 0;
  const drivingSuccessRate = totalStudents > 0 ? Math.round((drivingPassedStudents / totalStudents) * 100) : 0;
  
  // Ana kartlar
  const mainStats: StatItem[] = [
    { 
      id: '1',
      title: 'Toplam Öğrenci',
      value: totalStudents,
      iconComponent: PeopleIcon,
      color: '#1976d2', // Mavi
      description: 'Kursa kayıtlı toplam öğrenci sayısı'
    },
    { 
      id: '2',
      title: 'Yazılı Sınavı Geçen',
      value: writtenPassedStudents,
      iconComponent: AssignmentIcon,
      color: '#2e7d32', // Yeşil
      description: 'Yazılı sınavını başarıyla geçen öğrenciler'
    },
    { 
      id: '3',
      title: 'Direksiyon Sınavı Geçen',
      value: drivingPassedStudents,
      iconComponent: DriveEtaIcon,
      color: '#ed6c02', // Turuncu
      description: 'Direksiyon sınavını başarıyla geçen öğrenciler'
    },
    { 
      id: '4',
      title: 'Aktif Öğrenci',
      value: activeStudents,
      iconComponent: SchoolIcon,
      color: '#9c27b0', // Mor
      description: 'Eğitime devam eden öğrenciler'
    },
    { 
      id: '5',
      title: 'Toplam Eğitmen',
      value: totalInstructors,
      iconComponent: PersonIcon,
      color: '#d32f2f', // Kırmızı
      description: 'Kursta görev yapan eğitmen sayısı'
    }
  ];
  
  // Detaylı istatistikler
  const detailedStats: StatItem[] = [
    {
      id: 'detail-1',
      title: 'Aktif Eğitmen',
      value: activeInstructors,
      iconComponent: PersonIcon,
      color: '#0288d1', // Açık Mavi
      description: 'Aktif durumda olan eğitmen sayısı'
    },
    {
      id: 'detail-2',
      title: 'Mezun Öğrenci',
      value: completedStudents,
      iconComponent: EmojiEventsIcon,
      color: '#f57c00', // Koyu Turuncu
      description: 'Kursu başarıyla tamamlayan öğrenciler'
    },
    {
      id: 'detail-3',
      title: 'Yazılı Başarı Oranı',
      value: `%${writtenSuccessRate}`,
      iconComponent: GradeIcon,
      color: '#388e3c', // Koyu Yeşil
      description: 'Yazılı sınav başarı yüzdesi'
    },
    {
      id: 'detail-4',
      title: 'Direksiyon Başarı Oranı',
      value: `%${drivingSuccessRate}`,
      iconComponent: StarIcon,
      color: '#7b1fa2', // Koyu Mor
      description: 'Direksiyon sınav başarı yüzdesi'
    },
    {
      id: 'detail-5',
      title: 'Aylık Gelir',
      value: `₺${(totalRevenue / 12).toLocaleString('tr-TR')}`,
      iconComponent: AccountBalanceWalletIcon,
      color: '#00695c', // Turkuaz
      description: 'Tahmini aylık gelir (mezun öğrenciler)'
    }
  ];

  return [...mainStats, ...detailedStats];
};

export const getCompanyActivities = (): ActivityItem[] => {
  return [
    { 
      id: '1',
      title: 'Yeni öğrenci kaydı: Ahmet Yılmaz', 
      time: '15 dakika önce', 
      iconComponent: PeopleIcon,
      color: 'primary.main',
      isNew: true
    },
    { 
      id: '2',
      title: '3 öğrenci yazılı sınavını geçti', 
      time: '1 saat önce', 
      iconComponent: CheckCircleIcon,
      color: 'success.main',
      isNew: true
    },
    { 
      id: '3',
      title: 'Eğitmen: Mehmet Kaya direksiyon dersi verdi', 
      time: '2 saat önce', 
      iconComponent: DirectionsCarIcon,
      color: 'warning.main'
    },
    { 
      id: '4',
      title: '5 öğrenci teorik dersini tamamladı', 
      time: '4 saat önce', 
      iconComponent: MenuBookIcon,
      color: 'info.main'
    },
    { 
      id: '5',
      title: 'Yeni eğitmen: Fatma Demir işe başladı', 
      time: '1 gün önce', 
      iconComponent: PersonIcon,
      color: 'secondary.main'
    },
    { 
      id: '6',
      title: '2 öğrenci direksiyon sınavını geçti', 
      time: '1 gün önce', 
      iconComponent: DriveEtaIcon,
      color: 'success.main'
    },
    { 
      id: '7',
      title: 'Haftalık performans raporu hazırlandı', 
      time: '2 gün önce', 
      iconComponent: TrendingUpIcon,
      color: 'primary.main'
    },
    { 
      id: '8',
      title: 'Kurs taksitleri tahsil edildi', 
      time: '3 gün önce', 
      iconComponent: AccountBalanceWalletIcon,
      color: 'success.main'
    }
  ];
};