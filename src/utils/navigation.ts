import type { UserPermissions } from '../types/permissions';

/**
 * COMPANY_USER için yetkili olduğu ilk sayfaya yönlendir
 * Öncelik sırasına göre kontrol eder
 */
export const getFirstAuthorizedRoute = (permissions: UserPermissions): string => {
  // Öncelik sırası
  if (permissions.canViewDashboard) return '/company/dashboard';
  if (permissions.canManageStudents) return '/students';
  if (permissions.canViewDrivingLessons) return '/driving-lessons';
  if (permissions.canViewInstructorDetails) return '/instructors';
  if (permissions.canManageVehicles) return '/vehicles';
  if (permissions.canViewNotifications) return '/notifications';
  if (permissions.canManageMatching) return '/matching/saved';
  if (permissions.canViewReports) return '/reports';
  if (permissions.canViewExpenses) return '/expense-categories';
  if (permissions.canAccessSettings) return '/settings';
  
  // Hiçbir yetkisi yoksa sadece işletme bilgilerini görebilir
  return '/company/info';
};

/**
 * Role bazlı default route
 */
export const getDefaultRouteForRole = (role: string, permissions?: UserPermissions): string => {
  switch (role) {
    case 'ADMIN':
      return '/';
    case 'INSTRUCTOR':
      return '/instructor/dashboard';
    case 'COMPANY_ADMIN':
      return '/company/dashboard';
    case 'COMPANY_USER':
      return permissions ? getFirstAuthorizedRoute(permissions) : '/company/info';
    default:
      return '/';
  }
};
