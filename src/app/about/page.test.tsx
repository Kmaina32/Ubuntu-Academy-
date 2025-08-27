
import { render, screen } from '@testing-library/react'
import AboutPage from './page'

// Mock the Header and Footer components to isolate the page content for testing
jest.mock('@/components/Header', () => ({
  Header: () => <header>Mocked Header</header>,
}))

jest.mock('@/components/Footer', () => ({
  Footer: () => <footer>Mocked Footer</footer>,
}))

describe('AboutPage', () => {
  it('renders the main heading', () => {
    render(<AboutPage />)
    const heading = screen.getByRole('heading', { name: /About UbuntuAcademy/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders the mission and courses sections', () => {
    render(<AboutPage />)
    expect(screen.getByText('Our Mission')).toBeInTheDocument()
    expect(screen.getByText('Our Courses')).toBeInTheDocument()
  })

  it('renders the "Explore Our Courses" button', () => {
    render(<AboutPage />)
    const button = screen.getByRole('link', { name: /Explore Our Courses/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('href', '/')
  })
})
