"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signUp, signInWithGoogle } from "@/lib/auth";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError("");

    try {
      const { error } = await signUp(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
      });

      if (error) {
        setError(error.message);
        // Focus back to email field for better UX
        setTimeout(() => {
          const emailInput = document.getElementById("email");
          emailInput?.focus();
        }, 100);
      } else {
        router.push(
          "/auth/login?message=Hesabınız oluşturuldu! E-posta adresinizi kontrol ederek hesabınızı doğrulayın."
        );
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // If successful, user will be redirected via OAuth flow
    } catch {
      setError(
        "Google ile kayıt işlemi başarısız oldu. Lütfen tekrar deneyin."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Ana Sayfa
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">BerberApp</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-sm">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Kayıt Ol</h2>
              <p className="text-muted-foreground">
                Yeni hesap oluşturmak için bilgilerinizi girin
              </p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Ad</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Adınız"
                          {...register("firstName")}
                          className={errors.firstName ? "" : ""}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-destructive">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Soyad</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Soyadınız"
                          {...register("lastName")}
                          className={errors.lastName ? "" : ""}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-destructive">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        {...register("email")}
                        className={errors.email ? "" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon (İsteğe bağlı)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="05XX XXX XX XX"
                        {...register("phone")}
                        className={errors.phone ? "" : ""}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Şifre</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="En az 6 karakter, büyük/küçük harf ve rakam"
                        {...register("password")}
                        className={errors.password ? "" : ""}
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive">
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Şifrenizi tekrar girin"
                        {...register("confirmPassword")}
                        className={errors.confirmPassword ? "" : ""}
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading || isSubmitting}
                    >
                      {loading || isSubmitting
                        ? "Kayıt yapılıyor..."
                        : "Kayıt Ol"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      type="button"
                      onClick={handleGoogleSignUp}
                      disabled={loading || isSubmitting}
                    >
                      Google ile Kayıt Ol
                    </Button>
                  </div>
                </form>
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Zaten hesabınız var mı?{" "}
                  <Link
                    href="/auth/login"
                    className="text-foreground hover:underline"
                  >
                    Giriş yapın
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
