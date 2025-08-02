import { prisma } from '@/lib/prisma';
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";
import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

// GET - Fetch user profile
async function getProfileHandler() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError();
  }

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
      userProfile = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          firstName: user.user_metadata?.first_name || "",
          lastName: user.user_metadata?.last_name || "",
          phone: user.user_metadata?.phone || null,
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
    }

  return ApiResponseBuilder.success({
    ...userProfile,
    createdAt: userProfile.createdAt.toISOString(),
  });
}

export const GET = withErrorHandler(getProfileHandler);

// PATCH - Update user profile (partial update)
async function patchProfileHandler(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError();
  }

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

export const PATCH = withErrorHandler(patchProfileHandler);

// PUT - Update user profile  
async function putProfileHandler(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError();
  }

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

export const PUT = withErrorHandler(putProfileHandler);

// DELETE - Delete user account
async function deleteProfileHandler() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError();
  }

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

export const DELETE = withErrorHandler(deleteProfileHandler);