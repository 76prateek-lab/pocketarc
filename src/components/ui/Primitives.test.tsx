import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Button, Dialog, Dropdown, Input, Switch, Tooltip } from './index'

describe('design-system primitives', () => {
  it('supports button disabled state', () => {
    const onClick = vi.fn(); render(<Button disabled onClick={onClick}>Save</Button>); fireEvent.click(screen.getByRole('button', { name: 'Save' })); expect(onClick).not.toHaveBeenCalled()
  })

  it('associates input errors accessibly', () => {
    render(<Input label="Save name" error="Name is required"/>); const input = screen.getByRole('textbox', { name: 'Save name' }); expect(input).toHaveAttribute('aria-invalid', 'true'); expect(input).toHaveAccessibleDescription('Name is required')
  })

  it('toggles a switch with its accessible state', () => {
    function Example() { const [checked, setChecked] = useState(false); return <Switch label="Touch controls" checked={checked} onChange={setChecked}/> }
    render(<Example/>); const control = screen.getByRole('switch', { name: 'Touch controls' }); fireEvent.click(control); expect(control).toHaveAttribute('aria-checked', 'true')
  })

  it('opens a dropdown from the keyboard and selects an item', () => {
    const onSelect = vi.fn(); render(<Dropdown label="Actions" items={[{ label: 'Open', onSelect }]}/>); const trigger = screen.getByRole('button', { name: /Actions/ }); fireEvent.keyDown(trigger, { key: 'ArrowDown' }); const item = screen.getByRole('menuitem', { name: 'Open' }); expect(item).toHaveFocus(); fireEvent.click(item); expect(onSelect).toHaveBeenCalledOnce()
  })

  it('closes dialogs with Escape and restores trigger focus', () => {
    function Example() { const [open, setOpen] = useState(false); return <><Button onClick={() => setOpen(true)}>Open</Button><Dialog open={open} onClose={() => setOpen(false)} title="Confirm"><Button>Inside</Button></Dialog></> }
    render(<Example/>); const trigger = screen.getByRole('button', { name: 'Open' }); trigger.focus(); fireEvent.click(trigger); expect(screen.getByRole('dialog', { name: 'Confirm' })).toBeInTheDocument(); fireEvent.keyDown(document, { key: 'Escape' }); expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); expect(trigger).toHaveFocus()
  })

  it('connects tooltip content to its trigger', () => {
    render(<Tooltip content="More information"><button type="button">Info</button></Tooltip>); expect(screen.getByRole('button', { name: 'Info' })).toHaveAccessibleDescription('More information')
  })
})
