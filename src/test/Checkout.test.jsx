import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Checkout from '../pages/Checkout'

vi.mock('../api/stripeApi', () => ({
    createCheckoutSession: vi.fn()
}))

import { createCheckoutSession } from '../api/stripeApi'

describe('Checkout', () => {
    it('renders redirecting message on load', () => {
        createCheckoutSession.mockReturnValue(new Promise(() => { }))
        render(<MemoryRouter><Checkout /></MemoryRouter>)
        expect(screen.getByText(/redirecting to checkout/i)).toBeInTheDocument()
    })

    it('renders error message when checkout session fails', async () => {
        createCheckoutSession.mockRejectedValue(new Error())
        render(<MemoryRouter><Checkout /></MemoryRouter>)
        await waitFor(() => {
            expect(screen.getByText(/unable to start checkout/i)).toBeInTheDocument()
        })
    })
})