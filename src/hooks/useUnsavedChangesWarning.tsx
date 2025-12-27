import { useEffect } from 'react';

interface UseUnsavedChangesWarningProps {
  hasUnsavedChanges: boolean;
  message?: string;
}

/**
 * Hook to warn users about unsaved changes when:
 * - Closing/refreshing the browser tab
 * - Using browser back/forward buttons
 * 
 * @param hasUnsavedChanges - Boolean indicating if there are unsaved changes
 * @param message - Optional custom warning message (default: standard warning)
 * 
 * @example
 * ```tsx
 * const [formData, setFormData] = useState(initialData);
 * const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);
 * 
 * useUnsavedChangesWarning({ 
 *   hasUnsavedChanges: hasChanges,
 *   message: 'Değişiklikleriniz kaydedilmedi. Çıkmak istediğinize emin misiniz?'
 * });
 * ```
 */
export const useUnsavedChangesWarning = ({ 
  hasUnsavedChanges, 
  message = 'Yaptığınız değişiklikler kaydedilmedi. Sayfadan ayrılırsanız tüm değişiklikler kaybolacak. Devam etmek istiyor musunuz?'
}: UseUnsavedChangesWarningProps) => {
  
  // Sayfa yenileme/kapama kontrolü
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Modern browsers ignore custom message
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
  
  // Route değişikliklerini engelle (browser back/forward)
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    const handlePopState = () => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm(message);
        
        if (!confirmLeave) {
          // Geri gitmemeyi sağla
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    };
    
    // Initial history state oluştur
    window.history.pushState(null, '', window.location.pathname);
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, message]);
};
