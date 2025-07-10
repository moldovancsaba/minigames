import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { DeleteOrganizationButton } from '@/components/client/organizations/DeleteOrganizationButton'
import { toast } from 'react-toastify'

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

// Mock window.location
const mockLocation = { href: window.location.href }
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/organizations',
}))

describe('Organization Deletion', () => {
  let testOrgId: string
  let testProjectId: string

  beforeAll(async () => {
    testOrgId = 'test-org-id'
    testProjectId = 'test-project-id'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('UI Integration Tests', () => {
    beforeEach(() => {
      // Reset mocks
      window.confirm = jest.fn(() => true)
      global.fetch = jest.fn(() => Promise.resolve({ ok: true }))
      jest.clearAllMocks()
    })

    it('should show confirmation dialog before deletion', async () => {
      render(<DeleteOrganizationButton organizationId={testOrgId} organizationName="Test Organization" />)
      
      const deleteButton = screen.getByRole('button', { name: /delete organization/i })
      await act(async () => {
        fireEvent.click(deleteButton)
      })
      
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this organization? This action cannot be undone.'
      )
    })

    it('should handle successful deletion in UI', async () => {
      render(<DeleteOrganizationButton organizationId={testOrgId} organizationName="Test Organization" />)
      
      const deleteButton = screen.getByRole('button', { name: /delete organization/i })
      await act(async () => {
        fireEvent.click(deleteButton)
      })
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Organization deleted successfully')
        expect(window.location.href).toBe('/organizations')
      })
    })

    it('should handle deletion errors in UI', async () => {
      // Mock API to simulate error
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Failed to delete'))
      
      render(<DeleteOrganizationButton organizationId={testOrgId} organizationName="Test Organization" />)
      
      const deleteButton = screen.getByRole('button', { name: /delete organization/i })
      await act(async () => {
        fireEvent.click(deleteButton)
      })
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Unable to process your request at this time. Please try again later.'
        )
      })
    })
  })
})
