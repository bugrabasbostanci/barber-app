"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Grid3X3,
  List,
} from "lucide-react";
import { CalendarViewType, CalendarNavigation } from "../types";

interface CalendarHeaderProps {
  navigation: CalendarNavigation;
  title: string;
  appointmentCount?: number;
  className?: string;
}

const viewTypeLabels: Record<CalendarViewType, string> = {
  day: "Gün",
  week: "Hafta", 
  month: "Ay"
};

const viewTypeIcons: Record<CalendarViewType, React.ReactNode> = {
  day: <List className="h-4 w-4" />,
  week: <Grid3X3 className="h-4 w-4" />,
  month: <CalendarIcon className="h-4 w-4" />
};

export function CalendarHeader({
  navigation,
  title,
  appointmentCount,
  className = ""
}: CalendarHeaderProps) {
  const { 
    viewType, 
    goToPrevious, 
    goToNext, 
    goToToday, 
    setViewType 
  } = navigation;

  return (
    <div className={`flex items-center justify-between p-4 border-b ${className}`}>
      {/* Left side - Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="ml-2"
        >
          Bugün
        </Button>
      </div>

      {/* Center - Title and appointment count */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">
          {title}
        </h2>
        {appointmentCount !== undefined && (
          <Badge variant="secondary">
            {appointmentCount} Randevu
          </Badge>
        )}
      </div>

      {/* Right side - View type toggles */}
      <div className="flex items-center gap-1">
        {(Object.keys(viewTypeLabels) as CalendarViewType[]).map((type) => (
          <Button
            key={type}
            variant={viewType === type ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewType(type)}
            className="h-8 px-3"
          >
            {viewTypeIcons[type]}
            <span className="ml-1 hidden sm:inline">
              {viewTypeLabels[type]}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}