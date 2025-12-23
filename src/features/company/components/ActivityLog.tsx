import React from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemAvatar,
  ListItemText, Avatar, Divider
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Payment as PaymentIcon,
  School as SchoolIcon,
  SupervisorAccount as SupervisorAccountIcon
} from '@mui/icons-material';

interface Activity {
  id: string;
  type: 'user_add' | 'user_edit' | 'payment' | 'course' | 'admin';
  text: string;
  date: string;
  user?: string;
}

interface ActivityLogProps {
  companyId: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ companyId }) => {
  // Örnek aktiviteler - gerçek uygulamada API'den gelecek
  const activities: Activity[] = [
    {
      id: '1',
      type: 'user_add',
      text: 'Yeni kurum yöneticisi eklendi',
      date: '10 dakika önce',
      user: 'Ahmet Yılmaz'
    },
    {
      id: '2',
      type: 'payment',
      text: 'Ödeme alındı',
      date: '1 saat önce',
      user: 'Sistem'
    },
    {
      id: '3',
      type: 'user_edit',
      text: 'Kullanıcı bilgileri güncellendi',
      date: '3 saat önce',
      user: 'Mehmet Kaya'
    },
    {
      id: '4',
      type: 'course',
      text: 'Yeni kurs oluşturuldu',
      date: '1 gün önce',
      user: 'Sistem'
    },
    {
      id: '5',
      type: 'admin',
      text: 'Yönetici hesabı aktifleştirildi',
      date: '2 gün önce',
      user: 'Sistem'
    }
  ];

  // Aktivite tipine göre ikon belirleme
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_add':
        return <PersonAddIcon />;
      case 'user_edit':
        return <EditIcon />;
      case 'payment':
        return <PaymentIcon />;
      case 'course':
        return <SchoolIcon />;
      case 'admin':
        return <SupervisorAccountIcon />;
      default:
        return <EditIcon />;
    }
  };

  // Aktivite tipine göre renk belirleme
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_add':
        return '#1976d2'; // Primary blue
      case 'user_edit':
        return '#9c27b0'; // Purple
      case 'payment':
        return '#2e7d32'; // Success green
      case 'course':
        return '#ed6c02'; // Warning orange
      case 'admin':
        return '#d32f2f'; // Error red
      default:
        return '#757575'; // Grey
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        mb: 3
      }}
    >
      <Typography variant="h6" fontWeight={600} mb={3}>
        Son Aktiviteler
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      {activities.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Henüz aktivite kaydı bulunmamaktadır
          </Typography>
        </Box>
      ) : (
        <List sx={{ 
          width: '100%', 
          bgcolor: 'background.paper',
          p: 0
        }}>
          {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getActivityColor(activity.type) }}>
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" fontWeight={600}>
                      {activity.text}
                    </Typography>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {activity.user}
                      </Typography>
                      {" — "}
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {activity.date}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
              {index < activities.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default ActivityLog;
