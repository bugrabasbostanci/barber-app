"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRequireCustomer } from "@/hooks/useRequireAuth";
import type { User as AuthUser } from "@supabase/supabase-js";
import {
  User,
  Phone,
  Mail,
  Edit,
  Save,
  X,
  Trash2,
  CheckCircle,
  AlertCircle,
  Key,
} from "lucide-react";
import { useProfile, useUpdateProfile, useDeleteProfile } from "@/hooks/queries/useProfile";
import type { ProfileFormData } from "@/lib/api/profile";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";

// Type for user with extended properties
interface UserWithRole extends AuthUser {
  role?: string;
  firstName?: string;
  lastName?: string;
  isGoogleUser?: boolean;
  isEmailUser?: boolean;
}

// Validation helpers
const validatePhone = (phone: string): string => {
  if (!phone.trim()) return '';
  
  const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
  const cleanPhone = phone.replace(/\s/g, "");
  
  if (!phoneRegex.test(cleanPhone)) {
    return 'Geçerli bir telefon numarası girin (örn: 05551234567)';
  }
  
  return '';
};

const validateName = (name: string, fieldName: string): string => {
  if (!name.trim()) {
    return `${fieldName} gereklidir`;
  }
  
  if (name.trim().length < 2) {
    return `${fieldName} en az 2 karakter olmalıdır`;
  }
  
  return '';
};

export default function ProfilePage() {
  const { user, loading: authLoading, isAuthorized } = useRequireCustomer();

  // React Query hooks
  const { data: profile, isLoading, error: queryError } = useProfile();
  const updateMutation = useUpdateProfile();
  const deleteMutation = useDeleteProfile();

  // Local state for form
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Initialize form when profile loads
  useEffect(() => {
    if (profile && !isEditing) {
      setEditForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        email: profile.email,
      });
    }
  }, [profile, isEditing]);

  const error = queryError?.message || updateMutation.error?.message || deleteMutation.error?.message || '';
  const successMessage = updateMutation.isSuccess ? 'Profil başarıyla güncellendi!' : '';

  const handleStartEdit = () => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        email: profile.email,
      });
      setFieldErrors({ firstName: '', lastName: '', phone: '' });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFieldErrors({ firstName: '', lastName: '', phone: '' });
  };

  const validateForm = (): boolean => {
    const errors = {
      firstName: validateName(editForm.firstName, 'Ad'),
      lastName: validateName(editForm.lastName, 'Soyad'),
      phone: validatePhone(editForm.phone),
    };

    setFieldErrors(errors);
    return !errors.firstName && !errors.lastName && !errors.phone;
  };

  const hasFormChanges = (): boolean => {
    if (!profile) return false;
    return (
      editForm.firstName !== (profile.firstName || '') ||
      editForm.lastName !== (profile.lastName || '') ||
      editForm.phone !== (profile.phone || '')
    );
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await updateMutation.mutateAsync(editForm);
      setIsEditing(false);
    } catch (error) {
      // Error is handled by React Query
      console.error('Failed to update profile:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinecektir."
      )
    ) {
      return;
    }

    try {
      await deleteMutation.mutateAsync();
      // Redirect will be handled by auth state change
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };

  const getUserDisplayName = (): string => {
    if (!profile) return '';
    
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    
    return profile.email || '';
  };

  // Loading state
  if (authLoading || isLoading) {
    return <ProfileSkeleton />;
  }

  // Not authorized
  if (!isAuthorized) {
    return (
      <div className="px-4 py-6">
        <Alert variant="destructive">
          <AlertDescription>
            Bu sayfaya erişim yetkiniz bulunmuyor.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No profile data
  if (!profile) {
    return (
      <div className="px-4 py-6">
        <Alert variant="destructive">
          <AlertDescription>
            Profil bilgileri yüklenemedi.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const userWithRole = user as UserWithRole;
  const isEmailUser = userWithRole?.app_metadata?.provider === 'email';

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Profil Bilgileri
          </CardTitle>
          {!isEditing && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleStartEdit}
              disabled={updateMutation.isPending}
            >
              <Edit className="w-4 h-4 mr-1" />
              Düzenle
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              {/* Edit Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName">Ad *</Label>
                  <Input
                    id="firstName"
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                    className={fieldErrors.firstName ? "border-red-500" : ""}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-sm text-red-600 mt-1">
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Soyad *</Label>
                  <Input
                    id="lastName"
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                    className={fieldErrors.lastName ? "border-red-500" : ""}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-sm text-red-600 mt-1">
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Telefon *
                  </Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    placeholder="05551234567"
                    className={fieldErrors.phone ? "border-red-500" : ""}
                  />
                  {fieldErrors.phone && (
                    <p className="text-sm text-red-600 mt-1">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-1" />
                    E-posta
                  </Label>
                  <Input
                    id="email"
                    value={editForm.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    E-posta adresi değiştirilemez
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending || !hasFormChanges()}
                  className="flex-1"
                >
                  {updateMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Kaydediliyor...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      Kaydet
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={updateMutation.isPending}
                >
                  <X className="w-4 h-4 mr-1" />
                  İptal
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Display Mode */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-3 text-gray-500" />
                  <div>
                    <p className="font-medium">{getUserDisplayName()}</p>
                    <p className="text-sm text-gray-500">Ad Soyad</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-3 text-gray-500" />
                  <div>
                    <p className="font-medium">{profile.email}</p>
                    <p className="text-sm text-gray-500">E-posta</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-3 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {profile.phone || "Telefon numarası eklenmemiş"}
                    </p>
                    <p className="text-sm text-gray-500">Telefon</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Password Reset */}
      {isEmailUser && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Key className="w-5 h-5 mr-2 text-blue-600" />
              Güvenlik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Şifrenizi değiştirmek için şifre sıfırlama e-postası gönderin.
            </p>
            <Link href="/auth/reset-password">
              <Button variant="outline" className="w-full">
                <Key className="w-4 h-4 mr-2" />
                Şifre Değiştir
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Account Deletion */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-red-600 flex items-center">
            <Trash2 className="w-5 h-5 mr-2" />
            Hesabı Sil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Hesabınızı kalıcı olarak silmek istiyorsanız aşağıdaki butona
            tıklayın. Bu işlem geri alınamaz.
          </p>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={deleteMutation.isPending}
            className="w-full"
          >
            {deleteMutation.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Siliniyor...
              </div>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Hesabımı Sil
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}