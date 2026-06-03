import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'

vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn()
}))

import { useAuth } from '../context/AuthContext'

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders a loading indicator while loading', () => {
        useAuth.mockReturnValue({ session: null, loading: true })
        render(
            <MemoryRouter>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<div>Protected Content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        )
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('redirects to /login when there is no session', () => {
        useAuth.mockReturnValue({ session: null, loading: false })
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<div>Protected Content</div>} />
                    </Route>
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByText('Login Page')).toBeInTheDocument()
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('renders child route when session exists', () => {
        useAuth.mockReturnValue({ session: { user: { id: '123' } }, loading: false })
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<div>Protected Content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
})