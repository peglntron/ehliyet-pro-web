import React from 'react';
import { Button } from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { MatchingResult } from '../types/types';
import type { Student } from '../../students/types/types';
import type { Instructor } from '../../instructors/types/types';

// jsPDF için tip genişletme
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface PDFExportProps {
  matches: MatchingResult[];
  students: Student[];
  instructors: Instructor[];
  licenseType: string;
}

const PDFExport: React.FC<PDFExportProps> = ({
  matches,
  students,
  instructors,
  licenseType
}) => {

  // jsPDF için güvenli ASCII karakter dönüştürme
  const encodeTurkishForPDF = (text: string): string => {
    if (!text) return '';
    
    // jsPDF sadece ASCII karakterleri güvenli şekilde destekler
    // Türkçe karakterleri benzer Latin harflerle değiştir
    return text
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ş/g, 's').replace(/Ş/g, 'S') 
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C')
      // Diğer karakterleri de dönüştür
      .replace(/â/g, 'a').replace(/Â/g, 'A')
      .replace(/ê/g, 'e').replace(/Ê/g, 'E')
      .replace(/î/g, 'i').replace(/Î/g, 'I')
      .replace(/ô/g, 'o').replace(/Ô/g, 'O')
      .replace(/û/g, 'u').replace(/Û/g, 'U')
      // Diğer problemli karakterler
      .replace(/[^\x20-\x7E]/g, '?'); // ASCII dışı karakterleri ? ile değiştir
  };

  const generatePDF = () => {
    if (matches.length === 0) {
      alert('PDF oluşturmak için eşleştirme sonucu bulunamadı!');
      return;
    }

    // PDF oluştur - UTF-8 desteği ile
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      compress: true
    });
    
    // ASCII uyumlu font kullan
    doc.setFont('helvetica', 'normal');

    // Eğitmen bazında gruplama
    const instructorGroups = new Map<string, MatchingResult[]>();
    matches.forEach(match => {
      if (!instructorGroups.has(match.instructorId)) {
        instructorGroups.set(match.instructorId, []);
      }
      instructorGroups.get(match.instructorId)!.push(match);
    });

    let isFirstPage = true;
    let pageNumber = 1;

    // Her eğitmen için ayrı sayfa oluştur
    instructorGroups.forEach((instructorMatches, instructorId) => {
      // İlk sayfadan sonra yeni sayfa ekle
      if (!isFirstPage) {
        doc.addPage();
        pageNumber++;
      }
      isFirstPage = false;

      let currentY = 20;

      // Eğitmen bilgisi
      const instructor = instructors.find(i => i.id === instructorId);
      if (!instructor) return;

      // Sayfa başlığı - Yeni format
      const currentDate = new Date();
      const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      const monthName = monthNames[currentDate.getMonth()];
      const year = currentDate.getFullYear();
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(encodeTurkishForPDF(`Eşleştirme: ${monthName} ${year} ${licenseType} Sınıfı Eşleştirmesi`), 20, currentY);
      
      currentY += 15;

      // Eğitmen detayları
      const instructorName = `${instructor.firstName} ${instructor.lastName}`;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(encodeTurkishForPDF(`Eğitmen: ${instructorName}`), 20, currentY);
      
      currentY += 8;
      
      // Eğitmen iletişim bilgileri
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      if (instructor.phone) {
        doc.text(encodeTurkishForPDF(`Telefon: ${instructor.phone}`), 20, currentY);
        currentY += 6;
      }
      
      // Araç bilgisi
      if (instructor.vehiclePlate && instructor.vehicleModel) {
        doc.text(encodeTurkishForPDF(`Araç: ${instructor.vehiclePlate} - ${instructor.vehicleModel}`), 20, currentY);
        currentY += 6;
      }
      
      // Öğrenci sayısı
      doc.text(encodeTurkishForPDF(`Toplam Öğrenci: ${instructorMatches.length}`), 20, currentY);
      currentY += 15;

      // Öğrenci tablosu verilerini hazırla
      const tableData = instructorMatches.map((match, index) => {
        const student = students.find(s => s.id === match.studentId);
        if (!student) return null;

        return [
          (index + 1).toString(),
          encodeTurkishForPDF(`${student.name} ${student.surname}`),
          student.gender === 'male' ? 'E' : 'K',
          student.phone || encodeTurkishForPDF('Belirtilmemiş'),
          new Date().toLocaleDateString('tr-TR')
        ];
      }).filter(row => row !== null);

      // Tablo oluştur
      autoTable(doc, {
        startY: currentY,
        head: [[
          encodeTurkishForPDF('Sıra'), 
          encodeTurkishForPDF('Öğrenci Adı'), 
          'Cinsiyet', 
          'Telefon', 
          'Tarih'
        ]],
        body: tableData,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          font: 'helvetica'
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 60 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 40 },
          4: { cellWidth: 25, halign: 'center' }
        },
        margin: { left: 20, right: 20 },
        didDrawPage: () => {
          // Sayfa numarası
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(
            `Sayfa ${pageNumber}`,
            doc.internal.pageSize.getWidth() - 30,
            doc.internal.pageSize.getHeight() - 10
          );
        }
      });
    });

    // PDF'i kaydet
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`Eşleştirme_Listesi_${licenseType}_${timestamp}.pdf`);
  };

  return (
    <Button
      variant="contained"
      startIcon={<PdfIcon />}
      onClick={generatePDF}
      sx={{
        bgcolor: '#d32f2f',
        '&:hover': {
          bgcolor: '#b71c1c'
        }
      }}
    >
      PDF İndir
    </Button>
  );
};

export default PDFExport;