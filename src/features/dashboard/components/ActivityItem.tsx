import React from 'react';
import { ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Chip, Divider } from '@mui/material';
import type { ElementType } from 'react';

interface ActivityItemProps {
  title: string;
  time: string;
  iconComponent: ElementType;
  color: string;
  isNew?: boolean;
  isLastItem?: boolean;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ 
  title, 
  time, 
  iconComponent: IconComponent, 
  color, 
  isNew = false,
  isLastItem = false
}) => {
  return (
    <>
      <ListItem 
        sx={{ 
          px: 3, 
          py: 2,
          transition: 'background-color 0.2s',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.02)'
          }
        }}
      >
        <ListItemAvatar>
          <Avatar 
            sx={{ 
              bgcolor: `${color}15`, 
              color: color
            }}
          >
            <IconComponent />
          </Avatar>
        </ListItemAvatar>
        <ListItemText 
          primary={
            <Typography variant="body1" fontWeight={600} color="text.primary">
              {title}
            </Typography>
          }
          secondary={
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {time}
            </Typography>
          }
        />
        {isNew && (
          <Chip 
            label="Yeni" 
            size="small" 
            color="primary" 
            variant="outlined" 
            sx={{ fontWeight: 500 }} 
          />
        )}
      </ListItem>
      {!isLastItem && <Divider component="li" />}
    </>
  );
};

export default ActivityItem;
