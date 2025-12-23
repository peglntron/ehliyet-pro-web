import type { ElementType } from 'react';

export interface StatItem {
  id: string;
  title: string;
  value: number | string;
  iconComponent: ElementType; // İkon component tipini değiştirdik
  color: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface ActivityItem {
  id: string;
  title: string;
  time: string;
  iconComponent: ElementType; // İkon component tipini değiştirdik
  color: string;
  isNew?: boolean;
}
