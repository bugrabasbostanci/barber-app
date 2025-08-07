import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/middleware/error-handler';
import { withCSRF, CSRFProtection } from '@/lib/middleware/csrf';
import { ApiResponseBuilder } from '@/lib/api/response';

async function getCSRFTokenHandler(_request: NextRequest) {
  // Generate a new CSRF token for the client
  const token = CSRFProtection.generateToken();
  
  const response = ApiResponseBuilder.success({
    token,
    message: 'CSRF token generated successfully',
  });
  
  // Set the hashed token in cookie
  CSRFProtection.setTokenCookie(response, token);
  
  return response;
}

// Export GET endpoint with CSRF middleware (will set token in cookie)
export const GET = withErrorHandler(
  withCSRF()(getCSRFTokenHandler)
);