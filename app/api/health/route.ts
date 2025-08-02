import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/prisma';
import { withErrorHandler } from '@/lib/middleware/error-handler';

async function healthCheckHandler() {
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
  
  const isHealthy = health.checks.database.status === 'healthy';
  
  return NextResponse.json(health, { 
    status: isHealthy ? 200 : 503 
  });
}

export const GET = withErrorHandler(healthCheckHandler);