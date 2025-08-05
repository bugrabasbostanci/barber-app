"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useProfile, type UserProfile, type ProfileFormData } from "@/contexts/app-contexts";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";

// Type for user with extended properties
interface UserWithRole extends AuthUser {
  role?: string;
  firstName?: string;
  lastName?: string;
  isGoogleUser?: boolean;
  isEmailUser?: boolean;
}

export default function ProfilePage() {
  const { user, loading: authLoading, isAuthorized } = useRequireCustomer();

  // Profile context
  const {
    profile,
    isLoading: loading,
    error: errorMessage,
    isEditing,
    isSaving,
    isDeleting,
    editForm,
    phoneError,
    firstNameError,
    lastNameError,
    successMessage,

    // Actions
    fetchProfile,
    setIsEditing,
    updateEditForm,
    resetEditForm,
    saveProfile,
    deleteAccount,
    getUserDisplayName,
    isFormValid,
    hasFormChanges,
  } = useProfile();

  // Profile is automatically fetched by the context

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetEditForm();
  };

  const handleSave = async () => {
    await saveProfile();
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinecektir."
      )
    ) {
      return;
    }

    if (!confirm("Son onay: Hesabınızı gerçekten silmek istiyor musunuz?")) {
      return;
    }

    const success = await deleteAccount();
    if (success) {
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  };

  // Show loading if auth is loading or not authorized
  if (authLoading || !isAuthorized || loading) {
    return <ProfileSkeleton />;
  }

  if (errorMessage && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 py-8">
          <div className="text-center space-y-4">
            <p className="text-destructive">{errorMessage}</p>
            <Button onClick={() => fetchProfile(true)}>Tekrar Dene</Button>
            <Button asChild variant="outline">
              <Link href="/">Ana Sayfaya Dön</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 py-8">
          <div className="text-center space-y-4">
            <p className="text-destructive">Profil yüklenemedi.</p>
            <Button asChild>
              <Link href="/">Ana Sayfaya Dön</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Profile Picture */}
      <Suspense
        fallback={
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"></div>
          </div>
        }
      >
        <ProfileHeader
          getUserDisplayName={getUserDisplayName}
          profile={profile}
        />
      </Suspense>

      {/* Alert Messages */}
      {successMessage && (
        <Alert className="mb-6 border-green-500/20 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Personal Information with Suspense */}
      {profile && (
        <Suspense
          fallback={
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-10 bg-muted rounded"></div>
                      <div className="h-10 bg-muted rounded"></div>
                    </div>
                    <div className="h-10 bg-muted rounded"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          }
        >
          <PersonalInformationCard
            profile={profile}
            user={user}
            isEditing={isEditing}
            editForm={editForm}
            phoneError={phoneError}
            firstNameError={firstNameError}
            lastNameError={lastNameError}
            setIsEditing={setIsEditing}
            updateEditForm={updateEditForm}
            handleCancelEdit={handleCancelEdit}
          />
        </Suspense>
      )}

      {/* Save Button for Edit Mode */}
      {isEditing && (
        <div className="mb-6">
          <div className="flex space-x-3">
            <Button
              onClick={handleCancelEdit}
              variant="outline"
              className="flex-1 h-12 text-base bg-transparent"
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-12 text-base font-semibold"
              disabled={isSaving || !isFormValid() || !hasFormChanges()}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </div>
        </div>
      )}

      {/* Security Actions - Only for email users */}
      {user?.isEmailUser && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Güvenlik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth/reset-password">
              <Button variant="outline" className="w-full bg-transparent">
                <Key className="w-4 h-4 mr-2" />
                Şifre Değiştir
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Account Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full bg-transparent text-destructive border-destructive/20 hover:bg-destructive/10"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Siliniyor..." : "Hesabı Sil"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Separate component for profile header
function ProfileHeader({
  getUserDisplayName,
  profile,
}: {
  getUserDisplayName: () => string;
  profile: UserProfile | null;
}) {
  // Get user initials from first name and last name
  const getUserInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
    }
    if (profile?.firstName) {
      return profile.firstName.charAt(0).toUpperCase();
    }
    if (profile?.email) {
      return profile.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="text-center mb-8">
      <Avatar className="w-24 h-24 mx-auto mb-4">
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xl">
          {getUserInitials()}
        </AvatarFallback>
      </Avatar>
      <h2 className="text-2xl font-bold">{getUserDisplayName()}</h2>
      {profile?.createdAt && (
        <p className="text-muted-foreground">
          {new Date(profile.createdAt).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          tarihinden beri üye
        </p>
      )}
    </div>
  );
}

// Separate component for personal information card
function PersonalInformationCard({
  profile,
  user,
  isEditing,
  editForm,
  phoneError,
  firstNameError,
  lastNameError,
  setIsEditing,
  updateEditForm,
  handleCancelEdit,
}: {
  profile: UserProfile;
  user: UserWithRole | null;
  isEditing: boolean;
  editForm: ProfileFormData;
  phoneError: string;
  firstNameError: string;
  lastNameError: string;
  setIsEditing: (editing: boolean) => void;
  updateEditForm: (field: keyof ProfileFormData, value: string) => void;
  handleCancelEdit: () => void;
}) {
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Kişisel Bilgiler</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (isEditing ? handleCancelEdit() : setIsEditing(true))}
          className="flex items-center gap-2 h-8 px-2"
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4" />
              <span className="text-sm">İptal</span>
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" />
              <span className="text-sm">Düzenle</span>
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Ad</Label>
            {isEditing ? (
              <>
                <Input
                  value={editForm.firstName}
                  onChange={(e) => updateEditForm("firstName", e.target.value)}
                  placeholder="Adınız"
                  className={`mt-1 ${
                    firstNameError
                      ? "border-destructive focus:border-destructive focus:ring-destructive"
                      : ""
                  }`}
                />
                {firstNameError && (
                  <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{firstNameError}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center mt-2">
                <User className="w-4 h-4 mr-3 text-muted-foreground" />
                <span>{profile.firstName || "Belirtilmemiş"}</span>
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Soyad</Label>
            {isEditing ? (
              <>
                <Input
                  value={editForm.lastName}
                  onChange={(e) => updateEditForm("lastName", e.target.value)}
                  placeholder="Soyadınız"
                  className={`mt-1 ${
                    lastNameError
                      ? "border-destructive focus:border-destructive focus:ring-destructive"
                      : ""
                  }`}
                />
                {lastNameError && (
                  <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{lastNameError}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center mt-2">
                <User className="w-4 h-4 mr-3 text-muted-foreground" />
                <span>{profile.lastName || "Belirtilmemiş"}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Telefon Numarası
          </Label>
          {isEditing ? (
            <>
              <Input
                value={editForm.phone}
                onChange={(e) => updateEditForm("phone", e.target.value)}
                placeholder="0532 123 45 67"
                className={`mt-1 ${
                  phoneError
                    ? "border-destructive focus:border-destructive focus:ring-destructive"
                    : ""
                }`}
              />
              {phoneError && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{phoneError}</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center mt-2">
              <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
              <span>{profile.phone || "Belirtilmemiş"}</span>
            </div>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            E-posta Adresi
          </Label>
          {isEditing && user?.isEmailUser ? (
            <Input
              value={editForm.email}
              onChange={(e) => updateEditForm("email", e.target.value)}
              className="mt-1"
              type="email"
            />
          ) : (
            <div className="flex items-center mt-2">
              <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
              <span>{profile.email}</span>
            </div>
          )}
          {user?.isGoogleUser && (
            <p className="text-xs text-muted-foreground mt-1">
              Google hesabınızdan gelen e-posta (değiştirilemez)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
