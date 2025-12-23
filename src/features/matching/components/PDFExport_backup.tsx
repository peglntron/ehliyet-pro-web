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
    
    // Türkçe karakterler için font ayarlaması
    doc.setFont('helvetica');

    let pageNumber = 1;
    let currentY = 20;

    // Her eğitmen için ayrı sayfa oluştur
    const instructorGroups = new Map<string, MatchingResult[]>();
    matches.forEach(match => {
      if (!instructorGroups.has(match.instructorId)) {
        instructorGroups.set(match.instructorId, []);
      }
      instructorGroups.get(match.instructorId)!.push(match);
    });

    let isFirstPage = true;

    instructorGroups.forEach((instructorMatches, instructorId) => {
      // İlk sayfadan sonra yeni sayfa ekle
      if (!isFirstPage) {
        doc.addPage();
        pageNumber++;
        currentY = 20;
      }
      isFirstPage = false;

      // Eğitmen bilgisi
      const instructor = instructors.find(i => i.id === instructorId);
      if (!instructor) return;

      // Sayfa başlığı
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Öğrenci-Eğitmen Eşleştirme Listesi', 20, currentY);
      
      currentY += 10;
      
      // Tarih ve ehliyet türü
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 20, currentY);
      doc.text(`Ehliyet Türü: ${licenseType} Sınıfı`, 120, currentY);
      
      currentY += 15;
    matches.forEach(match => {
      const instructorId = match.instructorId;
      if (!instructorGroups.has(instructorId)) {
        instructorGroups.set(instructorId, []);
      }
      instructorGroups.get(instructorId)!.push(match);
    });

    let currentY = 60;
    let pageNumber = 1;

    // Her eğitmen için sayfa/bölüm oluştur
    Array.from(instructorGroups.entries()).forEach(([instructorId, studentMatches], index) => {
      // Sayfa sonu kontrolü
      if (currentY > 200) {
        doc.addPage();
        currentY = 20;
        pageNumber++;
      }

      const instructor = instructors.find(i => i.id === instructorId);
      const instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Bilinmeyen Eğitmen';
      
      // Eğitmen başlığı
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${instructorName} (${studentMatches.length} Öğrenci)`, 20, currentY);
      
      currentY += 5;
      
      // Araç bilgisi
      if (instructor?.vehiclePlate && instructor?.vehicleModel) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text(`Araç: ${instructor.vehiclePlate} - ${instructor.vehicleModel}`, 20, currentY);
        currentY += 5;
      }
      
      // Telefon numarası
      if (instructor?.phone) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text(`Telefon: ${instructor.phone}`, 20, currentY);
        currentY += 5;
      }

      currentY += 5;

      // Öğrenci tablosu verilerini hazırla
      const tableData = studentMatches.map((match, idx) => {
        const student = students.find(s => s.id === match.studentId);
        return [
          (idx + 1).toString(),
          match.studentName,
          student?.phone || 'Belirtilmemiş',
          match.studentGender === 'male' ? 'Erkek' : 'Kadın',
          match.licenseType
        ];
      });

      // Tablo oluştur
      autoTable(doc, {
        startY: currentY,
        head: [['#', 'Öğrenci Adı Soyadı', 'Telefon', 'Cinsiyet', 'Ehliyet']],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 2,
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
          0: { cellWidth: 10 },
          1: { cellWidth: 50 },
          2: { cellWidth: 35 },
          3: { cellWidth: 20 },
          4: { cellWidth: 15 }
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

      // autoTable sonrası pozisyonu al
      currentY = doc.lastAutoTable.finalY + 15;

      // Ayırıcı çizgi (son eğitmen değilse)
      if (index < instructorGroups.size - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(20, currentY, doc.internal.pageSize.getWidth() - 20, currentY);
        currentY += 10;
      }
    });

    // PDF'i indir
    const fileName = `Öğrenci_Eğitmen_Listesi_${licenseType}_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.pdf`;
    doc.save(fileName);
  };

  return (
    <Button
      variant="outlined"
      color="error"
      startIcon={<PdfIcon />}
      onClick={generatePDF}
      disabled={matches.length === 0}
      sx={{ 
        borderColor: 'error.main',
        '&:hover': {
          borderColor: 'error.dark',
          bgcolor: 'error.50'
        }
      }}
    >
      PDF Çıktısı Al
    </Button>
  );
};

export default PDFExport;