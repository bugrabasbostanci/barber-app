"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Save, X } from 'lucide-react';
import { StaffFormProps, StaffFormData } from '../types/staff.types';
import { StaffService } from '../services/staffService';

export function StaffForm({ 
  staff, 
  onSubmit, 
  onCancel, 
  loading = false,
  error 
}: StaffFormProps) {
  const [formData, setFormData] = useState<StaffFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'barber',
    isActive: true,
  });
  
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Initialize form with staff data if editing
  useEffect(() => {
    if (staff) {
      setFormData({
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        phone: staff.phone || '',
        role: staff.role,
        isActive: staff.isActive,
      });
    }
  }, [staff]);

  const handleInputChange = (field: keyof StaffFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Clear form errors when user starts typing
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = StaffService.validateStaffData(formData);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    // Format phone number if provided
    const processedData = {
      ...formData,
      phone: formData.phone ? StaffService.formatPhone(formData.phone) : undefined,
    };

    onSubmit(processedData);
  };

  const isEditing = Boolean(staff);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>{isEditing ? 'Personel Düzenle' : 'Yeni Personel Ekle'}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {(error || formErrors.length > 0) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error && <div className="mb-2">{error}</div>}
                {formErrors.length > 0 && (
                  <ul className="list-disc list-inside space-y-1">
                    {formErrors.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Ad <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Adınızı girin"
                className={touched.firstName && !formData.firstName ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Soyad <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Soyadınızı girin"
                className={touched.lastName && !formData.lastName ? 'border-red-500' : ''}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                E-posta <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="ornek@email.com"
                className={touched.email && !formData.email ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="0555 123 45 67"
              />
              <p className="text-xs text-gray-500">
                Türkiye telefon numarası formatında girin
              </p>
            </div>
          </div>

          {/* Role and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">
                Rol <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange('role', value as 'barber' | 'admin')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="barber">Berber</SelectItem>
                  <SelectItem value="admin">Yönetici</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Yöneticiler tüm sistem özelliklerine erişebilir
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Durum</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive" className="font-normal">
                  {formData.isActive ? 'Aktif' : 'Pasif'}
                </Label>
              </div>
              <p className="text-xs text-gray-500">
                Pasif personel sisteme giriş yapamaz
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {isEditing ? 'Güncelleniyor...' : 'Kaydediliyor...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Güncelle' : 'Kaydet'}
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              <X className="h-4 w-4 mr-2" />
              İptal
            </Button>
          </div>

          {/* Additional Information for Editing */}
          {isEditing && staff && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Kayıt Tarihi:</span>
                  <span className="ml-2">
                    {new Date(staff.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Son Güncelleme:</span>
                  <span className="ml-2">
                    {new Date(staff.updatedAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}