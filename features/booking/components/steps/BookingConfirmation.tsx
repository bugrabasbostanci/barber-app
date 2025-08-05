"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MessageSquare, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { BookingConfirmationProps } from '../../types/booking.types';
import { BookingService } from '../../services/bookingService';
import { DateUtils } from '@/shared';

export function BookingConfirmation({ 
  bookingData, 
  staff, 
  customerInfo, 
  onConfirm, 
  onBack, 
  loading = false 
}: BookingConfirmationProps) {
  const selectedStaff = staff.find(s => s.id === bookingData.staffId);
  
  const appointmentDuration = '45 dakika';
  const endTime = bookingData.timeSlot ? BookingService.calculateEndTime(bookingData.timeSlot) : '';

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Randevu Özeti</h3>
        <p className="text-gray-600">
          Bilgilerinizi kontrol edin ve randevunuzu onaylayın
        </p>
      </div>

      {/* Appointment Details */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Randevu Detayları
          </h4>

          <div className="space-y-4">
            {/* Date & Time */}
            <div className="flex justify-between items-start">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Tarih</span>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {bookingData.date ? DateUtils.formatTurkishDate(bookingData.date) : '-'}
                </div>
                <div className="text-sm text-gray-500">
                  {bookingData.date ? DateUtils.getDayName(bookingData.date) : ''}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>Saat</span>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {bookingData.timeSlot} - {endTime}
                </div>
                <div className="text-sm text-gray-500">
                  {appointmentDuration}
                </div>
              </div>
            </div>

            {/* Staff */}
            <div className="flex justify-between items-center">
              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span>Berber</span>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {selectedStaff ? `${selectedStaff.firstName} ${selectedStaff.lastName}` : '-'}
                </div>
                <Badge variant="secondary">
                  {selectedStaff?.role}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Müşteri Bilgileri
          </h4>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ad Soyad</span>
              <span className="font-medium">
                {customerInfo.firstName} {customerInfo.lastName}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>Telefon</span>
              </div>
              <span className="font-medium">
                {customerInfo.phone}
              </span>
            </div>

            {bookingData.notes && (
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span>Notlar</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  {bookingData.notes}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="space-y-2 text-sm">
              <div className="font-medium text-amber-800">Önemli Bilgiler:</div>
              <ul className="space-y-1 text-amber-700">
                <li>• Randevunuzu 2 saat öncesine kadar iptal edebilirsiniz</li>
                <li>• Geç kalma durumunda lütfen bizi arayın</li>
                <li>• Randevu onayı SMS ile gönderilecektir</li>
                <li>• Çalışma saatleri: 09:30 - 21:30 (Pazar kapalı)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1"
        >
          Geri Dön
        </Button>
        
        <Button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>Randevu oluşturuluyor...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Randevuyu Onayla</span>
            </div>
          )}
        </Button>
      </div>

      {/* Final Note */}
      <div className="text-center text-sm text-gray-500">
        Randevunuzu onayladıktan sonra değişiklik yapmak için 
        <br />
        bizimle iletişime geçebilirsiniz.
      </div>
    </div>
  );
}