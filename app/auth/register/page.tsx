"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      setLoading(false);
      return;
    }

    if (!agreed) {
      setError("Kullanım şartlarını kabul etmelisiniz.");
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });
      
      if (error) {
        setError(error.message);
      } else {
        router.push("/auth/login?message=Hesabınız oluşturuldu! E-posta adresinizi kontrol ederek hesabınızı doğrulayın.");
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

      {/* Mobile-First Register Form */}
      <main className="px-4 py-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-2xl mb-4">
              📝
            </div>
            <CardTitle className="text-2xl font-bold">Kayıt Ol</CardTitle>
            <CardDescription>
              Yeni hesap oluşturun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ad</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Adınız"
                    className="h-12"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Soyad</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Soyadınız"
                    className="h-12"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ornek@email.com"
                  className="h-12"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon (İsteğe bağlı)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0532 123 45 67"
                  className="h-12"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="En az 6 karakter"
                  className="h-12"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Şifrenizi tekrar girin"
                  className="h-12"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <Label htmlFor="terms" className="text-sm">
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Kullanım şartlarını
                  </Link>
                  {' '}kabul ediyorum
                </Label>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium"
                disabled={loading}
              >
                {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
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
                Zaten hesabınız var mı?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Giriş yapın
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}