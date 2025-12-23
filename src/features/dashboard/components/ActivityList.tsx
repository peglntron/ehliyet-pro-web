import React from 'react';
import { Card, Box, Typography, Button, Divider, List } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ActivityItem from './ActivityItem';
import type { ActivityItem as ActivityItemType } from '../types/types';

interface ActivityListProps {
  activities: ActivityItemType[];
  title: string;
  subtitle?: string;
}

const ActivityList: React.FC<ActivityListProps> = ({ activities, title, subtitle }) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/live-activities');
  };

  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 3,
        boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: 'auto', // Yükseklik içeriğe göre otomatik ayarlanacak
      }}
    >
      <Box p={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={handleViewAll}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            px: 2
          }}
        >
          Tümünü Gör
        </Button>
      </Box>
      
      <Divider />
      
      {/* overflow özelliğini kaldırdık, böylece içerik taşmayacak ve scroll oluşmayacak */}
      <Box>
        <List sx={{ p: 0 }}>
          {activities.map((activity, index) => (
            <ActivityItem 
              key={activity.id}
              title={activity.title}
              time={activity.time}
              iconComponent={activity.iconComponent}
              color={activity.color}
              isNew={activity.isNew}
              isLastItem={index === activities.length - 1}
            />
          ))}
        </List>
      </Box>
    </Card>
  );
};

export default ActivityList;

