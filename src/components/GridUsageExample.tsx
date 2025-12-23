import React from 'react';

// İki farklı import yöntemi:
// 1. Doğrudan belirli bileşeni import etme - Tree shaking için daha iyi
import Grid from '@mui/material/Grid';

// 2. Tüm modülden import etme - Daha fazla kod bundle'a eklenir
// import { Grid } from '@mui/material';

/**
 * İki import yöntemi arasındaki farklar:
 * 
 * 1. Doğrudan import (import Grid from '@mui/material/Grid'):
 *    - Sadece Grid bileşenini içeri aktarır
 *    - Bundle boyutunu küçültür (tree shaking için daha iyi)
 *    - Webpack ve benzeri bundler'lar kullanılmadığında daha hızlı yükleme sağlar
 * 
 * 2. Toplu import (import { Grid } from '@mui/material'):
 *    - @mui/material'dan tüm bileşenleri import eder ve sonra destructuring ile Grid'i çıkarır
 *    - Daha büyük bundle boyutu oluşturabilir
 *    - Birçok MUI bileşeni kullanıyorsanız kod tekrarını azaltır
 */

const GridUsageExample: React.FC = () => {
  return (
    <div>
      {/* Grid Kullanım Örneği */}
      
      {/* 1. Container Grid - satır düzeni, öğeler arası 3 birim boşluk */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 2. Grid item'ları - responsive boyutlandırma */}
        <Grid item xs={12} md={6}>
          {/* Küçük ekranlarda 12 birim (tam genişlik), orta ve üzeri ekranlarda 6 birim (yarım genişlik) */}
          <div>Sol içerik</div>
        </Grid>
        
        <Grid item xs={12} md={6}>
          {/* Küçük ekranlarda 12 birim (tam genişlik), orta ve üzeri ekranlarda 6 birim (yarım genişlik) */}
          <div>Sağ içerik</div>
        </Grid>
      </Grid>
      
      {/* Yanlış Kullanım - size prop'u geçersiz */}
      {/* <Grid container spacing={3}>
        <Grid size={6}> <- HATALI! Geçerli bir prop değil
          <div>İçerik</div>
        </Grid>
      </Grid> */}
      
      {/* Doğru kullanım: responsive breakpoint prop'ları */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
          {/* Farklı ekran boyutlarında farklı genişlikler */}
          <div>Responsive öğe</div>
        </Grid>
      </Grid>
      
      {/* Diğer özellikler */}
      <Grid 
        container 
        spacing={2} 
        direction="row" // Satır düzeni (varsayılan)
        justifyContent="center" // Öğeleri yatayda ortala
        alignItems="flex-start" // Öğeleri dikeyde üste hizala
      >
        <Grid item xs="auto"> {/* "auto" genişlik - içeriğe göre */}
          <div>Otomatik genişlik</div>
        </Grid>
        
        <Grid item xs={6}> {/* 6 birim genişlik (toplam 12 üzerinden) */}
          <div>6 birim genişlik</div>
        </Grid>
      </Grid>
      
      {/* Daha fazla örnek */}
      <Grid 
        container 
        rowSpacing={3} // Satırlar arası boşluk
        columnSpacing={2} // Sütunlar arası boşluk
        wrap="nowrap" // Sığmayan öğeler taşmasın, kaydırma çubuğu oluşsun
      >
        {/* İçerik */}
      </Grid>
    </div>
  );
};

export default GridUsageExample;
