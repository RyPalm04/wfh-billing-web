import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SubscriptionInactive from '../pages/SubscriptionInactive'

const mockSignOut = vi.fn()

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({ signOut: mockSignOut })
}))

describe('SubscriptionInactive', () => {
    it('renders the Eternatel title', () => {
        render(<MemoryRouter><SubscriptionInactive /></MemoryRouter>)
        expect(screen.getByText('Eternatel')).toBeInTheDocument()
    })

    it('renders the Deathcare CMS subtitle', () => {
        render(<MemoryRouter><SubscriptionInactive /></MemoryRouter>)
        expect(screen.getByText('Deathcare CMS')).toBeInTheDocument()
    })

    it('renders a message about the inactive subscription', () => {
        render(<MemoryRouter><SubscriptionInactive /></MemoryRouter>)
        expect(screen.getByText(/subscription/i)).toBeInTheDocument()
    })

    it('renders a sign out button', () => {
        render(<MemoryRouter><SubscriptionInactive /></MemoryRouter>)
        expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
    })

    it('calls signOut when sign out is clicked', () => {
        render(<MemoryRouter><SubscriptionInactive /></MemoryRouter>)
        fireEvent.click(screen.getByRole('button', { name: /sign out/i }))
        expect(mockSignOut).toHaveBeenCalled()
    })
})