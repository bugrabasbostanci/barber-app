import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StaffSelectionSkeleton } from "@/components/skeletons/booking-skeleton";
import { type Staff } from "@/lib/stores/booking-store";

interface StaffSelectionProps {
  selectedStaff: string;
  onStaffSelect: (staffId: string) => void;
}

export function StaffSelection({ selectedStaff, onStaffSelect }: StaffSelectionProps) {
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStaff() {
      try {
        const response = await fetch("/api/staff");
        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            setStaffMembers(result.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch staff:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStaff();
  }, []);

  const getStaffTitle = (role: string) => {
    return role === "BARBER" ? "Barber" : "Staff";
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return <StaffSelectionSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Select Barber</h2>
        <p className="text-muted-foreground text-sm">
          Choose the barber for your appointment
        </p>
      </div>

      <div className="grid gap-3">
        {staffMembers.map((staff) => {
          const isSelected = selectedStaff === staff.id;
          
          return (
            <Card
              key={staff.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "hover:border-primary/50 hover:shadow-sm"
              }`}
              onClick={() => onStaffSelect(staff.id)}
            >
              <CardContent className="flex items-center p-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold mr-4 ${
                    isSelected ? "bg-primary" : "bg-muted-foreground"
                  }`}
                >
                  {getInitials(staff.firstName, staff.lastName)}
                </div>
                
                <div className="flex-1">
                  <div className="font-semibold text-base">
                    {staff.firstName} {staff.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getStaffTitle(staff.role)}
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}