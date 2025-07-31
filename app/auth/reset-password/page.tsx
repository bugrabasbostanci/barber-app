"use client"

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
import { updatePassword } from "@/lib/auth";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth";
import { CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  // Check for session validity
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'invalid_session') {
      setError("Şifre sıfırlama oturumunuz geçersiz veya süresi dolmuş. Lütfen yeni bir şifre sıfırlama isteği gönderin.");
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);
    setError("");
    
    try {
      const { error } = await updatePassword(data.password);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login?message=Şifreniz başarıyla değiştirildi");
        }, 3000);
      }
    } catch {
      setError("Şifre güncellenirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
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
            <div className="text-center space-y-6">
              <div className="flex mx-auto items-center justify-center h-16 w-16 rounded-full bg-muted border">
                <CheckCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Şifre Değiştirildi</h2>
                <p className="text-muted-foreground">
                  Şifreniz başarıyla değiştirildi
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Giriş sayfasına yönlendiriliyorsunuz...
              </p>
              <Button asChild>
                <Link href="/auth/login">
                  Giriş Sayfasına Git
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
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
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Yeni Şifre</h2>
              <p className="text-muted-foreground">
                Yeni şifrenizi oluşturun
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
                    <div className="space-y-2">
                      <Label htmlFor="password">Yeni Şifre</Label>
                      <Input
                        id="password"
                        type="password"
                        {...register("password")}
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...register("confirmPassword")}
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || isSubmitting}
                    >
                      {loading || isSubmitting ? "Şifre Değiştiriliyor..." : "Şifreyi Değiştir"}
                    </Button>
                  </div>
                </form>
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <Link href="/auth/login" className="text-foreground hover:underline">
                    Giriş sayfasına dön
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
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
                <div className="text-center text-muted-foreground">Yükleniyor...</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}