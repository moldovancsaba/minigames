import { render, screen } from '@testing-library/react'
import ProjectsLayout from '../layout'

describe('ProjectsLayout', () => {
  it('renders children within the layout', () => {
    render(
      <ProjectsLayout>
        <div data-testid="test-child">Test Content</div>
      </ProjectsLayout>
    )
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  // Add more tests as layout functionality expands
})
