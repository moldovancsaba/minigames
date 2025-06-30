import { render, screen } from '@testing-library/react'
import OrganizationsLayout from '../layout'

describe('OrganizationsLayout', () => {
  it('renders children within the layout', () => {
    render(
      <OrganizationsLayout>
        <div data-testid="test-child">Test Content</div>
      </OrganizationsLayout>
    )
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  // Add more tests as layout functionality expands
})
