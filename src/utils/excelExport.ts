import * as XLSX from 'xlsx';

/**
 * Excel export utility
 * Generic fonksiyon - tüm raporlarda kullanılabilir
 */

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

interface ExportOptions {
  filename: string;
  sheetName: string;
  columns: ExcelColumn[];
  data: any[];
  includeTimestamp?: boolean;
}

/**
 * Veriyi Excel dosyası olarak indir
 */
export const exportToExcel = ({
  filename,
  sheetName,
  columns,
  data,
  includeTimestamp = true
}: ExportOptions): void => {
  try {
    // Veriyi düzenle - sadece belirtilen kolonları al
    const formattedData = data.map(row => {
      const formattedRow: any = {};
      columns.forEach(col => {
        formattedRow[col.header] = row[col.key] !== undefined ? row[col.key] : '';
      });
      return formattedRow;
    });

    // Worksheet oluştur
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // Kolon genişliklerini ayarla
    const colWidths = columns.map(col => ({
      wch: col.width || 15 // Varsayılan genişlik 15 karakter
    }));
    ws['!cols'] = colWidths;

    // Workbook oluştur
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Dosya adına timestamp ekle
    const timestamp = includeTimestamp
      ? `_${new Date().toISOString().split('T')[0]}_${new Date().toTimeString().split(' ')[0].replace(/:/g, '-')}`
      : '';
    const finalFilename = `${filename}${timestamp}.xlsx`;

    // Excel dosyasını indir
    XLSX.writeFile(wb, finalFilename);
  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error('Excel dosyası oluşturulurken bir hata oluştu');
  }
};

/**
 * Kasa raporu için özel export
 */
