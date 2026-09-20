import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GameCover } from './GameCover'
import { fixtureGames } from '@/test/fixtures/games'

describe('GameCover', () => {
  it('falls back without breaking layout when cover loading fails', () => {
    render(<GameCover labelled game={{ ...fixtureGames[0], coverUrl: '/missing-cover.png' }}/>)
    const image = screen.getByRole('img', { name: 'Aurora Circuit cover' })
    fireEvent.error(image)
    const fallback = screen.getByRole('img', { name: 'Aurora Circuit cover' })
    expect(fallback).toHaveAttribute('data-cover-fallback')
    expect(fallback).toHaveTextContent('AC')
  })
})
