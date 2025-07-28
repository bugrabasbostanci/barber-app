"use client"

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');
    
    if (errorParam) {
      setError(errorParam);
    }
    if (messageParam) {
      setMessage(messageParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Geri
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">BerberApp</h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Mobile-First Login Form */}
      <main className="px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl mb-4">
              👤
            </div>
            <CardTitle className="text-2xl font-bold">Giriş Yap</CardTitle>
            <CardDescription>
              Hesabınıza giriş yapın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              {message && (
                <div className="p-3 rounded-md bg-green-50 border border-green-200">
                  <p className="text-sm text-green-600">{message}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  className="h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Şifrenizi girin"
                  className="h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Beni hatırla
                  </Label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Şifremi unuttum
                </Link>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium"
                disabled={loading}
              >
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">veya</span>
              </div>
            </div>
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Hesabınız yok mu?{' '}
                <Link
                  href="/auth/register"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Kayıt olun
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}