export const exportCashReportToExcel = (transactions: any[], summary: any): void => {
  const wb = XLSX.utils.book_new();

  // İşlemler sayfası
  const transactionData = transactions.map(t => ({
    'Tarih': new Date(t.payment_date).toLocaleDateString('tr-TR'),
    'Öğrenci': `${t.student_first_name} ${t.student_last_name}`,
    'Tür': t.payment_type === 'PAYMENT' ? 'Ödeme' : t.payment_type === 'DEBT' ? 'Borç Ödemesi' : t.payment_type,
    'Tutar (₺)': Number(t.amount).toFixed(2),
    'Ödeme Yöntemi': getPaymentMethodName(t.payment_method),
    'Taksit': t.installmentNumber && t.totalInstallments 
      ? `${t.installmentNumber}/${t.totalInstallments}` 
      : '-',
    'Açıklama': t.description || '-'
  }));

  const wsTransactions = XLSX.utils.json_to_sheet(transactionData);
  wsTransactions['!cols'] = [
    { wch: 12 }, // Tarih
    { wch: 25 }, // Öğrenci
    { wch: 12 }, // Tür
    { wch: 15 }, // Tutar
    { wch: 18 }, // Ödeme Yöntemi
    { wch: 10 }, // Taksit
    { wch: 30 }  // Açıklama
  ];
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'İşlemler');

  // Özet sayfası
  const summaryData = [
    { 'Metrik': 'Toplam Gelir', 'Tutar (₺)': Number(summary.totalAmount).toFixed(2) },
    { 'Metrik': 'Nakit', 'Tutar (₺)': Number(summary.cashAmount).toFixed(2) },
    { 'Metrik': 'Kredi Kartı', 'Tutar (₺)': Number(summary.creditCardAmount).toFixed(2) },
    { 'Metrik': 'POS', 'Tutar (₺)': Number(summary.posAmount).toFixed(2) },
    { 'Metrik': 'Havale/EFT', 'Tutar (₺)': Number(summary.bankTransferAmount).toFixed(2) },
    { 'Metrik': 'Toplam İşlem Sayısı', 'Tutar (₺)': summary.transactionCount }
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 25 }, // Metrik
    { wch: 20 }  // Tutar
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Özet');

  // Dosyayı indir
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Kasa_Raporu_${timestamp}.xlsx`);
};

/**
 * Araç istatistikleri için özel export
 */
export const exportVehicleStatsToExcel = (vehicles: any[], summary: any): void => {
  const wb = XLSX.utils.book_new();

  // Durum çevirme fonksiyonu
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'AVAILABLE': return 'Müsait';
      case 'ASSIGNED': return 'Zimmetli';
      case 'MAINTENANCE': return 'Bakımda';
      case 'REPAIR': return 'Tamirde';
      case 'INACTIVE': return 'Hizmet Dışı';
      default: return status;
    }
  };

  const getServiceStatusText = (status: string): string => {
    if (!status) return '-';
    switch (status) {
      case 'OVERDUE': return 'Gecikmiş';
      case 'SOON': return 'Yakında';
      case 'OK': return 'Normal';
      default: return status;
    }
  };

  const getInspectionStatusText = (status: string): string => {
    if (!status) return '-';
    switch (status) {
      case 'EXPIRED': return 'Süresi Dolmuş';
      case 'EXPIRING': return 'Süresi Dolacak';
      case 'VALID': return 'Geçerli';
      default: return status;
    }
  };

  // 1. Araç Detay Listesi
  const vehicleData = vehicles.map(v => {
    // Backend'den farklı formatlarda gelebilir, hepsini destekle
    const licensePlate = v.plate || v.license_plate || v.licensePlate;
    const instructorName = v.instructor_name || 
      (v.currentInstructor ? `${v.currentInstructor.firstName} ${v.currentInstructor.lastName}` : null) ||
      '-';
    
    return {
      'Plaka': licensePlate,
      'Marka': v.brand,
      'Model': v.model,
      'Yıl': v.year,
      'Durum': getStatusText(v.vehicle_status || v.status),
      'Eğitmen': instructorName,
      'Güncel KM': v.currentKm || 0,
      'Yakıt Kayıt Sayısı': v.fuel_records_count || 0,
      'Toplam Yakıt (L)': Number(v.total_fuel_liters || 0).toFixed(2),
      'Toplam Yakıt Maliyeti (₺)': Number(v.total_fuel_cost || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      'Aktif Atamalar': v.active_assignments || 0,
      'Toplam Atamalar': v.total_assignments || 0,
      'Servis Durumu': getServiceStatusText(v.service_status || ''),
      'Muayene Durumu': getInspectionStatusText(v.inspection_status || ''),
      'Son Yakıt Tarihi': v.last_fuel_date ? new Date(v.last_fuel_date).toLocaleDateString('tr-TR') : '-',
      'Trafik Sigortası Başlangıç': v.trafficInsuranceStart ? new Date(v.trafficInsuranceStart).toLocaleDateString('tr-TR') : '-',
      'Trafik Sigortası Bitiş': v.trafficInsuranceEnd ? new Date(v.trafficInsuranceEnd).toLocaleDateString('tr-TR') : '-',
      'Kasko Başlangıç': v.kaskoInsuranceStart ? new Date(v.kaskoInsuranceStart).toLocaleDateString('tr-TR') : '-',
      'Kasko Bitiş': v.kaskoInsuranceEnd ? new Date(v.kaskoInsuranceEnd).toLocaleDateString('tr-TR') : '-',
      'Muayene Başlangıç': v.inspectionStart ? new Date(v.inspectionStart).toLocaleDateString('tr-TR') : '-',
      'Muayene Bitiş': v.inspectionEnd ? new Date(v.inspectionEnd).toLocaleDateString('tr-TR') : '-'
    };
  });

  const wsVehicles = XLSX.utils.json_to_sheet(vehicleData);
  wsVehicles['!cols'] = [
    { wch: 12 }, // Plaka
    { wch: 15 }, // Marka
    { wch: 15 }, // Model
    { wch: 8 },  // Yıl
    { wch: 12 }, // Durum
    { wch: 20 }, // Eğitmen
    { wch: 12 }, // Güncel KM
    { wch: 18 }, // Yakıt Kayıt
    { wch: 15 }, // Yakıt Litre
    { wch: 25 }, // Yakıt Maliyet
    { wch: 15 }, // Aktif Atamalar
    { wch: 15 }, // Toplam Atamalar
    { wch: 15 }, // Servis
    { wch: 18 }, // Muayene
    { wch: 18 }, // Son Yakıt
    { wch: 20 }, // Trafik Başlangıç
    { wch: 20 }, // Trafik Bitiş
    { wch: 20 }, // Kasko Başlangıç
    { wch: 20 }, // Kasko Bitiş
    { wch: 20 }, // Muayene Başlangıç
    { wch: 20 }  // Muayene Bitiş
  ];
  XLSX.utils.book_append_sheet(wb, wsVehicles, 'Araç Detay Listesi');

  // 2. Eğitmen Bazlı İstatistikler
  const instructorStats: { [key: string]: any } = {};
  
  vehicles.forEach(v => {
    // Eğitmen adını farklı formatlardan al
    const instructorName = v.instructor_name || 
      (v.currentInstructor ? `${v.currentInstructor.firstName} ${v.currentInstructor.lastName}` : null) ||
      'Atanmamış';
      
    if (!instructorStats[instructorName]) {
      instructorStats[instructorName] = {
        vehicleCount: 0,
        totalFuelCost: 0,
        totalFuelLiters: 0,
        totalKm: 0
      };
    }
    instructorStats[instructorName].vehicleCount++;
    instructorStats[instructorName].totalFuelCost += Number(v.total_fuel_cost || 0);
    instructorStats[instructorName].totalFuelLiters += Number(v.total_fuel_liters || 0);
    instructorStats[instructorName].totalKm += Number(v.currentKm || 0);
  });

  const instructorData = Object.entries(instructorStats).map(([name, stats]: [string, any]) => ({
    'Eğitmen': name,
    'Araç Sayısı': stats.vehicleCount,
    'Toplam KM': stats.totalKm.toLocaleString('tr-TR'),
    'Toplam Yakıt (L)': stats.totalFuelLiters.toFixed(2),
    'Toplam Yakıt Maliyeti (₺)': stats.totalFuelCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
    'Ort. Yakıt/Araç (₺)': (stats.totalFuelCost / stats.vehicleCount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })
  }));

  const wsInstructors = XLSX.utils.json_to_sheet(instructorData);
  wsInstructors['!cols'] = [
    { wch: 25 }, // Eğitmen
    { wch: 12 }, // Araç Sayısı
    { wch: 15 }, // Toplam KM
    { wch: 18 }, // Yakıt Litre
    { wch: 25 }, // Yakıt Maliyet
    { wch: 20 }  // Ortalama
  ];
  XLSX.utils.book_append_sheet(wb, wsInstructors, 'Eğitmen Bazlı İstatistikler');

  // 3. Araç Bazlı İstatistikler (Plaka bazında özet)
  const vehicleSummaryData = vehicles.map(v => ({
    'Plaka': v.plate || v.license_plate || v.licensePlate,
    'Marka/Model': `${v.brand} ${v.model}`,
    'Toplam Yakıt (₺)': Number(v.total_fuel_cost || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
    'Toplam Yakıt (L)': Number(v.total_fuel_liters || 0).toFixed(2),
    'Yakıt Kayıt Sayısı': v.fuel_records_count || 0,
    'Ort. Maliyet/Kayıt (₺)': v.fuel_records_count > 0 
      ? (Number(v.total_fuel_cost || 0) / v.fuel_records_count).toLocaleString('tr-TR', { minimumFractionDigits: 2 })
      : '0,00',
    'Güncel KM': v.currentKm || 0,
    'Sonraki Servis KM': v.nextServiceKm || '-',
    'Kalan KM': v.nextServiceKm && v.currentKm 
      ? Math.max(0, v.nextServiceKm - v.currentKm).toLocaleString('tr-TR')
      : '-'
  }));

  const wsVehicleSummary = XLSX.utils.json_to_sheet(vehicleSummaryData);
  wsVehicleSummary['!cols'] = [
    { wch: 12 }, // Plaka
    { wch: 25 }, // Marka/Model
    { wch: 20 }, // Toplam Yakıt ₺
    { wch: 18 }, // Toplam Yakıt L
    { wch: 18 }, // Kayıt Sayısı
    { wch: 22 }, // Ortalama
    { wch: 12 }, // Güncel KM
    { wch: 15 }, // Sonraki Servis
    { wch: 12 }  // Kalan KM
  ];
  XLSX.utils.book_append_sheet(wb, wsVehicleSummary, 'Araç Bazlı İstatistikler');

  // 4. Sigorta Takibi
  const insuranceData = vehicles.map(v => {
    const licensePlate = v.plate || v.license_plate || v.licensePlate;
    const today = new Date();
    
    // Trafik sigortası kontrolü
    const trafficDaysRemaining = v.trafficInsuranceEnd 
      ? Math.ceil((new Date(v.trafficInsuranceEnd).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    const trafficStatus = 
      trafficDaysRemaining === null ? 'Bilgi yok' :
      trafficDaysRemaining < 0 ? 'Süresi dolmuş!' :
      trafficDaysRemaining <= 30 ? `${trafficDaysRemaining} gün kaldı` :
      'Geçerli';
    
    // Kasko sigortası kontrolü
    const kaskoDaysRemaining = v.kaskoInsuranceEnd 
      ? Math.ceil((new Date(v.kaskoInsuranceEnd).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    const kaskoStatus = 
      kaskoDaysRemaining === null ? 'Bilgi yok' :
      kaskoDaysRemaining < 0 ? 'Süresi dolmuş!' :
      kaskoDaysRemaining <= 30 ? `${kaskoDaysRemaining} gün kaldı` :
      'Geçerli';
    
    // Genel durum
    const criticalStatus = 
      (trafficDaysRemaining !== null && trafficDaysRemaining < 0) || 
      (kaskoDaysRemaining !== null && kaskoDaysRemaining < 0)
        ? 'Acil!' :
      (trafficDaysRemaining !== null && trafficDaysRemaining <= 30) || 
      (kaskoDaysRemaining !== null && kaskoDaysRemaining <= 30)
        ? 'Uyarı' :
      (trafficDaysRemaining === null && kaskoDaysRemaining === null)
        ? 'Bilgi Yok' :
      'Normal';
    
    return {
      'Plaka': licensePlate,
      'Marka': v.brand,
      'Model': v.model,
      'Yıl': v.year,
      'Trafik Sigortası Başlangıç': v.trafficInsuranceStart ? new Date(v.trafficInsuranceStart).toLocaleDateString('tr-TR') : '-',
      'Trafik Sigortası Bitiş': v.trafficInsuranceEnd ? new Date(v.trafficInsuranceEnd).toLocaleDateString('tr-TR') : '-',
      'Trafik Durumu': trafficStatus,
      'Kasko Başlangıç': v.kaskoInsuranceStart ? new Date(v.kaskoInsuranceStart).toLocaleDateString('tr-TR') : '-',
      'Kasko Bitiş': v.kaskoInsuranceEnd ? new Date(v.kaskoInsuranceEnd).toLocaleDateString('tr-TR') : '-',
      'Kasko Durumu': kaskoStatus,
      'Genel Durum': criticalStatus
    };
  });

  const wsInsurance = XLSX.utils.json_to_sheet(insuranceData);
  wsInsurance['!cols'] = [
    { wch: 12 }, // Plaka
    { wch: 15 }, // Marka
    { wch: 15 }, // Model
    { wch: 8 },  // Yıl
    { wch: 22 }, // Trafik Başlangıç
    { wch: 22 }, // Trafik Bitiş
    { wch: 20 }, // Trafik Durumu
    { wch: 22 }, // Kasko Başlangıç
    { wch: 22 }, // Kasko Bitiş
    { wch: 20 }, // Kasko Durumu
    { wch: 15 }  // Genel Durum
  ];
  XLSX.utils.book_append_sheet(wb, wsInsurance, 'Sigorta Takibi');

  // 5. Özet sayfası
  const summaryData = [
    { 'Metrik': 'Toplam Araç Sayısı', 'Değer': summary.totalVehicles || vehicles.length },
    { 'Metrik': 'Toplam Yakıt Maliyeti (₺)', 'Değer': Number(summary.totalFuelCost || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) },
    { 'Metrik': 'Toplam Yakıt (L)', 'Değer': Number(summary.totalFuelLiters || 0).toFixed(2) },
    { 'Metrik': 'Aktif Atamalar', 'Değer': summary.activeAssignments || 0 },
    { 'Metrik': 'Gecikmiş Servis', 'Değer': summary.overdueService || 0 },
    { 'Metrik': 'Süresi Dolmuş Muayene', 'Değer': summary.expiredInspection || 0 }
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 30 }, // Metrik
    { wch: 25 }  // Değer
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Genel Özet');

  // Dosyayı indir
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Arac_Istatistikleri_${timestamp}.xlsx`);
};

