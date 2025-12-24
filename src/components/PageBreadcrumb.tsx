import React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { Box, Chip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';

interface PageBreadcrumbProps {
  className?: string;
  skipHome?: boolean;
}

// Breadcrumb başlıklarını düzgünce formatla
const formatTitle = (title: string): string => {
  return title
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Doğrudan erişilebilen sayfalar, diğerleri ana sayfaya yönlendirilecek
const validRoutes = [
  '/questions',
  '/lessons',
  '/units',
  '/traffic-signs',
  '/students',
  '/late-payments',
  '/notified'
];

const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({ className, skipHome = false }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAuth();
  const { permissions } = usePermissions();

  // Kullanıcının rolüne göre home URL'ini belirle
  const getHomeUrl = () => {
    if (!user) return '/';
    
    // ADMIN → Admin Dashboard
    if (user.role === 'ADMIN') return '/admin';
    
    // INSTRUCTOR → Eğitmen Dashboard
    if (user.role === 'INSTRUCTOR') return '/instructor';
    
    // COMPANY_ADMIN → İşletme Paneli (Dashboard)
    if (user.role === 'COMPANY_ADMIN') return '/company/dashboard';
    
    // COMPANY_USER → Yetki varsa İşletme Paneli, yoksa İşletme Bilgileri
    if (user.role === 'COMPANY_USER') {
      return permissions.canViewDashboard ? '/company/dashboard' : '/company/info';
    }
    
    return '/';
  };

  const homeUrl = getHomeUrl();

  const crumbs = pathname
    .split('/')
    .filter(Boolean)
    .reduce(
      (acc: { title: string; url: string }[], part, index, array) => {
        const url = `/${array.slice(0, index + 1).join('/')}`;
        acc.push({ title: formatTitle(part), url });
        return acc;
      },
      skipHome ? [] : [{ title: 'Ana Sayfa', url: homeUrl }]
    );

  return (
    <Box 
      className={className} 
      sx={{ 
        display: 'flex',
        alignItems: 'center',
        py: 0.5
      }}
    >
      <Breadcrumbs 
        separator={
          <NavigateNextIcon 
            fontSize="small" 
            sx={{ 
              color: 'text.secondary',
              opacity: 0.8
            }} 
          />
        } 
        aria-label="breadcrumb"
        sx={{ 
          '& .MuiBreadcrumbs-ol': {
            alignItems: 'center'
          }
        }}
      >
        {crumbs.map((item, idx) =>
          idx === crumbs.length - 1 ? (
            <Chip
              key={idx}
              label={item.title}
              size="small"
              sx={{
                fontWeight: 600,
                bgcolor: 'primary.main',
                color: 'white',
                fontSize: '0.8rem',
                height: 24,
                '& .MuiChip-label': {
                  px: 1.2
                }
              }}
            />
          ) : idx === 0 && item.title === 'Ana Sayfa' ? (
            <Link
              key={idx}
              component={RouterLink}
              to={item.url}
              underline="none"
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
                fontSize: '0.85rem',
                fontWeight: 500,
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
            </Link>
          ) : (
            <Link
              key={idx}
              component={RouterLink}
              to={validRoutes.includes(item.url) ? item.url : '/'}  // Eğer geçerli bir rota değilse ana sayfaya yönlendir
              underline="none"
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.85rem',
                fontWeight: 500,
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              {item.title}
            </Link>
          )
        )}
      </Breadcrumbs>
    </Box>
  );
};

export default PageBreadcrumb;
