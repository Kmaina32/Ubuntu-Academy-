
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders the button with its children', () => {
    render(<Button>Click me</Button>)
    const buttonElement = screen.getByRole('button', { name: /click me/i })
    expect(buttonElement).toBeInTheDocument()
  })

  it('applies the correct variant class', () => {
    render(<Button variant="destructive">Delete</Button>)
    const buttonElement = screen.getByRole('button', { name: /delete/i })
    expect(buttonElement).toHaveClass('bg-destructive')
  })

  it('is disabled when the disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const buttonElement = screen.getByRole('button', { name: /disabled/i })
    expect(buttonElement).toBeDisabled()
  })
})
