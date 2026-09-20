import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DEFAULT_KEYBOARD_MAPPING } from '@/input/mappings'
import { KeyboardLegend } from './KeyboardLegend'

describe('KeyboardLegend', () => {
  it('shows the current keyboard mapping in an accessible dialog', () => {
    render(<KeyboardLegend mapping={{ ...DEFAULT_KEYBOARD_MAPPING, A: 'KeyQ' }}/>)
    fireEvent.click(screen.getByRole('button', { name: 'Show keyboard controls' }))
    expect(screen.getByRole('dialog', { name: 'Keyboard controls' })).toBeVisible()
    expect(screen.getByText('A button').parentElement).toHaveTextContent('Q')
    expect(screen.getByText('Quick Save').parentElement).toHaveTextContent('F5')
  })
})
