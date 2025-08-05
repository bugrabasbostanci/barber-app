"use client";

import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Shield,
  Power,
  PowerOff
} from 'lucide-react';
import { StaffModalProps } from '../types/staff.types';
import { StaffService } from '../services/staffService';

export function StaffModal({ 
  staff, 
  isOpen, 
  onClose, 
  onSave 
}: StaffModalProps) {
  if (!staff) return null;

  const initials = `${staff.firstName.charAt(0)}${staff.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${staff.firstName} ${staff.lastName}`;

  const handleEdit = () => {
    onSave?.(staff);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className={`text-sm font-medium ${
                staff.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">{fullName}</span>
                {staff.role === 'admin' && (
                  <Shield className="h-5 w-5 text-purple-600" />
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant={staff.role === 'admin' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {StaffService.getRoleDisplayName(staff.role)}
                </Badge>
                <Badge 
                  variant={staff.isActive ? 'default' : 'secondary'}
                  className={`text-xs ${
                    staff.isActive 
                      ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {staff.isActive ? (
                    <>
                      <Power className="h-3 w-3 mr-1" />
                      Aktif
                    </>
                  ) : (
                    <>
                      <PowerOff className="h-3 w-3 mr-1" />
                      Pasif
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                İletişim Bilgileri
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">E-posta</p>
                    <p className="text-sm text-gray-600">{staff.email}</p>
                  </div>
                </div>
                
                {staff.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Telefon</p>
                      <p className="text-sm text-gray-600">{staff.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Sistem Bilgileri
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Kayıt Tarihi</p>
                  <p className="text-sm text-gray-600">
                    {new Date(staff.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Son Güncelleme</p>
                  <p className="text-sm text-gray-600">
                    {new Date(staff.updatedAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Personel ID</p>
                  <p className="text-sm text-gray-600 font-mono">{staff.id}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Durum</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {staff.isActive ? (
                      <>
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        <span className="text-sm text-green-600">Aktif</span>
                      </>
                    ) : (
                      <>
                        <div className="h-2 w-2 bg-gray-400 rounded-full" />
                        <span className="text-sm text-gray-600">Pasif</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                {staff.role === 'admin' ? (
                  <Shield className="h-5 w-5 mr-2 text-purple-600" />
                ) : (
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                )}
                Yetki ve Roller
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Mevcut Rol</p>
                  <Badge 
                    variant={staff.role === 'admin' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {StaffService.getRoleDisplayName(staff.role)}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Yetkiler</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    {staff.role === 'admin' ? (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Tüm randevuları görüntüleme ve yönetme</li>
                        <li>Personel ekleme, düzenleme ve silme</li>
                        <li>Sistem ayarlarını değiştirme</li>
                        <li>Raporları görüntüleme</li>
                        <li>Berber olarak randevu alma</li>
                      </ul>
                    ) : (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Kendi randevularını görüntüleme</li>
                        <li>Randevu durumlarını güncelleme</li>
                        <li>Müsaitlik durumunu ayarlama</li>
                        <li>Profil bilgilerini güncelleme</li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Separator />
          
          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Kapat
            </Button>
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}