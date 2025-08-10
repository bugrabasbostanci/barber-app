"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Clock, Calendar, User, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { TimeBlock } from "../types";

interface TimeBlocksListProps {
  blockedTimes: TimeBlock[];
  loading?: boolean;
  onDeleteTimeBlock: (id: string) => void;
  getStaffName: (staffId: string) => string;
  className?: string;
}

export function TimeBlocksList({
  blockedTimes,
  loading = false,
  onDeleteTimeBlock,
  getStaffName,
  className = ""
}: TimeBlocksListProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d MMMM yyyy", { locale: tr });
    } catch {
      return dateString;
    }
  };

  const formatTimeRange = (startTime?: string | null, endTime?: string | null, isFullDay?: boolean) => {
    if (isFullDay) {
      return "Tüm Gün";
    }
    if (startTime && endTime) {
      return `${startTime} - ${endTime}`;
    }
    return "Zaman belirtilmemiş";
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Bloke Zamanlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="ml-2 text-muted-foreground">Yükleniyor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Bloke Zamanlar</CardTitle>
          <Badge variant="secondary">
            {blockedTimes.length} blok
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {blockedTimes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Bloke zaman yok</p>
            <p className="text-sm">Henüz hiç zaman bloğu oluşturulmamış</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blockedTimes.map((block) => (
              <div
                key={block.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  {/* Date and Time */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatDate(block.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatTimeRange(block.startTime, block.endTime, block.isFullDay)}
                      </span>
                    </div>
                  </div>

                  {/* Staff */}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {getStaffName(block.staffId)}
                    </span>
                  </div>

                  {/* Reason */}
                  {block.reason && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {block.reason}
                      </span>
                    </div>
                  )}

                  {/* Full Day Badge */}
                  {block.isFullDay && (
                    <Badge variant="outline" className="w-fit">
                      Tüm Gün Blok
                    </Badge>
                  )}
                </div>

                {/* Delete Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteTimeBlock(block.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}