'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Calendar, Plus, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function MyAppointmentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log appointments-specific errors
    console.error('My Appointments Error:', error)
    
    // Track appointment management errors
  }, [error])

  // Appointments-specific error handling
  const getAppointmentsErrorInfo = () => {
    const message = error.message.toLowerCase()
    
    if (message.includes('cancel') || message.includes('iptal')) {
      return {
        title: 'Appointment Cancellation Error',
        description: 'An error occurred while cancelling your appointment.',
        icon: <Calendar className="w-8 h-8 text-red-600" />,
        suggestions: [
          'Make sure the appointment cancellation deadline has not passed (up to 2 hours before)',
          'Check your internet connection',
          'Refresh the page and try again'
        ]
      }
    } else if (message.includes('load') || message.includes('fetch') || message.includes('loading')) {
      return {
        title: 'Cannot Load Appointments',
        description: 'An error occurred while loading your appointments.',
        icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
        suggestions: [
          'Check your internet connection',
          'Refresh the page',
          'Wait a few minutes and try again'
        ]
      }
    } else {
      return {
        title: 'Appointment Management Problem',
        description: 'An unexpected error occurred while viewing your appointments.',
        icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
        suggestions: [
          'Refresh the page',
          'Log out and log back in',
          'Clear your browser cache'
        ]
      }
    }
  }

  const errorInfo = getAppointmentsErrorInfo()

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
          {/* Appointment management info */}
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-sm">Appointment rules:</p>
                <div className="text-xs space-y-1">
                  <div>• Appointments can be cancelled up to 2 hours before the appointment time</div>
                  <div>• Cancelled appointments appear in the &ldquo;Past&rdquo; tab</div>
                  <div>• Use the &ldquo;Book Appointment&rdquo; button to make new appointments</div>
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
              Reload Appointments
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline"
                size="sm"
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/book-appointment'} 
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Appointment
              </Button>
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-green-800 text-center">
              <strong>Reminder:</strong> Please arrive 15 minutes early for your appointment
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}