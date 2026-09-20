import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { GamePage } from './GamePage'
import { fixtureGames } from '@/test/fixtures/games'

function renderGame() { return render(<MemoryRouter initialEntries={['/game/aurora-circuit']}><Routes><Route path="/game/:gameId" element={<GamePage game={fixtureGames[0]}/>}/><Route path="/" element={<p>Library route</p>}/></Routes></MemoryRouter>) }

describe('GamePage', () => {
  it('renders fixture metadata', () => { renderGame(); expect(screen.getByRole('heading', { name: 'Aurora Circuit' })).toBeInTheDocument(); expect(screen.getByText('Northstar Works')).toBeInTheDocument(); expect(screen.getByRole('button', { name: /Continue/ })).toBeInTheDocument() })
  it('requires confirmation before deletion', () => { renderGame(); fireEvent.click(screen.getByRole('button', { name: /Delete game/ })); expect(screen.getByRole('dialog', { name: 'Delete Aurora Circuit?' })).toBeInTheDocument(); fireEvent.click(screen.getByRole('button', { name: 'Cancel' })); expect(screen.queryByRole('dialog')).not.toBeInTheDocument() })
})
