"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoginForm, useAuth, type LoginCredentials } from "@/features/auth";

function LoginContent() {
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { login, loading, error, isAuthenticated } = useAuth();

  // Handle redirect after successful login
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
    }
  }, [isAuthenticated, router, searchParams]);

  // Show message from URL params (e.g., after registration)
  useEffect(() => {
    const urlMessage = searchParams.get("message");
    if (urlMessage) {
      setMessage(decodeURIComponent(urlMessage));
    }
  }, [searchParams]);

  const handleLogin = async (credentials: LoginCredentials) => {
    const success = await login(credentials);
    if (success) {
      // Redirect will be handled by useEffect above
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana sayfaya dön
          </Link>
        </div>

        {/* Success message */}
        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        <LoginForm
          onSubmit={handleLogin}
          loading={loading}
          error={error || undefined}
          showRegisterLink={true}
          showForgotPassword={true}
        />

        {/* Additional links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Berber misiniz?{" "}
            <Link href="/update-role" className="text-blue-600 hover:underline">
              Rol güncelleme
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
