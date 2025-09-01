"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Check, X, Phone } from "lucide-react";
import { formatTurkishDateShort } from "@/lib/utils";

interface Appointment {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string | null;
  manualCustomerName?: string | null;
  manualCustomerPhone?: string | null;
  customer?: {
    firstName: string | null;
    lastName: string | null;
    phone?: string | null;
  } | null;
  staff: {
    firstName: string | null;
    lastName: string | null;
  };
  createdAt: Date;
}

interface AppointmentsListProps {
  appointments: Appointment[];
}

export function AppointmentsList({ appointments }: AppointmentsListProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="default">Onaylandı</Badge>;
      case "SCHEDULED":
        return <Badge variant="secondary">Planlandı</Badge>;
      case "COMPLETED":
        return <Badge variant="outline">Tamamlandı</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">İptal</Badge>;
      case "NO_SHOW":
        return <Badge variant="destructive">Gelmedi</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredAppointments = selectedStatus
    ? appointments.filter((apt) => apt.status === selectedStatus)
    : appointments;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Randevular ({filteredAppointments.length})</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={selectedStatus === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(null)}
            >
              Tümü
            </Button>
            <Button
              variant={selectedStatus === "SCHEDULED" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("SCHEDULED")}
            >
              Planlandı
            </Button>
            <Button
              variant={selectedStatus === "CONFIRMED" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("CONFIRMED")}
            >
              Onaylandı
            </Button>
            <Button
              variant={selectedStatus === "COMPLETED" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("COMPLETED")}
            >
              Tamamlandı
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Müşteri</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Personel</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Saat</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Notlar</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    No Appointment Found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="font-medium">
                        {appointment.customer
                          ? `${appointment.customer.firstName || ""} ${
                              appointment.customer.lastName || ""
                            }`.trim()
                          : appointment.manualCustomerName ||
                            "Bilinmeyen Müşteri"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Intl.DateTimeFormat("tr-TR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }).format(appointment.createdAt)}{" "}
                        tarihinde oluşturuldu
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {appointment.customer?.phone ||
                        appointment.manualCustomerPhone ? (
                          <>
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">
                              {appointment.customer?.phone ||
                                appointment.manualCustomerPhone}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {`${appointment.staff.firstName || ""} ${
                          appointment.staff.lastName || ""
                        }`.trim() || "Bilinmeyen Personel"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatTurkishDateShort(
                          appointment.date.toISOString().split("T")[0]
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Intl.DateTimeFormat("tr-TR", {
                          weekday: "long",
                        }).format(appointment.date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{appointment.startTime}</div>
                      <div className="text-xs text-gray-500">
                        {appointment.endTime} kadar
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate text-sm">
                        {appointment.notes || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          {appointment.status === "SCHEDULED" && (
                            <DropdownMenuItem>
                              <Check className="h-4 w-4 mr-2" />
                              Onayla
                            </DropdownMenuItem>
                          )}
                          {appointment.status === "CONFIRMED" && (
                            <DropdownMenuItem>
                              <Check className="h-4 w-4 mr-2" />
                              Tamamla
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600">
                            <X className="h-4 w-4 mr-2" />
                            İptal Et
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
