import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'  
import Nav from '../components/Nav'


describe('Nav', () => {

    it('has a link to the statement list', () => {
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
})