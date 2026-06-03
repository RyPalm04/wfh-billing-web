import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Signup from '../pages/Signup'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../supabaseClient', () => ({
    supabase: {
        auth: {
            signUp: vi.fn()
        }
    }
}))

describe('Signup', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the Eternatel title', () => {
        render(<MemoryRouter><Signup /></MemoryRouter>)
        expect(screen.getByText('Eternatel')).toBeInTheDocument()
    })

    it('renders funeral home name, email, and password inputs', () => {
        render(<MemoryRouter><Signup /></MemoryRouter>)
        expect(screen.getByLabelText('Funeral Home Name')).toBeInTheDocument()
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('calls signUp with email, password, and funeral home name on submit', async () => {
        supabase.auth.signUp.mockResolvedValue({ data: {}, error: null })
        render(<MemoryRouter><Signup /></MemoryRouter>)

        fireEvent.change(screen.getByLabelText('Funeral Home Name'), { target: { value: 'Smith Funeral Home' } })
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
        fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

        await waitFor(() => {
            expect(supabase.auth.signUp).toHaveBeenCalledWith({
                email: 'test@test.com',
                password: 'password123',
                options: { data: { funeral_home_name: 'Smith Funeral Home' } }
            })
        })
    })

    it('shows confirmation message after successful signup', async () => {
        supabase.auth.signUp.mockResolvedValue({ data: {}, error: null })
        render(<MemoryRouter><Signup /></MemoryRouter>)

        fireEvent.change(screen.getByLabelText('Funeral Home Name'), { target: { value: 'Smith Funeral Home' } })
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
        fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

        await waitFor(() => {
            expect(screen.getByText(/check your email/i)).toBeInTheDocument()
        })
    })

    it('shows error message on failed signup', async () => {
        supabase.auth.signUp.mockResolvedValue({ data: {}, error: { message: 'User already registered' } })
        render(<MemoryRouter><Signup /></MemoryRouter>)

        fireEvent.change(screen.getByLabelText('Funeral Home Name'), { target: { value: 'Smith Funeral Home' } })
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
        fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

        await waitFor(() => {
            expect(screen.getByText('User already registered')).toBeInTheDocument()
        })
    })

    it('renders a link back to the login page', () => {
        render(<MemoryRouter><Signup /></MemoryRouter>)
        expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
    })
})