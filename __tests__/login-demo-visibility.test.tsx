import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock next/navigation router to avoid actual navigation during tests
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

// Mock auth context to avoid real Supabase interactions
vi.mock('@/lib/auth/context', () => ({
  useAuth: () => ({
    user: null,
    signIn: vi.fn().mockResolvedValue({ error: null }),
  }),
}))

// Import the component under test AFTER mocks
import LoginPage from '@/app/auth/login/page'

// Helper to set env var at runtime
const setEnv = (key: string, value?: string) => {
  if (value === undefined) {
    delete (process.env as any)[key]
  } else {
    (process.env as any)[key] = value
  }
}

describe('LoginPage demo accounts visibility', () => {
  beforeEach(() => {
    // Ensure tests start with no flag
    setEnv('NEXT_PUBLIC_SHOW_DEMO_LOGINS')
  })

  it('does NOT show demo accounts when flag is missing/false', () => {
    render(<LoginPage />)
    const demoHeading = screen.queryByText(/Demo Accounts \(Password: password123\)/i)
    expect(demoHeading).toBeNull()
  })

  it('shows demo accounts when NEXT_PUBLIC_SHOW_DEMO_LOGINS=true', () => {
    setEnv('NEXT_PUBLIC_SHOW_DEMO_LOGINS', 'true')
    render(<LoginPage />)
    const demoHeading = screen.getByText(/Demo Accounts \(Password: password123\)/i)
    expect(demoHeading).toBeInTheDocument()
  })
})
