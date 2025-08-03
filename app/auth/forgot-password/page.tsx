"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resetPassword } from "@/lib/auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

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
    setEmail(data.email);

    try {
      const { error } = await resetPassword(data.email);

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(error.message);
      }
    } catch {
      setError("An error occurred while resending. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b px-4 py-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Girişe Dön
              </Button>
            </Link>
            <h1 className="font-semibold text-lg">Şifremi Unuttum</h1>
            <div className="w-16"></div>
          </div>
        </header>

        <div className="px-4 py-8">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">E-postanızı Kontrol Edin</h2>
            <p className="text-gray-500 mb-2">
              Şifre sıfırlama bağlantısını gönderdiğimiz adres:
            </p>
            <p className="font-medium text-gray-900 mb-6">{email}</p>
            <p className="text-sm text-gray-500">
              E-postayı görmüyorsanız, spam klasörünüzü kontrol edin veya
              farklı bir e-posta adresiyle tekrar deneyin.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button
              onClick={() => {
                setSuccess(false);
                setEmail("");
              }}
              variant="outline"
              className="w-full h-12 bg-transparent"
            >
              Farklı E-posta Dene
            </Button>

            <Link href="/auth/login">
              <Button className="w-full h-12 text-base font-semibold">
                Girişe Dön
              </Button>
            </Link>
          </div>

          {/* Resend Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm mb-2">
              E-postayı almadınız mı?
            </p>
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50"
            >
              {loading ? "Tekrar gönderiliyor..." : "Sıfırlama bağlantısını tekrar gönder"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <Link href="/auth/login">
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
          <h2 className="text-3xl font-bold mb-2">Şifremi Unuttunuz mu?</h2>
          <p className="text-gray-500">
            E-posta adresinizi girin, size şifrenizi sıfırlamak için
            bir bağlantı gönderelim.
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

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Girişe Dön */}
        <div className="text-center">
          <p className="text-gray-600">
            Şifrenizi hatırladınız mı?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Giriş yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
