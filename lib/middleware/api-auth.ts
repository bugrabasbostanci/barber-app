import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

// Auth error types
export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AuthError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

// Authenticated user type
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  firstName: string | null;
  lastName: string | null;
}

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createClient();

    // Use getUser() instead of getSession() for security as recommended by Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("Auth user error:", userError?.message || "No user found");
      return null;
    }

    console.log(
      `Auth middleware: Checking user ${user.email} (ID: ${user.id})`
    );

    // Get user role and details from database by ID first
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!dbUser) {
      console.log(
        `User not found by ID (${user.id}), checking by email (${user.email})`
      );

      // Try to find by email (for demo users that might have different IDs)
      dbUser = await prisma.user.findFirst({
        where: { email: user.email },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          firstName: true,
          lastName: true,
        },
      });

      if (dbUser) {
        console.log(
          `Found user by email: ${dbUser.email} (DB ID: ${dbUser.id} vs Auth ID: ${user.id})`
        );
        // Return the user with the Supabase Auth ID for consistency
        return {
          id: user.id, // Use Supabase Auth ID
          email: dbUser.email,
          role: dbUser.role,
          isActive: dbUser.isActive,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
        };
      }

      console.log(`User not found in database by email either: ${user.email}`);
      return null;
    }

    console.log(
      `Found user in database: ${dbUser.email} (role: ${dbUser.role})`
    );

    return {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      isActive: dbUser.isActive,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
    };
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return null;
  }
}

/**
 * Require authentication middleware
 */
export function requireAuth() {
  return async (): Promise<AuthenticatedUser> => {
    const user = await getAuthenticatedUser();

    if (!user) {
      throw new UnauthorizedError("Authentication required");
    }

    if (!user.isActive) {
      throw new ForbiddenError("Account is inactive");
    }

    return user;
  };
}

/**
 * Require specific roles middleware
 */
export function requireRoles(allowedRoles: Role[]) {
  return async (): Promise<AuthenticatedUser> => {
    const user = await requireAuth()();

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenError(
        `Access denied. Required roles: ${allowedRoles.join(", ")}`
      );
    }

    return user;
  };
}

/**
 * Require customer role
 */
export function requireCustomer() {
  return requireRoles(["CUSTOMER"]);
}

/**
 * Require barber or admin role
 */
export function requireBarber() {
  return requireRoles(["BARBER", "ADMIN"]);
}

/**
 * Require admin role only
 */
export function requireAdmin() {
  return requireRoles(["ADMIN"]);
}

/**
 * Require staff (employee, barber, or admin)
 */
export function requireStaff() {
  return requireRoles(["EMPLOYEE", "BARBER", "ADMIN"]);
}

// Middleware composition types
export type AuthMiddleware = () => Promise<AuthenticatedUser | null>;
export type ApiHandler = (
  req: NextRequest,
  context?: Record<string, unknown>
) => Promise<NextResponse>;

/**
 * Compose middleware with API handler
 */
export function withAuth(authMiddleware: AuthMiddleware) {
  return (handler: ApiHandler) => {
    return async (req: NextRequest) => {
      try {
        const user = await authMiddleware();
        return await handler(req, { user });
      } catch (error) {
        if (error instanceof AuthError) {
          return NextResponse.json(
            {
              success: false,
              error: error.message,
              code: error.constructor.name.toUpperCase(),
            },
            { status: error.statusCode }
          );
        }

        // Log unexpected errors
        console.error("Unexpected auth error:", error);
        return NextResponse.json(
          { success: false, error: "Internal server error" },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * Multiple middleware composition
 */
export function withMiddleware(middlewares: AuthMiddleware[]) {
  return (handler: ApiHandler) => {
    return async (req: NextRequest) => {
      try {
        let user: AuthenticatedUser | null = null;

        // Run all middlewares in sequence
        for (const middleware of middlewares) {
          user = await middleware();
        }

        return await handler(req, { user });
      } catch (error) {
        if (error instanceof AuthError) {
          return NextResponse.json(
            {
              success: false,
              error: error.message,
              code: error.constructor.name.toUpperCase(),
            },
            { status: error.statusCode }
          );
        }

        console.error("Unexpected middleware error:", error);
        return NextResponse.json(
          { success: false, error: "Internal server error" },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * Optional auth - doesn't throw if user is not authenticated
 */
export function optionalAuth() {
  return async (): Promise<AuthenticatedUser | null> => {
    return await getAuthenticatedUser();
  };
}

/**
 * Resource ownership middleware - ensure user can only access their own resources
 */
export function requireOwnership(
  getUserIdFromRequest: (req: NextRequest) => string | Promise<string>
) {
  return async (req: NextRequest): Promise<AuthenticatedUser> => {
    const user = await requireAuth()();
    const resourceUserId = await getUserIdFromRequest(req);

    // Admins can access any resource
    if (user.role === "ADMIN") {
      return user;
    }

    // Check ownership
    if (user.id !== resourceUserId) {
      throw new ForbiddenError("You can only access your own resources");
    }

    return user;
  };
}
