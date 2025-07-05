import { render as rtlRender } from '@testing-library/react'
import { ReactElement } from 'react'

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      pathname: '/',
    }
  },
}))

// Mock useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth() {
    return {
      user: null,
      loading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
    }
  },
}))

function render(ui: ReactElement) {
  return rtlRender(ui)
}

export * from '@testing-library/react'
export { render }
