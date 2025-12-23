import React from 'react';
import { Grid } from '@mui/material';

const GridExample: React.FC = () => {
  return (
    <Grid container spacing={2}>
      {/* Size prop kullanımı */}
      <Grid item size={6}> {/* 6/12 genişliğinde bir öğe (yarım genişlik) */}
        <div>Sol taraf</div>
      </Grid>
      
      <Grid item size={6}> {/* 6/12 genişliğinde bir öğe (yarım genişlik) */}
        <div>Sağ taraf</div>
      </Grid>
      
      {/* Responsive kullanım için (daha yaygın) */}
      <Grid item xs={12} sm={6} md={4}>
        <div>Responsive öğe</div>
      </Grid>
    </Grid>
  );
};

export default GridExample;
