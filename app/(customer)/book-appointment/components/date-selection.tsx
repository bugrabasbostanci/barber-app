import { Card, CardContent } from "@/components/ui/card";
import { formatTurkishDate, dateToLocalString } from "@/lib/utils";

interface DateSelectionProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export function DateSelection({
  selectedDate,
  onDateSelect,
}: DateSelectionProps) {
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    // Generate next 7 available days (excluding Sundays)
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip Sundays (day 0)
      if (date.getDay() !== 0) {
        // Use timezone-safe date string creation from lib/date-time.ts
        const dateString = dateToLocalString(date);
        
        // Tarihi aynı şekilde oluştur (timezone-safe)
        const displayDate = new Date(dateString + 'T00:00:00');
        dates.push({
          value: dateString,
          label: formatTurkishDate(dateString),
          dayName: displayDate.toLocaleDateString("tr-TR", { weekday: "long" }),
          isToday: i === 0 && today.getDay() !== 0,
        });
      }

      // Stop when we have 7 available dates
      if (dates.length >= 7) break;
    }

    return dates;
  };

  const availableDates = getAvailableDates();

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Tarih Seçin</h2>
        <p className="text-muted-foreground text-sm">
          Randevu tarihinizi seçin (Pazar günleri kapalı)
        </p>
      </div>

      <div className="grid gap-3">
        {availableDates.map((date) => {
          const isSelected = selectedDate === date.value;

          return (
            <Card
              key={date.value}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "hover:border-primary/50 hover:shadow-sm"
              }`}
              onClick={() => onDateSelect(date.value)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="font-semibold text-base">
                    {date.label}
                    {date.isToday && (
                      <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                        Bugün
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {date.dayName}
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
