"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { changePassword } from "@/lib/auth";
import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/validations/auth";
import {
  Mail,
  Phone,
  Calendar,
  Edit2,
  Save,
  X,
  Lock,
  Shield,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  // Password change form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPasswordForm,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
  });

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const userData = await response.json();
          setProfile(userData);
          setEditForm({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            phone: userData.phone || "",
          });
        } else {
          console.error("Failed to fetch profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    if (profile) {
      setEditForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
        alert("Profil başarıyla güncellendi!");
      } else {
        alert("Profil güncellenirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Profil güncellenirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setPasswordError("");
    setPasswordSuccess("");
    
    try {
      const { error } = await changePassword(data.currentPassword, data.newPassword);
      
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess("Şifreniz başarıyla güncellendi!");
        resetPasswordForm();
        setTimeout(() => {
          setIsChangingPassword(false);
          setPasswordSuccess("");
        }, 2000);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError("Şifre değiştirilirken bir hata oluştu.");
    }
  };

  const handlePasswordCancel = () => {
    setIsChangingPassword(false);
    setPasswordError("");
    setPasswordSuccess("");
    resetPasswordForm();
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "CUSTOMER":
        return <Badge variant="secondary">Müşteri</Badge>;
      case "BARBER":
        return <Badge variant="default">Berber</Badge>;
      case "ADMIN":
        return <Badge className="bg-purple-500">Admin</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
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
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Ana Sayfa
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Profilim</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                {user?.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="Profil Resmi"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://j508qhyzqd.ufs.sh/f/zFL6Zu9sI4C0PrTlIlRo6ZMBjNEkK8DbuR1VxXhmvcYqS7iU";
                    }}
                  />
                ) : profile?.firstName && profile?.lastName ? (
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-sm font-medium uppercase border">
                    {profile.firstName.charAt(0)}
                    {profile.lastName.charAt(0)}
                  </div>
                ) : (
                  <Image
                    src="https://j508qhyzqd.ufs.sh/f/zFL6Zu9sI4C0PrTlIlRo6ZMBjNEkK8DbuR1VxXhmvcYqS7iU"
                    alt="Profil Resmi"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className="text-lg font-semibold">Kişisel Bilgiler</div>
                  {user?.user_metadata?.avatar_url && (
                    <div className="text-sm text-muted-foreground font-normal">
                      Google hesabınızdan
                    </div>
                  )}
                </div>
              </CardTitle>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={handleEditClick}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 mr-2" />
                    İptal
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email - Read Only */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-posta
              </Label>
              <Input value={profile.email} readOnly className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                {user?.isGoogleUser 
                  ? "Google hesabınızdan otomatik alınan e-posta adresi" 
                  : "E-posta adresi değiştirilemez"
                }
              </p>
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">Ad</Label>
              {isEditing ? (
                <Input
                  id="firstName"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
                  placeholder="Adınızı girin"
                />
              ) : (
                <Input
                  value={profile.firstName || "Belirtilmemiş"}
                  readOnly
                  className="bg-muted"
                />
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Soyad</Label>
              {isEditing ? (
                <Input
                  id="lastName"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                  placeholder="Soyadınızı girin"
                />
              ) : (
                <Input
                  value={profile.lastName || "Belirtilmemiş"}
                  readOnly
                  className="bg-muted"
                />
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2" htmlFor="phone">
                <Phone className="h-4 w-4" />
                Telefon
              </Label>
              {isEditing ? (
                <Input
                  id="phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  placeholder="05XX XXX XX XX"
                />
              ) : (
                <Input
                  value={profile.phone || "Belirtilmemiş"}
                  readOnly
                  className="bg-muted"
                />
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>Hesap Türü</Label>
              <div className="flex items-center gap-2">
                {getRoleBadge(profile.role)}
              </div>
            </div>

            {/* Created At */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Üyelik Tarihi
              </Label>
              <Input
                value={formatDate(profile.createdAt)}
                readOnly
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        {/* Password Change Card - Only for email users */}
        {user?.isEmailUser && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Şifre Güvenliği
                </CardTitle>
              {!isChangingPassword ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsChangingPassword(true)}
                  disabled={isEditing}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Şifre Değiştir
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePasswordCancel}
                  >
                    <X className="h-4 w-4 mr-2" />
                    İptal
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!isChangingPassword ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Hesap güvenliğiniz için düzenli olarak şifrenizi değiştirmenizi öneririz.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Son şifre güncellemesi: Bilinmiyor</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                <div className="space-y-4">
                  {passwordError && (
                    <Alert variant="destructive">
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}
                  {passwordSuccess && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">
                        {passwordSuccess}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Mevcut şifrenizi girin"
                      {...registerPassword("currentPassword")}
                      className={passwordErrors.currentPassword ? "border-red-500" : ""}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-red-600">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Yeni Şifre</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="En az 6 karakter, büyük/küçük harf ve rakam"
                      {...registerPassword("newPassword")}
                      className={passwordErrors.newPassword ? "border-red-500" : ""}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-600">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Yeni Şifre Tekrarı</Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      placeholder="Yeni şifrenizi tekrar girin"
                      {...registerPassword("confirmNewPassword")}
                      className={passwordErrors.confirmNewPassword ? "border-red-500" : ""}
                    />
                    {passwordErrors.confirmNewPassword && (
                      <p className="text-sm text-red-600">
                        {passwordErrors.confirmNewPassword.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isPasswordSubmitting}
                  >
                    {isPasswordSubmitting ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
        )}

        {/* Google User Info Card */}
        {user?.isGoogleUser && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Hesap Güvenliği
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Image 
                      src="https://developers.google.com/identity/images/g-logo.png" 
                      alt="Google"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium text-blue-800">Google hesabı ile giriş yapıyorsunuz</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Hesabınız Google ile korunmaktadır. Şifre değiştirme ve hesap güvenliği ayarları için Google hesabınızı kullanın.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Güvenlik: Google tarafından yönetiliyor</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/my-appointments">
              <Calendar className="h-4 w-4 mr-2" />
              Randevularım
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/book-appointment">
              <Calendar className="h-4 w-4 mr-2" />
              Randevu Al
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
