"use client";

import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Grid3X3,
  List
} from "lucide-react";
import { CalendarHeaderProps } from '../types/calendar.types';

const viewTypeConfig = {
  day: { label: 'Gün', icon: List },
  week: { label: 'Hafta', icon: Grid3X3 },
  month: { label: 'Ay', icon: CalendarIcon }
};

export function CalendarHeader({
  currentDate,
  viewType,
  onPrevious,
  onNext,
  onToday,
  onViewTypeChange
}: CalendarHeaderProps) {
  const formatTitle = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
    };

    if (viewType === 'day') {
      options.day = 'numeric';
      options.weekday = 'long';
    }

    return currentDate.toLocaleDateString('tr-TR', options);
  };

  const isToday = () => {
    const today = new Date();
    if (viewType === 'day') {
      return currentDate.toDateString() === today.toDateString();
    }
    return false;
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b">
      {/* Left section - Navigation */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant={isToday() ? "default" : "outline"}
          size="sm"
          onClick={onToday}
          className="ml-2"
        >
          Bugün
        </Button>
      </div>

      {/* Center section - Title */}
      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-lg font-semibold text-gray-900">
          {formatTitle()}
        </h2>
      </div>

      {/* Right section - View type selector */}
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
        {Object.entries(viewTypeConfig).map(([type, config]) => {
          const IconComponent = config.icon;
          const isActive = viewType === type;
          
          return (
            <Button
              key={type}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewTypeChange(type as any)}
              className={`h-8 px-3 ${isActive ? 'shadow-sm' : ''}`}
            >
              <IconComponent className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{config.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}