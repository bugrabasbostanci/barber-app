import { prisma } from '@/lib/prisma';
import { NextRequest } from "next/server";
import { withAuth, requireAuth, AuthenticatedUser } from "@/lib/middleware/api-auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { withRateLimit, rateLimiters } from "@/lib/middleware/rate-limit";
import { withCORS } from "@/lib/middleware/cors";
import { ApiResponseBuilder } from "@/lib/api/response";
import { ValidationError } from "@/lib/errors";
import { logger } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

// GET - Fetch user profile
async function getProfileHandler(
  request: NextRequest, 
  context: Record<string, unknown> = {}
) {
  const user = context.user as AuthenticatedUser;

    // Get user profile from database
    let userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // If user doesn't exist in our database but is authenticated, create them
    if (!userProfile) {
      console.log(`Creating new user in database for: ${user.email} (ID: ${user.id})`);
      
      // Check if this is a demo user by email
      const existingDemoUser = await prisma.user.findFirst({
        where: { email: user.email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      });

      if (existingDemoUser) {
        console.log(`Found existing demo user by email: ${existingDemoUser.email} (DB ID: ${existingDemoUser.id}, Auth ID: ${user.id})`);
        
        // We'll create a new user with the correct Supabase ID and copy the demo user's data
        // First, we need to handle any foreign key constraints by updating related records
        try {
          // Update appointments table if any
          await prisma.appointment.updateMany({
            where: { 
              OR: [
                { customerId: existingDemoUser.id },
                { staffId: existingDemoUser.id }
              ]
            },
            data: { 
              customerId: existingDemoUser.role === 'CUSTOMER' ? user.id : undefined,
              staffId: existingDemoUser.role !== 'CUSTOMER' ? user.id : undefined
            },
          });

          // Update unavailable times if any
          await prisma.employeeUnavailableTime.updateMany({
            where: { staffId: existingDemoUser.id },
            data: { staffId: user.id },
          });

          // Create new user with Supabase Auth ID
          userProfile = await prisma.user.create({
            data: {
              id: user.id,
              email: existingDemoUser.email,
              firstName: existingDemoUser.firstName,
              lastName: existingDemoUser.lastName,
              phone: existingDemoUser.phone,
              role: existingDemoUser.role,
            },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              role: true,
              createdAt: true,
            },
          });

          // Delete the old demo user record
          await prisma.user.delete({
            where: { id: existingDemoUser.id },
          });

          console.log(`Successfully migrated demo user: ${userProfile.email}`);
        } catch (migrationError) {
          console.error(`Migration failed for ${user.email}:`, migrationError);
          
          // Fallback: Just return the existing demo user data but with Supabase ID
          // This won't persist but at least the user can proceed
          userProfile = {
            ...existingDemoUser,
            id: user.id, // Use Supabase ID for session
          };
          console.log(`Using fallback approach for user: ${userProfile.email}`);
        }
      } else {
        // Create new user
        userProfile = await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            phone: null,
            role: "CUSTOMER",
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            createdAt: true,
          },
        });
        console.log(`Created new user: ${userProfile.email}`);
      }
    }

  return ApiResponseBuilder.success({
    ...userProfile,
    createdAt: userProfile.createdAt.toISOString(),
  });
}

export const GET = withCORS(
  withErrorHandler(
    withRateLimit(rateLimiters.api)(
      withAuth(requireAuth())(getProfileHandler)
    )
  )
);

// PATCH - Update user profile (partial update)
async function patchProfileHandler(
  request: NextRequest, 
  context: Record<string, unknown> = {}
) {
  const user = context.user as AuthenticatedUser;

    const body = await request.json();
    const updateData: {
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
    } = {};

    // Only update fields that are provided
    if (body.firstName !== undefined) {
      updateData.firstName = body.firstName?.trim() || null;
    }
    if (body.lastName !== undefined) {
      updateData.lastName = body.lastName?.trim() || null;
    }
    if (body.phone !== undefined) {
      updateData.phone = body.phone?.trim() || null;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

  return ApiResponseBuilder.success({
    ...updatedUser,
    createdAt: updatedUser.createdAt.toISOString(),
  });
}

export const PATCH = withCORS(
  withErrorHandler(
    withRateLimit(rateLimiters.api)(
      withAuth(requireAuth())(patchProfileHandler)
    )
  )
);

// PUT - Update user profile  
async function putProfileHandler(
  request: NextRequest, 
  context: Record<string, unknown> = {}
) {
  const user = context.user as AuthenticatedUser;

  const { firstName, lastName, phone } = await request.json();

  // Validate input
  if (!firstName || !lastName) {
    throw new ValidationError([{
      code: 'required_fields',
      message: 'Ad ve soyad gereklidir'
    }]);
  }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || null,
        // Note: Email updates are handled separately for security reasons
        // We don't update email here as it requires special verification
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

  return ApiResponseBuilder.success({
    ...updatedUser,
    createdAt: updatedUser.createdAt.toISOString(),
  });
}

export const PUT = withCORS(
  withErrorHandler(
    withRateLimit(rateLimiters.api)(
      withAuth(requireAuth())(putProfileHandler)
    )
  )
);

// DELETE - Delete user account
async function deleteProfileHandler(
  request: NextRequest, 
  context: Record<string, unknown> = {}
) {
  const user = context.user as AuthenticatedUser;
  const supabase = await createClient();

    // Start a transaction to delete user data
    await prisma.$transaction(async (tx) => {
      // Delete user appointments first (foreign key constraints)
      await tx.appointment.deleteMany({
        where: { customerId: user.id }
      });

      // Delete user from our database
      await tx.user.delete({
        where: { id: user.id }
      });
    });

    // Delete user from Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      logger.api("Failed to delete user from Supabase Auth", {
        method: "DELETE",
        path: "/api/profile",
        statusCode: 500,
        error: deleteError
      });
      // Continue anyway as the user is already deleted from our database
    }

  return ApiResponseBuilder.success({
    message: "Hesabınız başarıyla silindi"
  });
}

export const DELETE = withCORS(
  withErrorHandler(
    withRateLimit(rateLimiters.api)(
      withAuth(requireAuth())(deleteProfileHandler)
    )
  )
);