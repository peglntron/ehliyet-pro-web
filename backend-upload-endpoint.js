// Backend için Logo Upload Endpoint'i
// Bu kod backend projesine eklenmelidir

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload klasörünü oluştur
const uploadDir = path.join(__dirname, 'uploads', 'logos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const companyId = req.body.companyId;
    const ext = path.extname(file.originalname);
    const filename = `company-${companyId}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // Sadece image dosyalarını kabul et
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload endpoint'i
app.post('/api/company/upload-logo', 
  authenticateToken, // JWT auth middleware
  upload.single('logo'), 
  async (req, res) => {
    try {
      const { companyId } = req.body;
      const uploadedFile = req.file;

      if (!uploadedFile) {
        return res.status(400).json({
          success: false,
          message: 'Logo dosyası yüklenmedi'
        });
      }

      // Logo URL'ini oluştur
      const logoUrl = `/uploads/logos/${uploadedFile.filename}`;

      // Veritabanında company logo'sunu güncelle
      await prisma.company.update({
        where: { id: companyId },
        data: { logo: logoUrl }
      });

      // Eski logo dosyasını sil (opsiyonel)
      const existingCompany = await prisma.company.findUnique({
        where: { id: companyId },
        select: { logo: true }
      });

      if (existingCompany?.logo && existingCompany.logo !== logoUrl) {
        const oldFilePath = path.join(__dirname, existingCompany.logo);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      res.json({
        success: true,
        data: {
          logoUrl: logoUrl,
          filename: uploadedFile.filename,
          size: uploadedFile.size
        },
        message: 'Logo başarıyla yüklendi'
      });

    } catch (error) {
      console.error('Logo upload error:', error);
      
      // Hata durumunda yüklenen dosyayı sil
      if (req.file) {
        const filePath = path.join(uploadDir, req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Logo yükleme sırasında hata oluştu'
      });
    }
  }
);

// Static files servis et
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

module.exports = { upload };

// Package.json'a eklenecek dependencies:
/*
{
  "dependencies": {
    "multer": "^1.4.5-lts.1"
  }
}
*/

// Kullanım örneği:
/*
1. npm install multer
2. Bu kodu backend app.js veya routes dosyasına ekle
3. uploads klasörünün write permission'ı olduğundan emin ol
4. Frontend'den POST /api/company/upload-logo endpoint'ine FormData gönder
*/