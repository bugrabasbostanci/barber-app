import { createClient } from "@/lib/supabase/server";
import { createUserInDatabase } from "@/lib/user-actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "email_change" | "recovery",
      token_hash,
    });

    if (!error) {
      // Get the user data after successful verification
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && type === "signup") {
        // Create user in our database for new signups
        const userData = {
          email: user.email!,
          firstName: user.user_metadata?.first_name || "",
          lastName: user.user_metadata?.last_name || "",
          phone: user.user_metadata?.phone || undefined,
        };

        const result = await createUserInDatabase(user.id, userData);

        if (result.success) {
          return NextResponse.redirect(
            new URL(
              "/auth/login?message=Hesabınız başarıyla oluşturuldu! Giriş yapabilirsiniz.",
              request.url
            )
          );
        } else {
          console.error("Failed to create user in database:", result.error);
          return NextResponse.redirect(
            new URL(
              "/auth/login?message=E-posta doğrulandı ancak hesap oluşturmada sorun yaşandı. Lütfen giriş yapmayı deneyin.",
              request.url
            )
          );
        }
      }

      // For other types (password reset, etc.)
      return NextResponse.redirect(
        new URL(
          "/auth/login?message=E-posta adresiniz doğrulandı! Giriş yapabilirsiniz.",
          request.url
        )
      );
    }
  }

  // Hata durumunda ana sayfaya yönlendir
  return NextResponse.redirect(
    new URL(
      "/auth/login?error=E-posta doğrulanamadı. Lütfen tekrar deneyin.",
      request.url
    )
  );
}
