import Link from "next/link";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AppointmentsEmptyStateProps {
  type: "upcoming" | "completed" | "cancelled";
  showCreateButton?: boolean;
}

const getEmptyStateContent = (type: AppointmentsEmptyStateProps["type"]) => {
  switch (type) {
    case "upcoming":
      return {
        title: "Yaklaşan randevu bulunamadı",
        description: "Filtreleri kontrol edin veya yeni randevu oluşturun",
        showCreateButton: true,
      };
    case "completed":
      return {
        title: "Tamamlanan randevu bulunamadı",
        description: "Filtreleri kontrol edin",
        showCreateButton: false,
      };
    case "cancelled":
      return {
        title: "İptal edilen randevu bulunamadı",
        description: "Filtreleri kontrol edin",
        showCreateButton: false,
      };
  }
};

export function AppointmentsEmptyState({ type, showCreateButton = false }: AppointmentsEmptyStateProps) {
  const content = getEmptyStateContent(type);
  const shouldShowButton = showCreateButton && content.showCreateButton;

  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Calendar className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-medium text-lg mb-2">
          {content.title}
        </h3>
        <p className="text-muted-foreground mb-6">
          {content.description}
        </p>
        {shouldShowButton && (
          <Link href="/barber/appointments/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Randevu
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}