// Helper fonksiyon
const getPaymentMethodName = (method: string): string => {
  switch (method) {
    case 'CASH': return 'Nakit';
    case 'CREDIT_CARD': return 'Kredi Kartı';
    case 'POS': return 'POS';
    case 'BANK_TRANSFER': return 'Havale/EFT';
    default: return method;
  }
};

/**
 * Eğitmen istatistikleri için Excel export
 */
export const exportInstructorStatsToExcel = (stats: any[], matchingName: string): void => {
  const wb = XLSX.utils.book_new();

  // Eğitmen istatistikleri sayfası
  const instructorData = stats.map((stat, index) => ({
    'Sıra': index + 1,
    'Eğitmen Adı': stat.name,
    'Eşleştirme Grubu': stat.matchingGroup,
    'Toplam Öğrenci': stat.totalStudents,
    'Geçen': stat.passedStudents,
    'Kalan': stat.failedStudents,
    'Başarı Oranı (%)': stat.successRate,
    'Ortalama Puan': stat.averageScore,
    'Trend': stat.trend === 'up' ? 'Yükseliş' : stat.trend === 'down' ? 'Düşüş' : 'Sabit',
    'Önceki Başarı (%)': stat.previousSuccessRate || '-',
    'Performans': 
      stat.successRate >= 85 ? 'Mükemmel' :
      stat.successRate >= 75 ? 'İyi' :
      stat.successRate >= 60 ? 'Normal' :
      stat.successRate >= 40 ? 'Geliştirilmeli' : 'Kötü'
  }));

  const wsInstructors = XLSX.utils.json_to_sheet(instructorData);
  wsInstructors['!cols'] = [
    { wch: 6 },  // Sıra
    { wch: 25 }, // Eğitmen Adı
    { wch: 30 }, // Eşleştirme Grubu
    { wch: 15 }, // Toplam Öğrenci
    { wch: 10 }, // Geçen
    { wch: 10 }, // Kalan
    { wch: 15 }, // Başarı Oranı
    { wch: 15 }, // Ortalama Puan
    { wch: 12 }, // Trend
    { wch: 15 }, // Önceki Başarı
    { wch: 15 }  // Performans
  ];
  XLSX.utils.book_append_sheet(wb, wsInstructors, 'Eğitmen İstatistikleri');

  // Özet sayfası
  const totalStudents = stats.reduce((sum, s) => sum + s.totalStudents, 0);
  const totalPassed = stats.reduce((sum, s) => sum + s.passedStudents, 0);
  const overallSuccessRate = totalStudents > 0 ? Math.round((totalPassed / totalStudents) * 100) : 0;
  
  const summaryData = [
    { 'Metrik': 'Eşleştirme', 'Değer': matchingName },
    { 'Metrik': 'Toplam Eğitmen Sayısı', 'Değer': stats.length },
    { 'Metrik': 'Toplam Öğrenci Sayısı', 'Değer': totalStudents },
    { 'Metrik': 'Geçen Öğrenci Sayısı', 'Değer': totalPassed },
    { 'Metrik': 'Kalan Öğrenci Sayısı', 'Değer': totalStudents - totalPassed },
    { 'Metrik': 'Genel Başarı Oranı (%)', 'Değer': overallSuccessRate },
    { 'Metrik': 'En Başarılı Eğitmen', 'Değer': stats.length > 0 ? stats[0].name : '-' },
    { 'Metrik': 'En Yüksek Başarı Oranı (%)', 'Değer': stats.length > 0 ? stats[0].successRate : '-' }
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 30 }, // Metrik
    { wch: 30 }  // Değer
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Özet');

  // Dosyayı indir
  const timestamp = new Date().toISOString().split('T')[0];
  const safeMatchingName = matchingName.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Egitmen_Istatistikleri_${safeMatchingName}_${timestamp}.xlsx`);
};
