"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn, signInWithGoogle } from "@/lib/auth";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const messageParam = searchParams.get("message");

    if (errorParam) {
      setError(errorParam);
    }
    if (messageParam) {
      setMessage(messageParam);
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError("");

    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        setError(error.message);
        // Focus back to email field for better UX
        setTimeout(() => {
          const emailInput = document.getElementById("email");
          emailInput?.focus();
        }, 100);
      } else {
        // Get user profile to determine role-based redirect
        const response = await fetch("/api/profile");
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const userRole = result.data.role;
            let redirectTo = searchParams.get("redirect");

            // If no specific redirect and user is a barber, redirect to dashboard
            if (!redirectTo || redirectTo === "/") {
              if (userRole === "BARBER" || userRole === "ADMIN") {
                redirectTo = "/barber/dashboard";
              } else {
                redirectTo = "/";
              }
            }

            router.push(redirectTo);
            router.refresh();
          } else {
            // Fallback if profile fetch fails
            const redirectTo = searchParams.get("redirect") || "/";
            router.push(redirectTo);
            router.refresh();
          }
        } else {
          // Fallback if profile fetch fails
          const redirectTo = searchParams.get("redirect") || "/";
          router.push(redirectTo);
          router.refresh();
        }
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const redirectTo = searchParams.get("redirect") || "/";

      // For Google OAuth, we'll let the callback handle role-based redirect
      // The callback will check user role and redirect appropriately
      const { error } = await signInWithGoogle(redirectTo);

      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // If successful, user will be redirected via OAuth flow
    } catch {
      setError(
        "Google ile giriş işlemi başarısız oldu. Lütfen tekrar deneyin."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Geri
            </Button>
          </Link>
          <h1 className="font-semibold text-lg">Giriş Yap</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <div className="px-4 py-8">
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Tekrar Hoş Geldiniz</h2>
          <p className="text-gray-500">
            The Barber Shop hesabınıza giriş yapın
          </p>
        </div>

        {/* Login Form */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-600"
                >
                  E-posta Adresi
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    {...register("email")}
                    className="pl-10 h-12"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-600"
                >
                  Şifre
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Şifrenizi girin"
                    {...register("password")}
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
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Şifremi unuttum?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">veya</span>
          </div>
        </div>

        {/* Google Login */}
        <div className="mb-8">
          <Button
            variant="outline"
            className="w-full h-12 bg-transparent"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || isSubmitting}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google ile Devam Et
          </Button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Hesabınız yok mu?{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Kayıt ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <header className="bg-white border-b px-4 py-4 sticky top-0 z-50">
            <div className="flex items-center justify-between">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="font-semibold text-lg">Giriş Yap</h1>
              <div className="w-16"></div>
            </div>
          </header>
          <div className="px-4 py-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
              <p className="text-gray-500">
                Sign in to your The Barber Shop account
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
      <LoginForm />
    </Suspense>
  );
}
