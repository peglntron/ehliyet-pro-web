#!/bin/bash

# 1. Node_modules klasörünü temizleyelim
echo "Node modules klasörünü temizleme..."
rm -rf node_modules

# 2. package-lock.json dosyasını sıfırlayalım
echo "Package-lock.json dosyasını sıfırlama..."
rm -f package-lock.json

# 3. npm cache'i temizleyelim
echo "NPM cache temizleme..."
npm cache clean --force

# 4. Bağımlılıkları yeniden yükleyelim
echo "Bağımlılıkları yeniden yükleme..."
npm install

# 5. Dev sunucusunu başlatalım
echo "Vite geliştirme sunucusunu başlatma..."
npm run dev
