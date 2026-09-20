import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { fixtureGames } from '@/test/fixtures/games'
import { sortGames } from '@/components/library/sortGames'
import { LibraryPage } from './LibraryPage'

function renderLibrary() { return render(<MemoryRouter><LibraryPage games={fixtureGames}/></MemoryRouter>) }

describe('LibraryPage', () => {
  it('filters fixture games by title', () => {
    renderLibrary(); fireEvent.change(screen.getByRole('textbox', { name: 'Search library' }), { target: { value: 'Aurora' } }); const library = screen.getByLabelText('My library games'); expect(within(library).getByRole('heading', { name: 'Aurora Circuit' })).toBeInTheDocument(); expect(within(library).queryByRole('heading', { name: 'Verdant Quest' })).not.toBeInTheDocument()
  })
  it('searches filenames without adding an unnecessary category filter', () => {
    renderLibrary(); fireEvent.change(screen.getByRole('textbox', { name: 'Search library' }), { target: { value: 'verdant-quest.gba' } }); expect(within(screen.getByLabelText('My library games')).getByRole('heading', { name: 'Verdant Quest' })).toBeInTheDocument(); expect(screen.queryByRole('combobox', { name: 'Filter games' })).not.toBeInTheDocument()
  })
  it('changes sort order', () => {
    renderLibrary(); fireEvent.change(screen.getByRole('combobox', { name: 'Sort games' }), { target: { value: 'a-z' } }); const titles = within(screen.getByLabelText('My library games')).getAllByRole('heading').map((heading) => heading.textContent); expect(titles[0]).toBe('Aurora Circuit'); expect(titles.at(-1)).toBe('Winter Post')
  })
  it('renders the required empty state', () => {
    render(<MemoryRouter><LibraryPage games={[]}/></MemoryRouter>); expect(screen.getByRole('heading', { name: 'Your library is empty' })).toBeInTheDocument(); expect(screen.getByRole('button', { name: /Import ROM/ })).toBeInTheDocument(); expect(screen.getByText('Import a GBA ROM to start playing. Your games stay on this device.')).toBeInTheDocument()
  })
  it('sorts by total playtime without mutating fixtures', () => {
    const first = fixtureGames[0]; const sorted = sortGames(fixtureGames, 'most-played'); expect(sorted[0].title).toBe('Moonfall Tactics'); expect(fixtureGames[0]).toBe(first)
  })
  it('uses deterministic title ordering when sort values tie', () => {
    const tied = [{ ...fixtureGames[0], id: 'z', title: 'Zulu', totalPlayTimeMs: 100 }, { ...fixtureGames[1], id: 'a', title: 'Alpha', totalPlayTimeMs: 100 }]; expect(sortGames(tied, 'most-played').map((game) => game.title)).toEqual(['Alpha', 'Zulu'])
  })
  it('handles hundreds of metadata records and narrows by filename', async () => {
    const manyGames = Array.from({ length: 400 }, (_, index) => ({ ...fixtureGames[index % fixtureGames.length], id: `game-${index}`, title: `Game ${index}`, fileName: `catalog-${index}.gba` })); render(<MemoryRouter><LibraryPage games={manyGames}/></MemoryRouter>); fireEvent.change(screen.getByRole('textbox', { name: 'Search library' }), { target: { value: 'catalog-399.gba' } }); const library = screen.getByLabelText('My library games'); expect(await within(library).findByRole('heading', { name: 'Game 399' })).toBeInTheDocument(); expect(within(library).getAllByRole('heading')).toHaveLength(1)
  })
})
