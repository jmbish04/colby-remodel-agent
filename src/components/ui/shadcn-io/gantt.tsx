'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Types for the Gantt chart
export interface GanttFeature {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status?: {
    id: string;
    name: string;
    color: string;
  };
  owner?: {
    id: string;
    name: string;
    image?: string;
  };
  group?: {
    id: string;
    name: string;
  };
}

export interface GanttMarker {
  id: string;
  date: Date;
  label: string;
  className?: string;
}

interface GanttContextProps {
  features: GanttFeature[];
  markers: GanttMarker[];
  range: 'daily' | 'weekly' | 'monthly';
  zoom: number;
  onAddItem?: (date: Date) => void;
}

const GanttContext = createContext<GanttContextProps>({
  features: [],
  markers: [],
  range: 'monthly',
  zoom: 100,
});

// Provider component
export interface GanttProviderProps {
  children: ReactNode;
  className?: string;
  range?: 'daily' | 'weekly' | 'monthly';
  zoom?: number;
  onAddItem?: (date: Date) => void;
}

export const GanttProvider = ({ 
  children, 
  className, 
  range = 'monthly', 
  zoom = 100,
  onAddItem
}: GanttProviderProps) => {
  const [features] = useState<GanttFeature[]>([]);
  const [markers] = useState<GanttMarker[]>([]);

  return (
    <GanttContext.Provider value={{ features, markers, range, zoom, onAddItem }}>
      <div className={cn('flex h-full border rounded-lg overflow-hidden', className)}>
        {children}
      </div>
    </GanttContext.Provider>
  );
};

// Sidebar components
export interface GanttSidebarProps {
  children: ReactNode;
  className?: string;
}

export const GanttSidebar = ({ children, className }: GanttSidebarProps) => {
  return (
    <div className={cn('w-80 border-r bg-muted/30', className)}>
      <ScrollArea className="h-full">
        {children}
      </ScrollArea>
    </div>
  );
};

export interface GanttSidebarGroupProps {
  name: string;
  children: ReactNode;
}

export const GanttSidebarGroup = ({ name, children }: GanttSidebarGroupProps) => {
  return (
    <div className="p-2">
      <h3 className="font-semibold text-sm mb-2 px-2">{name}</h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};

export interface GanttSidebarItemProps {
  feature: GanttFeature;
  onSelectItem?: (id: string) => void;
}

export const GanttSidebarItem = ({ feature, onSelectItem }: GanttSidebarItemProps) => {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start h-auto p-2"
      onClick={() => onSelectItem?.(feature.id)}
    >
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 text-left">
          <div className="text-sm font-medium">{feature.name}</div>
          <div className="text-xs text-muted-foreground">
            {format(feature.startAt, 'MMM d')} - {format(feature.endAt, 'MMM d')}
          </div>
        </div>
        {feature.owner && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={feature.owner.image} />
            <AvatarFallback>
              {feature.owner.name?.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </Button>
  );
};

// Timeline components
export interface GanttTimelineProps {
  children: ReactNode;
  className?: string;
}

export const GanttTimeline = ({ children, className }: GanttTimelineProps) => {
  return (
    <div className={cn('flex-1 flex flex-col', className)}>
      {children}
    </div>
  );
};

export const GanttHeader = () => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="border-b bg-background">
      <div className="flex">
        <div className="w-80 border-r p-2 text-sm font-medium">
          {format(now, 'MMMM yyyy')}
        </div>
        <ScrollArea className="flex-1">
          <div className="flex">
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  'min-w-8 p-1 text-center text-xs border-r',
                  isToday(day) && 'bg-primary text-primary-foreground'
                )}
              >
                {format(day, 'd')}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

// Feature list components
export interface GanttFeatureListProps {
  children: ReactNode;
}

export const GanttFeatureList = ({ children }: GanttFeatureListProps) => {
  return (
    <div className="flex-1 relative">
      {children}
    </div>
  );
};

export interface GanttFeatureListGroupProps {
  children: ReactNode;
}

export const GanttFeatureListGroup = ({ children }: GanttFeatureListGroupProps) => {
  return (
    <div className="border-b">
      {children}
    </div>
  );
};

// Feature item component
export interface GanttFeatureItemProps extends GanttFeature {
  children?: ReactNode;
  onMove?: (id: string, startAt: Date, endAt: Date | null) => void;
}

export const GanttFeatureItem = ({ 
  id, 
  name, 
  startAt, 
  endAt, 
  status, 
  children,
  onMove 
}: GanttFeatureItemProps) => {
  // Calculate position and width based on dates
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  // Simple positioning calculation (would need more sophisticated logic in real implementation)
  const dayWidth = 32; // Approximate width per day
  const startOffset = Math.max(0, Math.floor((startAt.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)));
  const duration = Math.max(1, Math.floor((endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60 * 24)));
  
  return (
    <div className="relative h-12 flex items-center">
      <div className="w-80 border-r p-2 text-sm truncate">
        {name}
      </div>
      <div className="flex-1 relative">
        <div
          className={cn(
            'absolute h-6 rounded px-2 flex items-center gap-1 min-w-16',
            'bg-primary text-primary-foreground text-xs cursor-pointer'
          )}
          style={{
            left: `${startOffset * dayWidth}px`,
            width: `${duration * dayWidth}px`,
            backgroundColor: status?.color || undefined,
          }}
        >
          {children || (
            <span className="truncate">{name}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Marker components
export interface GanttMarkerProps extends GanttMarker {
  onRemove?: (id: string) => void;
}

export const GanttMarker = ({ id, date, label, className, onRemove }: GanttMarkerProps) => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const dayWidth = 32;
  const offset = Math.floor((date.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div
      className="absolute top-0 bottom-0 w-px bg-orange-500 z-10"
      style={{ left: `${320 + offset * dayWidth}px` }}
    >
      <div className={cn('absolute top-2 left-1 text-xs p-1 rounded', className)}>
        {label}
      </div>
    </div>
  );
};

// Today marker
export const GanttToday = () => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const dayWidth = 32;
  const offset = Math.floor((now.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)));
  
  return (
    <div
      className="absolute top-0 bottom-0 w-px bg-red-500 z-20"
      style={{ left: `${320 + offset * dayWidth}px` }}
    >
      <div className="absolute top-1 left-1 text-xs bg-red-500 text-white px-1 rounded">
        Today
      </div>
    </div>
  );
};

// Create marker trigger
export interface GanttCreateMarkerTriggerProps {
  onCreateMarker?: (date: Date) => void;
}

export const GanttCreateMarkerTrigger = ({ onCreateMarker }: GanttCreateMarkerTriggerProps) => {
  const handleClick = (event: React.MouseEvent) => {
    // Calculate date from click position (simplified)
    const now = new Date();
    onCreateMarker?.(now);
  };

  return (
    <div 
      className="absolute inset-0 cursor-crosshair"
      onClick={handleClick}
    />
  );
};
