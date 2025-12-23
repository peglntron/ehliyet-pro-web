import React from 'react';
import { Grid as MuiGrid, GridProps as MuiGridProps } from '@mui/material';
import { GridSize } from '@mui/material/Grid';

// Grid bileşeni için ek prop tiplerini tanımla
interface ExtendedGridProps extends MuiGridProps {
  size?: GridSize;
}

// MUI Grid'in üzerine size prop'unu destekleyen wrapper component
const Grid: React.FC<ExtendedGridProps> = ({ children, size, ...props }) => {
  // size prop'unu xs, sm, md, lg, xl olarak ele al
  const modifiedProps = size !== undefined ? { ...props, xs: size } : props;
  
  return <MuiGrid {...modifiedProps}>{children}</MuiGrid>;
};

export default Grid;
