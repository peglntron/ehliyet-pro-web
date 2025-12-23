import { createTheme } from '@mui/material/styles';

// Özel tema oluşturma
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      lighter: '#e3f2fd', // Çok açık mavi
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#fff',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    info: {
      main: '#0288d1',
      light: '#29b6f6',
      dark: '#01579b',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          '&:focus': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
          '&:focus-visible': {
            outline: '2px solid #3b82f6',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
          '&:focus-visible': {
            outline: '2px solid #3b82f6',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:focus': {
            outline: 'none !important',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
          '&:focus-visible': {
            outline: '2px solid #3b82f6',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          '&:focus': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
          '&:focus-visible': {
            outline: '2px solid #3b82f6',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            outline: 'none !important',
            boxShadow: 'none !important',
            '&:focus': {
              outline: 'none !important',
              boxShadow: 'none !important',
            },
            '&:focus-within': {
              outline: 'none !important',
              boxShadow: 'none !important',
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '1px !important',
                borderColor: '#1976d2 !important',
              },
            },
            '& input': {
              outline: 'none !important',
              boxShadow: 'none !important',
              '&:focus': {
                outline: 'none !important',
                boxShadow: 'none !important',
              },
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          outline: 'none !important',
          boxShadow: 'none !important',
          '&:focus': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
          '&:focus-visible': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
          '&.Mui-focused': {
            outline: 'none !important',
            boxShadow: 'none !important',
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: '1px !important',
              borderColor: '#1976d2 !important',
            },
          },
          '&:hover:not(.Mui-disabled):not(.Mui-error)': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0, 0, 0, 0.87) !important',
              borderWidth: '1px !important',
            },
          },
        },
        notchedOutline: {
          borderWidth: '1px !important',
          borderColor: 'rgba(0, 0, 0, 0.23) !important',
        },
        input: {
          outline: 'none !important',
          boxShadow: 'none !important',
          '&:focus': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
        },
      },
    },
  },
});

export default theme;