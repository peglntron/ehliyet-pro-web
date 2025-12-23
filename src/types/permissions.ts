/**
 * Kullanıcı ekran yetkileri
 * COMPANY_USER rolü için hangi sayfaların görünür olacağını kontrol eder
 */
export interface UserPermissions {
  canViewReports: boolean;           // Raporlar (Gelir/Gider)
  canViewExpenses: boolean;          // Gider Kalemleri ve Giderler
  canManageMatching: boolean;        // Eşleştirme
  canViewInstructorDetails: boolean; // Eğitmen detayları
  canManageVehicles: boolean;        // Araç yönetimi
  canViewNotifications: boolean;     // Bildirim tarihçesi
  canManageStudents: boolean;        // Kursiyer ekleme/düzenleme
  canViewDrivingLessons: boolean;    // Direksiyon eğitimleri
  canViewDashboard: boolean;         // İşletme Paneli
  canAccessSettings: boolean;        // Ayarlar Sayfası
}

/**
 * Default yetkiler
 * Yeni işletmeler için veya hata durumunda kullanılır
 */
export const DEFAULT_USER_PERMISSIONS: UserPermissions = {
  canViewReports: false,
  canViewExpenses: false,
  canManageMatching: false,
  canViewInstructorDetails: true,
  canManageVehicles: true,
  canViewNotifications: true,
  canManageStudents: true,
  canViewDrivingLessons: true,
  canViewDashboard: false,
  canAccessSettings: false,
};

/**
 * Yetki tanımlamaları
 * UI'da gösterilmek için
 */
export interface PermissionDefinition {
  key: keyof UserPermissions;
  label: string;
  description: string;
  icon: string;
  category: 'financial' | 'management' | 'viewing';
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  // Finansal
  {
    key: 'canViewReports',
    label: 'Gelir/Gider Raporlarını Görebilir',
    description: 'Raporlar sayfasında finansal raporları görüntüleyebilir',
    icon: '💰',
    category: 'financial',
  },
  {
    key: 'canViewExpenses',
    label: 'Gider Kalemlerini ve Giderleri Görebilir',
    description: 'Gider kalemleri ve giderler sayfalarına erişebilir',
    icon: '💸',
    category: 'financial',
  },
  // Yönetim
  {
    key: 'canManageMatching',
    label: 'Eğitmen-Öğrenci Eşleştirme Yapabilir',
    description: 'Öğrenci-eğitmen eşleştirme işlemleri yapabilir',
    icon: '🔗',
    category: 'management',
  },
  {
    key: 'canManageStudents',
    label: 'Kursiyer Ekleyebilir/Düzenleyebilir',
    description: 'Yeni kursiyer kaydı yapabilir ve mevcut kursiyerleri düzenleyebilir',
    icon: '👥',
    category: 'management',
  },
  {
    key: 'canManageVehicles',
    label: 'Araç Yönetimi Yapabilir',
    description: 'Araç ekleme, düzenleme ve yönetim işlemleri yapabilir',
    icon: '🚗',
    category: 'management',
  },
  // Görüntüleme
  {
    key: 'canViewInstructorDetails',
    label: 'Eğitmen Detaylarını Görebilir',
    description: 'Eğitmen listesi ve detay sayfalarına erişebilir',
    icon: '👨‍🏫',
    category: 'viewing',
  },
  {
    key: 'canViewDrivingLessons',
    label: 'Direksiyon Eğitimlerini Görebilir',
    description: 'Direksiyon eğitimi takvimini ve listesini görüntüleyebilir',
    icon: '🚙',
    category: 'viewing',
  },
  {
    key: 'canViewNotifications',
    label: 'Bildirim Tarihçesini Görebilir',
    description: 'Gönderilen bildirimlerin tarihçesini görüntüleyebilir',
    icon: '🔔',
    category: 'viewing',
  },
  {
    key: 'canViewDashboard',
    label: 'İşletme Panelini Görebilir',
    description: 'İşletme paneli ve finansal istatistikleri görüntüleyebilir (hassas bilgiler)',
    icon: '📊',
    category: 'viewing',
  },
  {
    key: 'canAccessSettings',
    label: 'Ayarlara Erişebilir',
    description: 'İşletme ayarları ve yapılandırma sayfalarına erişebilir',
    icon: '⚙️',
    category: 'management',
  },
];

/**
 * Kategori başlıkları
 */
export const PERMISSION_CATEGORIES = {
  financial: {
    title: 'Finansal Veriler',
    description: 'Gelir, gider ve finansal raporlara erişim',
  },
  management: {
    title: 'Yönetim İşlemleri',
    description: 'Veri ekleme, düzenleme ve yönetim yetkileri',
  },
  viewing: {
    title: 'Görüntüleme',
    description: 'Verileri görüntüleme yetkileri',
  },
};
