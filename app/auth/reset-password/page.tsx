"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { changePassword } from "@/lib/auth";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/lib/validations/auth";
import { useAuth } from "@/hooks/useAuth";

function ChangePasswordForm() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
  });

  // Redirect if not logged in (but wait for auth to load)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  const onSubmit = async (data: ChangePasswordFormData) => {
    setLoading(true);
    setError("");

    try {
      const { error } = await changePassword(
        data.currentPassword,
        data.newPassword
      );

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to profile after 3 seconds
        setTimeout(() => {
          router.push("/profile?message=Password successfully updated");
        }, 3000);
      }
    } catch {
      setError("An error occurred while updating password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b px-4 py-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="font-semibold text-lg">Şifre Değiştir</h1>
            <div className="w-16"></div>
          </div>
        </header>
        <div className="px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-500">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (redirect is happening)
  if (!user) {
    return null;
  }

  // Only email users can change password
  if (!user.isEmailUser) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b px-4 py-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="font-semibold text-lg">Şifre Değiştir</h1>
            <div className="w-16"></div>
          </div>
        </header>
        <div className="px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Kullanılamıyor</h2>
            <p className="text-gray-500 mb-8">
              Şifre değiştirme sadece e-posta hesapları için kullanılabilir. Google
              hesapları şifrelerini Google üzerinden yönetir.
            </p>
            <Link href="/profile">
              <Button className="w-full h-12 text-base font-semibold">
                Profile Dön
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b px-4 py-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="w-16"></div>
            <h1 className="font-semibold text-lg">Şifre Değiştir</h1>
            <div className="w-16"></div>
          </div>
        </header>

        <div className="px-4 py-8">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Şifre Başarıyla Değiştirildi
            </h2>
            <p className="text-gray-500 mb-8">
              Şifreniz başarıyla güncellendi. Artık yeni şifrenizle
              hesabınızı kullanmaya devam edebilirsiniz.
            </p>
          </div>

          {/* Sign In Button */}
          <Link href="/profile">
            <Button className="w-full h-12 text-base font-semibold">
              Profile Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <Link href="/profile">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Geri
            </Button>
          </Link>
          <h1 className="font-semibold text-lg">Şifre Sıfırla</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <div className="px-4 py-8">
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Şifrenizi Değiştirin</h2>
          <p className="text-gray-500">
            Mevcut şifrenizi girin ve yeni güvenli bir şifre oluşturun.
          </p>
        </div>

        {/* Reset Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label
                  htmlFor="currentPassword"
                  className="text-sm font-medium text-gray-600"
                >
                  Mevcut Şifre
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Mevcut şifrenizi girin"
                    {...register("currentPassword")}
                    className="pl-10 pr-10 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-gray-600"
                >
                  Yeni Şifre
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Yeni bir şifre oluşturun"
                    {...register("newPassword")}
                    className="pl-10 pr-10 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="confirmNewPassword"
                  className="text-sm font-medium text-gray-600"
                >
                  Yeni Şifre Onayla
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmNewPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Yeni şifrenizi onaylayın"
                    {...register("confirmNewPassword")}
                    className="pl-10 pr-10 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmNewPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.confirmNewPassword.message}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Şifre içermeli:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• En az 8 karakter</li>
                  <li>• Bir büyük harf</li>
                  <li>• Bir küçük harf</li>
                  <li>• Bir sayı</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? "Güncelleniyor..." : "Şifre Güncelle"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Profile Dön */}
        <div className="text-center">
          <p className="text-gray-600">
            Şifrenizi değiştirmek istemiyor musunuz?{" "}
            <Link
              href="/profile"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Profile Dön
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <header className="bg-white border-b px-4 py-4 sticky top-0 z-50">
            <div className="flex items-center justify-between">
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="font-semibold text-lg">Şifre Değiştir</h1>
              <div className="w-16"></div>
            </div>
          </header>
          <div className="px-4 py-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">Şifrenizi Değiştirin</h2>
              <p className="text-gray-500">
                Enter your current password and create a new secure password.
              </p>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">Yükleniyor...</div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <ChangePasswordForm />
    </Suspense>
  );
}
