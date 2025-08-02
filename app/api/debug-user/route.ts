import { NextRequest, NextResponse } from "next/server";
import { withAuth, requireAdmin, AuthenticatedUser } from "@/lib/middleware/api-auth";
import { checkUserRole } from "@/lib/admin-actions";
import { logger } from "@/lib/logger";

async function debugUser(req: NextRequest, context?: Record<string, unknown>) {
  const user = context?.user as AuthenticatedUser;
  try {
    // Production security: Only allow in development or for admin users
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        success: false, 
        error: "Debug endpoints are disabled in production for security" 
      }, { status: 403 });
    }

    // Check database user
    const dbUser = await checkUserRole();

    // Sanitize sensitive data
    const sanitizedUser = {
      id: user.id,
      email: user.email.replace(/(.{2}).*@/, "$1***@"), // Mask email
      role: user.role,
      isActive: user.isActive,
    };

    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      user: sanitizedUser,
      databaseUser: dbUser ? {
        role: dbUser.role,
        isActive: dbUser.isActive,
      } : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.api("Debug user endpoint failed", {
      method: "GET",
      path: "/api/debug-user",
      userId: user.id,
      statusCode: 500,
      error: error instanceof Error ? error : new Error(String(error))
    });
    
    return NextResponse.json({
      success: false,
      error: "Internal server error",
    }, { status: 500 });
  }
}

// Export protected endpoint - admin only
export const GET = withAuth(requireAdmin())(debugUser);
