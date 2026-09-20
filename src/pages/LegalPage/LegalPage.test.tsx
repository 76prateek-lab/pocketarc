import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CopyrightPage, PrivacyPage, TermsPage } from './LegalPage'

describe('legal pages', () => {
  it('states the personal-use and non-redistribution terms without presenting education as automatic fair use', () => {
    render(<MemoryRouter><TermsPage/></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Terms and Conditions' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Strict non-redistribution rule' })).toBeInTheDocument()
    expect(screen.getByText(/statement of purpose, not a legal conclusion/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy')
  })

  it('explains local storage, hosting logs, deletion, and user controls', () => {
    render(<MemoryRouter><PrivacyPage/></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Information stored on your device' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Hosting and standard request logs' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Retention and your controls' })).toBeInTheDocument()
  })

  it('provides a standalone copyright and educational-use disclaimer', () => {
    render(<MemoryRouter><CopyrightPage/></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Copyright & Disclaimer' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Strict non-distribution requirement' })).toBeInTheDocument()
    expect(screen.getByText(/do not automatically make every use lawful/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Terms and Conditions' })).toHaveAttribute('href', '/terms')
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy')
  })
})
