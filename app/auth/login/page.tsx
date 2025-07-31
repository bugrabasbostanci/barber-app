"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
        const redirectTo = searchParams.get("redirect") || "/";
        router.push(redirectTo);
        router.refresh();
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
              <h2 className="text-2xl font-semibold">Giriş Yap</h2>
              <p className="text-muted-foreground">
                Hesabınıza giriş yapmak için bilgilerinizi girin
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
                    {message && (
                      <Alert>
                        <AlertDescription>{message}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ornek@email.com"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Şifre</Label>
                        <Link
                          href="/auth/forgot-password"
                          className="text-sm text-muted-foreground hover:underline"
                        >
                          Şifremi unuttum
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        {...register("password")}
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive">
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || isSubmitting}
                      >
                        {loading || isSubmitting
                          ? "Giriş yapılıyor..."
                          : "Giriş Yap"}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading || isSubmitting}
                      >
                        Google ile Giriş Yap
                      </Button>
                    </div>
                  </div>
                </form>
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Hesabınız yok mu?{" "}
                  <Link
                    href="/auth/register"
                    className="text-foreground hover:underline"
                  >
                    Kayıt olun
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
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
          <div className="flex items-center justify-center p-4 pt-8">
            <div className="w-full max-w-sm">
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    Yükleniyor...
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
