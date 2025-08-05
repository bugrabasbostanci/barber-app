"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Star } from "lucide-react";
import { StaffSelectionProps } from '../../types/booking.types';
import { cn } from "@/lib/utils";

export function StaffSelection({ 
  staff, 
  selectedStaffId, 
  onSelect, 
  loading = false 
}: StaffSelectionProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Berber Seçin</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Berber Bulunamadı
        </h3>
        <p className="text-gray-500">
          Şu anda müsait berber bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Berber Seçin</h3>
        <p className="text-gray-600">
          Randevunuz için bir berber seçin
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {staff.map((member) => {
          const isSelected = selectedStaffId === member.id;
          
          return (
            <Card 
              key={member.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-blue-500 bg-blue-50"
              )}
              onClick={() => onSelect(member.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    isSelected ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                  )}>
                    <User className="w-6 h-6" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {member.firstName} {member.lastName}
                      </h4>
                      {isSelected && (
                        <div className="flex items-center text-blue-600">
                          <Star className="w-4 h-4 fill-current" />
                        </div>
                      )}
                    </div>
                    
                    <Badge variant="secondary" className="mb-2">
                      {member.role}
                    </Badge>
                    
                    {/* Experience or other details could go here */}
                    <p className="text-sm text-gray-600">
                      Deneyimli berber
                    </p>
                  </div>
                </div>

                {/* Selection Button */}
                <Button
                  variant={isSelected ? "default" : "outline"}
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(member.id);
                  }}
                >
                  {isSelected ? 'Seçildi' : 'Seç'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          Berberlerin müsaitlik durumu sonraki adımda gösterilecektir
        </p>
      </div>
    </div>
  );
}