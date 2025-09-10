
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders the footer with correct text and links', () => {
    render(<Footer />)

    // Check for the company name
    const companyName = screen.getByText(/Akili AI Academy/i)
    expect(companyName).toBeInTheDocument()

    // Check for the copyright notice
    const currentYear = new Date().getFullYear()
    const copyrightNotice = screen.getByText(`© ${currentYear} Akili AI Academy. All rights reserved.`)
    expect(copyrightNotice).toBeInTheDocument()

    // Check for the navigation links
    const termsLink = screen.getByRole('link', { name: /Terms/i })
    expect(termsLink).toBeInTheDocument()
    expect(termsLink).toHaveAttribute('href', '#')

    const privacyLink = screen.getByRole('link', { name: /Privacy/i })
    expect(privacyLink).toBeInTheDocument()
    expect(privacyLink).toHaveAttribute('href', '#')
  })
})
