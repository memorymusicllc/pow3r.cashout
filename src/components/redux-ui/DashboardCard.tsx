/**
 * Redux UI DashboardCard Component
 * Basic Outline Theme - Dashboard card wrapper
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

export interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const DashboardCard = React.forwardRef<HTMLDivElement, DashboardCardProps>(
  ({ className, title, description, children, ...props }, ref) => {
    // Filter out incompatible props
    const { color, ...cardProps } = props as any;
    return (
    <Card ref={ref} className={cn('h-full', className)} {...cardProps}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
    );
  }
);

DashboardCard.displayName = 'DashboardCard';

// Add metadata for ComponentLibrary
(DashboardCard as any).metadata = {
  name: 'DashboardCard',
  label: 'Dashboard Card',
  version: '1.0.0',
  date: '2025-10-09',
  description: 'A card component for dashboard layouts with transparent background and outline borders'
};
