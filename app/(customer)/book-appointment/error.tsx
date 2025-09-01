'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Calendar, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function BookAppointmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log booking-specific errors
    console.error('Booking Error:', error)
    
    // Track booking funnel errors for analytics
    // This helps identify where customers drop off in booking process
  }, [error])

  // Booking-specific error handling
  const getBookingErrorInfo = () => {
    const message = error.message.toLowerCase()
    
    if (message.includes('staff') || message.includes('berber')) {
      return {
        title: 'Staff Selection Issue',
        description: 'An error occurred while loading staff information.',
        icon: <User className="w-8 h-8 text-red-600" />,
        suggestions: [
          'Refresh the page and try again',
          'Try selecting a different date',
          'Check your internet connection'
        ]
      }
    } else if (message.includes('time') || message.includes('slot') || message.includes('saat')) {
      return {
        title: 'Time Selection Issue',
        description: 'An error occurred while loading available time slots.',
        icon: <Clock className="w-8 h-8 text-red-600" />,
        suggestions: [
          'Try selecting a different date',
          'Try selecting a different barber',
          'Refresh the page and try again'
        ]
      }
    } else if (message.includes('submit') || message.includes('booking') || message.includes('randevu')) {
      return {
        title: 'Appointment Booking Issue',
        description: 'An error occurred while saving your appointment.',
        icon: <Calendar className="w-8 h-8 text-red-600" />,
        suggestions: [
          'Make sure your phone number is correct',
          'Make sure all required information is filled out',
          'Wait a few minutes and try again'
        ]
      }
    } else {
      return {
        title: 'Appointment Booking Process Issue',
        description: 'An unexpected error occurred during the appointment booking process.',
        icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
        suggestions: [
          'Refresh the page and start over',
          'Check your internet connection',
          'Update your browser'
        ]
      }
    }
  }

  const errorInfo = getBookingErrorInfo()

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
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
          {/* Booking process guidance */}
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-sm">Appointment booking process:</p>
                <div className="text-xs space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">1</div>
                    <span>Select date</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">2</div>
                    <span>Select barber</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">3</div>
                    <span>Select time</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">4</div>
                    <span>Confirm details</span>
                  </div>
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
              Continue Booking
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline"
              className="w-full"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              <strong>Working Hours:</strong> 09:30 - 21:30 (Closed on Sundays)
            </p>
            <p className="text-xs text-blue-700 text-center mt-1">
              Appointments last 45 minutes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}