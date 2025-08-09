interface Staff {
  id: string;
  firstName: string;
  lastName: string;
}

interface StaffLegendProps {
  staff: Staff[];
}

export function StaffLegend({ staff }: StaffLegendProps) {
  return (
    <div className="flex items-center justify-center space-x-8 mb-6">
      {staff.map((staffMember, index) => {
        const colorClass = index === 0 ? "blue-200" : "green-200";
        return (
          <div key={staffMember.id} className="flex items-center space-x-3">
            <div className={`w-6 h-6 bg-${colorClass} rounded-full`}></div>
            <span className="text-lg font-medium">
              {staffMember.firstName} {staffMember.lastName}
            </span>
          </div>
        );
      })}
    </div>
  );
}