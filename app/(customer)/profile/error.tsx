'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, User, Settings, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log profile-specific errors
    console.error('Profile Error:', error)
    
    // Track profile management errors
  }, [error])

  // Profile-specific error handling
  const getProfileErrorInfo = () => {
    const message = error.message.toLowerCase()
    
    if (message.includes('validation') || message.includes('phone') || message.includes('telefon')) {
      return {
        title: 'Information Validation Error',
        description: 'There is a problem with the information you entered.',
        icon: <Settings className="w-8 h-8 text-red-600" />,
        suggestions: [
          'Enter your phone number in the format 0532 123 45 67',
          'Do not leave the first and last name fields empty',
          'Use a valid email address'
        ]
      }
    } else if (message.includes('save') || message.includes('update') || message.includes('kaydet')) {
      return {
        title: 'Profile Save Error',
        description: 'An error occurred while saving your profile information.',
        icon: <User className="w-8 h-8 text-red-600" />,
        suggestions: [
          'Check your internet connection',
          'Make sure you have filled in all fields correctly',
          'Wait a few minutes and try again'
        ]
      }
    } else if (message.includes('auth') || message.includes('permission') || message.includes('yetki')) {
      return {
        title: 'Authorization Error',
        description: 'You do not have the necessary permission for this operation.',
        icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
        suggestions: [
          'Log out and log back in',
          'Refresh the page',
          'Make sure you are logged in with your account'
        ]
      }
    } else {
      return {
        title: 'Profile Operation Problem',
        description: 'An unexpected error occurred on the profile page.',
        icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
        suggestions: [
          'Refresh the page',
          'Clear your browser cookies',
          'Try a different browser'
        ]
      }
    }
  }

  const errorInfo = getProfileErrorInfo()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            {errorInfo.icon}
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {errorInfo.title}
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {errorInfo.description}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile form guidance */}
          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-sm">Profile information:</p>
                <div className="text-xs space-y-1">
                  <div>• <strong>First-Last Name:</strong> At least 2 characters, letters only</div>
                  <div>• <strong>Phone:</strong> In 0532 123 45 67 format</div>
                  <div>• <strong>Email:</strong> A valid email address</div>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Error suggestions */}
          <Alert>
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium text-sm">Solution suggestions:</p>
                <ul className="text-xs space-y-1 ml-2">
                  {errorInfo.suggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Development error details */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-xs text-red-800 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-1">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={reset} 
              className="w-full"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Profile
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              <strong>Security:</strong> Your personal information is securely protected
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}