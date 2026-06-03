import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'

const mockNavigate = vi.fn()
const mockSignIn = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({ signIn: mockSignIn })
}))

describe('Login', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the Eternatel title', () => {
        render(<MemoryRouter><Login /></MemoryRouter>)
        expect(screen.getByText('Eternatel')).toBeInTheDocument()
    })

    it('renders the Deathcare CMS subtitle', () => {
        render(<MemoryRouter><Login /></MemoryRouter>)
        expect(screen.getByText('Deathcare CMS')).toBeInTheDocument()
    })

    it('renders email input, password input, and sign in button', () => {
        render(<MemoryRouter><Login /></MemoryRouter>)
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    })

    it('calls signIn with email and password on submit', async () => {
        mockSignIn.mockResolvedValue({ error: null })
        render(<MemoryRouter><Login /></MemoryRouter>)

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith('test@test.com', 'password123')
        })
    })

    it('navigates to /statements on successful sign in', async () => {
        mockSignIn.mockResolvedValue({ error: null })
        render(<MemoryRouter><Login /></MemoryRouter>)

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/statements')
        })
    })

    it('shows error message on failed sign in', async () => {
        mockSignIn.mockResolvedValue({ error: { message: 'Invalid login credentials' } })
        render(<MemoryRouter><Login /></MemoryRouter>)

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } })
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

        await waitFor(() => {
            expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
        })
    })

    it('renders a link to the signup page', () => {
        render(<MemoryRouter><Login /></MemoryRouter>)
        expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument()
    })
})