import { checkDatabaseHealth } from '@/lib/prisma';
import { withAuth, requireAuth, AuthenticatedUser } from "@/lib/middleware/api-auth";
import { withErrorHandler } from '@/lib/middleware/error-handler';
import { withStrictCORS } from "@/lib/middleware/cors";
import { ApiResponseBuilder } from "@/lib/api/response";

async function healthCheckHandler() {
  // Authentication handled by middleware
  const health = {
    status: 'healthy',
    timestamp: new Date(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    checks: {
      database: await checkDatabaseHealth(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    }
  };
  
  return ApiResponseBuilder.success(health);
}

export const GET = withStrictCORS(
  withErrorHandler(
    withAuth(requireAuth())(async (req, context) => {
      const user = context?.user as AuthenticatedUser;
      
      // Check if user is admin
      if (user?.role !== 'ADMIN') {
        throw new Error('Admin access required');
      }

      return healthCheckHandler();
    })
  )
);