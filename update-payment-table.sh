#!/bin/bash

# Tablo kolon genişliklerini güncelle
# Tarih: 12% -> 10%
# Tutar: 16% -> 14%
# Ödeme Yöntemi: 14% -> 12%
# Tip: 12% (aynı)
# Açıklama: 20% -> 22%
# Durum: 10% (aynı)
# İşlem: 10% -> 14%

FILE="src/features/students/components/detail/StudentPaymentInfoCard.tsx"

# Başlıklar
sed -i '' "s/width: '12%' }}>Tarih/width: '10%' }}>Tarih/g" "$FILE"
sed -i '' "s/width: '16%' }}>Tutar/width: '14%' }}>Tutar/g" "$FILE"
sed -i '' "s/width: '14%' }}>Ödeme Yöntemi/width: '12%' }}>Ödeme Yöntemi/g" "$FILE"
sed -i '' "s/width: '20%' }}>Açıklama/width: '22%' }}>Açıklama/g" "$FILE"
sed -i '' "s/width: '10%' }}>İşlem/width: '14%' }}>İşlem/g" "$FILE"

# TableCell genişlikleri
sed -i '' "s/width: '12%' }}>$/width: '10%' }}>/g" "$FILE"
sed -i '' "s/width: '16%' }}>$/width: '14%' }}>/g" "$FILE"
sed -i '' "s/width: '14%' }}>$/width: '12%' }}>/g" "$FILE"
sed -i '' "s/width: '20%' }}>$/width: '22%' }}>/g" "$FILE"
sed -i '' "s/width: '10%' }}>$/width: '14%' }}>/g" "$FILE"

# pl: 6 olan satırlar
sed -i '' "s/pl: 6, width: '12%'/pl: 6, width: '10%'/g" "$FILE"

echo "Dosya güncellendi!"
