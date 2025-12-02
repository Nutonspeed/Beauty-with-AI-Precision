'use client'

import React from 'react'
import { AlertTriangle, WifiOff, Cpu } from 'lucide-react'

interface ErrorFallbackProps {
  error?: Error
  reset?: () => void
  resetError?: () => void
}

// Generic Error Fallback
export function GenericErrorFallback({ error, reset, resetError }: ErrorFallbackProps) {
  const handleReset = () => {
    if (reset) reset()
    if (resetError) resetError()
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 text-center mb-4">
          {error?.message || 'An unexpected error occurred'}
        </p>
        {reset && (
          <button
            onClick={handleReset}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

// Network Error Fallback
export function NetworkErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-4">
          <WifiOff className="w-6 h-6 text-yellow-600" />
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
          Connection error
        </h2>
        <p className="text-gray-600 text-center mb-4">
          Unable to connect to the server. Please check your internet connection.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Reload page
        </button>
      </div>
    </div>
  )
}

// AI Service Error Fallback
export function AIServiceErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
          <Cpu className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
          AI service unavailable
        </h2>
        <p className="text-gray-600 text-center mb-4">
          The AI analysis service is temporarily unavailable. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
