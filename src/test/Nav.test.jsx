import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Nav from '../components/Nav'


describe('Nav', () => {

  it('has a link to the home screen', () => {
    render(
      <MemoryRouter>
        <Nav />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: /wright funeral home/i })).toBeInTheDocument()
  })

  it('has a link to the new statement page', () => {
    render(
      <MemoryRouter>
        <Nav />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: /new statement/i })).toBeInTheDocument()
  })

  it('shows the logo', () => {
    render(
      <MemoryRouter>
        <Nav />
      </MemoryRouter>
    )
    expect(screen.getByRole('img', { name: /wright funeral home logo/i })).toBeInTheDocument()
  })

  it('renders hamburger button with correct aria attributes', () => {
    render(<MemoryRouter><Nav /></MemoryRouter>)
    const button = screen.getByLabelText('Toggle navigation')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens nav menu when hamburger is clicked', () => {
    render(<MemoryRouter><Nav /></MemoryRouter>)
    fireEvent.click(screen.getByLabelText('Toggle navigation'))
    expect(screen.getByLabelText('Toggle navigation')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'View Statements' }).closest('.nav-actions')).toHaveClass('nav-actions--open')
  })

  it('closes nav menu when a link is clicked', () => {
    render(<MemoryRouter><Nav /></MemoryRouter>)
    fireEvent.click(screen.getByLabelText('Toggle navigation'))
    fireEvent.click(screen.getByRole('link', { name: 'View Statements' }))
    expect(screen.getByLabelText('Toggle navigation')).toHaveAttribute('aria-expanded', 'false')
  })
})