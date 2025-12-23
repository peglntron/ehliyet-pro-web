import React, { useState } from 'react';
import { Popover, Box, ButtonBase, Tooltip } from '@mui/material';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';

interface ColorMenuProps {
  onColorSelect: (color: string) => void;
}

const colors = [
  { value: '#1976d2', label: 'Mavi' },
  { value: '#d32f2f', label: 'Kırmızı' },
  { value: '#388e3c', label: 'Yeşil' },
  { value: '#f57c00', label: 'Turuncu' },
  { value: '#7b1fa2', label: 'Mor' },
  { value: '#0097a7', label: 'Turkuaz' },
  { value: '#fbc02d', label: 'Sarı' },
  { value: '#5d4037', label: 'Kahverengi' },
  { value: '#455a64', label: 'Gri' },
  { value: '#212121', label: 'Siyah' },
];

const ColorMenu: React.FC<ColorMenuProps> = ({ onColorSelect }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#1976d2');

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onColorSelect(color);
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Metin Rengi">
        <ButtonBase
          onClick={handleClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <FormatColorTextIcon sx={{ color: selectedColor }} />
        </ButtonBase>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ 
          p: 1.5, 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: 0.5,
          width: 180
        }}>
          {colors.map((color) => (
            <Tooltip key={color.value} title={color.label}>
              <ButtonBase
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: color.value,
                  border: '2px solid',
                  borderColor: selectedColor === color.value ? 'white' : 'transparent',
                  boxShadow: selectedColor === color.value ? 
                    `0 0 0 2px ${color.value}` : 'none',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
                onClick={() => handleColorSelect(color.value)}
              />
            </Tooltip>
          ))}
        </Box>
      </Popover>
    </>
  );
};

export default ColorMenu;
