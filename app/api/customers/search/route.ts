import { prisma } from '@/lib/prisma';
import { NextRequest } from "next/server";
import { withAuth, requireBarber } from "@/lib/middleware/api-auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";

async function searchCustomersHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return ApiResponseBuilder.success([]);
  }

  // Search customers by name or phone
  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      isActive: true,
      OR: [
        {
          firstName: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          phone: {
            contains: query,
          },
        },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
    orderBy: [
      { firstName: 'asc' },
      { lastName: 'asc' },
    ],
    take: 10, // Limit results
  });

  return ApiResponseBuilder.success(customers);
}

export const GET = withErrorHandler(withAuth(requireBarber())(searchCustomersHandler));