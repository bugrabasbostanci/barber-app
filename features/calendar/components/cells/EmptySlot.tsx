"use client";

import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { EmptySlotProps } from '../../types/calendar.types';
import { cn } from "@/lib/utils";

export function EmptySlot({ time, staffId, available = true, onClick }: EmptySlotProps) {
  const handleClick = () => {
    if (available && onClick) {
      onClick(time, staffId);
    }
  };

  if (!available) {
    return (
      <div className="w-full h-12 border border-gray-200 rounded-lg bg-gray-100 flex items-center justify-center">
        <div className="flex items-center text-xs text-gray-500">
          <X className="w-3 h-3 mr-1" />
          Müsait değil
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full h-12 border-2 border-dashed border-gray-300",
        "hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700",
        "text-gray-500 transition-all duration-200"
      )}
      onClick={handleClick}
    >
      <div className="flex items-center justify-center space-x-2">
        <Plus className="w-4 h-4" />
        <span className="text-xs">
          {time} - Müsait
        </span>
      </div>
    </Button>
  );
}