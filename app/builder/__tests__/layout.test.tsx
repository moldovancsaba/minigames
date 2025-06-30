import { render, screen } from '@testing-library/react'
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

  // Add more tests for builder-specific layout functionality
  it('includes image uploader component', () => {
    render(
      <BuilderLayout>
        <div>Content</div>
      </BuilderLayout>
    )
    
    expect(screen.getByTestId('image-uploader')).toBeInTheDocument()
  })
})
