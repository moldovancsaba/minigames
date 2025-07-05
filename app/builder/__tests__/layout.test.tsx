import { render, screen } from '@/test/test-utils'
import BuilderLayout from '../layout'

describe('BuilderLayout', () => {
  it('renders children within the layout', () => {
    render(
      <BuilderLayout>
        <div data-testid="test-child">Test Content</div>
      </BuilderLayout>
    )
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  // Add more layout-specific tests here as needed
})
