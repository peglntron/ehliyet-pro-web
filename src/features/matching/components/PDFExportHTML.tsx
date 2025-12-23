import React from 'react';
import { Button } from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { MatchingResult } from '../types/types';
import type { Student } from '../../students/types/types';
import type { Instructor } from '../../instructors/types/types';

interface PDFExportHTMLProps {
  matches: MatchingResult[];
  students: Student[];
  instructors: Instructor[];
  licenseType: string;
}

const PDFExportHTML: React.FC<PDFExportHTMLProps> = ({
  matches,
  students,
  instructors,
  licenseType
}) => {

  const generatePDF = async () => {
    if (matches.length === 0) {
      alert('PDF oluşturmak için veri bulunamadı!');
      return;
    }

    try {
      // Tarih bilgileri
      const currentDate = new Date();
      const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      const monthName = monthNames[currentDate.getMonth()];
      const year = currentDate.getFullYear();

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 genişlik
      const imgHeight = 297; // A4 yükseklik
      
      let isFirstPage = true;

      // Her eğitmen için ayrı sayfa oluştur
      for (const [instructorId, instructorMatches] of instructorGroups.entries()) {
        const instructor = instructors.find(i => i.id === instructorId);
        if (!instructor) continue;

        // İlk sayfadan sonra yeni sayfa ekle
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        // Bu eğitmen için özel HTML içerik oluştur
        const instructorPageElement = document.createElement('div');
        instructorPageElement.style.width = '794px';
        instructorPageElement.style.backgroundColor = 'white';
        instructorPageElement.style.padding = '20px';
        instructorPageElement.style.fontFamily = 'Arial, sans-serif';
        instructorPageElement.style.position = 'absolute';
        instructorPageElement.style.left = '-9999px';
        instructorPageElement.style.top = '-9999px';

        // HTML içeriği oluştur
        instructorPageElement.innerHTML = `
          <div style="margin-bottom: 20px;">
            <h2 style="text-align: center; font-weight: bold; margin-bottom: 20px; font-size: 24px;">
              Eşleştirme: ${monthName} ${year} ${licenseType} Sınıfı Eşleştirmesi
            </h2>
            <div style="margin-bottom: 20px;">
              <h3 style="font-weight: bold; margin-bottom: 10px; font-size: 20px;">
                Eğitmen: ${instructor.firstName} ${instructor.lastName}
              </h3>
              ${instructor.phone ? `<p>Telefon: ${instructor.phone}</p>` : ''}
              ${instructor.vehiclePlate && instructor.vehicleModel ? 
                `<p>Araç: ${instructor.vehiclePlate} - ${instructor.vehicleModel}</p>` : ''}
              <p>Toplam Öğrenci: ${instructorMatches.length}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
              <thead>
                <tr style="background-color: #2980b9;">
                  <th style="color: white; font-weight: bold; border: 1px solid #ddd; padding: 8px; text-align: center;">Sıra</th>
                  <th style="color: white; font-weight: bold; border: 1px solid #ddd; padding: 8px;">Öğrenci Adı</th>
                  <th style="color: white; font-weight: bold; border: 1px solid #ddd; padding: 8px; text-align: center;">Cinsiyet</th>
                  <th style="color: white; font-weight: bold; border: 1px solid #ddd; padding: 8px;">Telefon</th>
                  <th style="color: white; font-weight: bold; border: 1px solid #ddd; padding: 8px; text-align: center;">Tarih</th>
                </tr>
              </thead>
              <tbody>
                ${instructorMatches.map((match, index) => {
                  const student = students.find(s => s.id === match.studentId);
                  if (!student) return '';
                  
                  return `
                    <tr style="background-color: ${index % 2 === 0 ? '#f5f5f5' : 'white'};">
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">${student.name} ${student.surname}</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${student.gender === 'male' ? 'E' : 'K'}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">${student.phone || 'Belirtilmemiş'}</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${new Date().toLocaleDateString('tr-TR')}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;

        // DOM'a geçici olarak ekle
        document.body.appendChild(instructorPageElement);

        // Canvas'a çevir
        const canvas = await html2canvas(instructorPageElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794,
          height: 1123 // A4 oranında yükseklik
        });

        // Canvas'ı PDF sayfasına ekle
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        // Geçici elementi kaldır
        document.body.removeChild(instructorPageElement);

        // Kısa bir bekleme (renderı tamamlamak için)
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // PDF'i kaydet
      pdf.save(`Eşleştirme_${monthName}_${year}_${licenseType}.pdf`);
      
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken hata oluştu!');
    }
  };

  // Eğitmen bazında gruplama
  const instructorGroups = new Map<string, MatchingResult[]>();
  matches.forEach(match => {
    if (!instructorGroups.has(match.instructorId)) {
      instructorGroups.set(match.instructorId, []);
    }
    instructorGroups.get(match.instructorId)!.push(match);
  });



  return (
    <>
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


    </>
  );
};

export default PDFExportHTML;