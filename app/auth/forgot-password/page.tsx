"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resetPassword } from "@/lib/auth";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
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
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">E-posta Gönderildi</h2>
                <p className="text-muted-foreground">
                  Şifre sıfırlama bağlantısı e-posta adresinize gönderildi
                </p>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>E-posta kutunuzu kontrol edin</p>
                <p className="text-xs">E-posta gelmedi mi? Spam klasörünüzü kontrol edin</p>
              </div>
              <Button asChild>
                <Link href="/auth/login">
                  Giriş Sayfasına Dön
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
              <h2 className="text-2xl font-semibold">Şifremi Unuttum</h2>
              <p className="text-muted-foreground">
                E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim
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
                      <Label htmlFor="email">E-posta</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ornek@email.com"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || isSubmitting}
                    >
                      {loading || isSubmitting ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
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