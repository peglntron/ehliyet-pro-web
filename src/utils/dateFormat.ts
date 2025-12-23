/**
 * Tarih formatlama utility fonksiyonları
 * Tüm tarihler Türkiye saatiyle (Europe/Istanbul) gösterilir
 */

const TIMEZONE = 'Europe/Istanbul';
const LOCALE = 'tr-TR';

/**
 * Tarihi sadece gün/ay/yıl formatında gösterir
 * Örnek: 23.11.2025
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(LOCALE, { 
      timeZone: TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return '-';
  }
};

/**
 * Tarihi saat ile birlikte gösterir
 * Örnek: 23.11.2025 15:30:45
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString(LOCALE, {
      timeZone: TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return '-';
  }
};

/**
 * Tarihi uzun formatda gösterir
 * Örnek: 23 Kasım 2025
 */
export const formatDateLong = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(LOCALE, {
      timeZone: TIMEZONE,
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return '-';
  }
};

/**
 * Sadece saati gösterir
 * Örnek: 15:30
 */
export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString(LOCALE, {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '-';
  }
};

/**
 * Göreceli zaman gösterir (kaç saat/gün önce)
 * Örnek: "2 saat önce", "3 gün önce"
 */
export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 30) return `${diffDays} gün önce`;
    
    return formatDate(date);
  } catch {
    return '-';
  }
};
