"use client";

import type React from "react";

import { useState } from "react";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b px-4 py-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Login
              </Button>
            </Link>
            <h1 className="font-semibold text-lg">Reset Password</h1>
            <div className="w-16"></div>
          </div>
        </header>

        <div className="px-4 py-8">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
            <p className="text-gray-500 mb-2">
              We've sent a password reset link to:
            </p>
            <p className="font-medium text-gray-900 mb-6">{email}</p>
            <p className="text-sm text-gray-500">
              If you don't see the email, check your spam folder or try again
              with a different email address.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
              }}
              variant="outline"
              className="w-full h-12 bg-transparent"
            >
              Try Different Email
            </Button>

            <Link href="/login">
              <Button className="w-full h-12 text-base font-semibold">
                Back to Login
              </Button>
            </Link>
          </div>

          {/* Resend Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm mb-2">
              Didn't receive the email?
            </p>
            <button
              onClick={() => {
                // Handle resend logic
                console.log("Resending email to:", email);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Resend reset link
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
          <Link href="/login">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="font-semibold text-lg">Reset Password</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <div className="px-4 py-8">
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Forgot Password?</h2>
          <p className="text-gray-500">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {/* Reset Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-600"
                >
                  Email Address
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <p className="text-gray-600">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
