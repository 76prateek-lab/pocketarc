import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AboutPage } from './AboutPage'

describe('AboutPage', () => {
  it('explains the project, local-first principles, and responsible use', () => {
    render(<MemoryRouter><AboutPage/></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Your Game Boy Advance library, kept close.' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Local-first' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'What it is' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Read the Terms/ })).toHaveAttribute('href', '/terms')
  })
})
