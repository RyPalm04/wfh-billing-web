import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import StatementDetail from '../pages/StatementDetail'
import * as statementApi from '../api/statementApi'

vi.mock('../api/statementApi', () => ({
    getStatement: vi.fn(),
    getStatementPdf: vi.fn(),
    updateStatement: vi.fn()
}))

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn()
    }
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: vi.fn()
    }
})

const mockStatement = {
    id: 1,
    controlNumber: 1,
    servicesForName: 'Test Person',
    serviceDate: '2024-01-18',
    payment: null,
    services: [],
    merchandise: [],
    specialCharges: [],
    cashAdvances: []

}

describe('StatementDetail', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows loading state initially', () => {
        statementApi.getStatement.mockReturnValue(new Promise(() => { }))
        render(
            <MemoryRouter initialEntries={['/statements/1']}>
                <StatementDetail />
            </MemoryRouter>
        )
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('shows statement data after successful fetch', async () => {
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        render(
            <MemoryRouter initialEntries={['/statements/1']}>
                <Routes>
                    <Route path="/statements/:id" element={<StatementDetail />} />
                </Routes>
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(screen.getByText('Test Person')).toBeInTheDocument()
        })
    })

    it('shows error messsage when fetch fails', async () => {
        statementApi.getStatement.mockRejectedValue(new Error('Network error'))
        render(
            <MemoryRouter initialEntries={['/statements/1']}>
                <Routes>
                    <Route path="/statements/:id" element={<StatementDetail />} />
                </Routes>
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(screen.getByText('Failed to load statement')).toBeInTheDocument()
        })
    })

    it('has a PDF download button', async () => {
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        render(
            <MemoryRouter initialEntries={['/statements/1']}>
                <Routes>
                    <Route path="/statements/:id" element={<StatementDetail />} />
                </Routes>
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument()
        })
    })

    it('has an edit button', async () => {
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        render(
            <MemoryRouter initialEntries={['/statements/1']}>
                <Routes>
                    <Route path="/statements/:id" element={<StatementDetail />} />
                </Routes>
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /^edit \(shift\+e\)$/i })).toBeInTheDocument()
        })
    })

    it('handles E press and opens down payment edit', async () => {
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        render(
            <MemoryRouter initialEntries={['/statements/1']}>
                <Routes>
                    <Route path="/statements/:id" element={<StatementDetail />} />
                </Routes>
            </MemoryRouter>
        )
        await waitFor(() => screen.getByText('Test Person'))
        fireEvent.keyDown(document, { key: 'e', code: 'KeyE' })
        expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
    })

    it('makes sure E does nothing when already editing', async () => {
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        render(
            <MemoryRouter initialEntries={['/statements/1']}>
                <Routes>
                    <Route path="/statements/:id" element={<StatementDetail />} />
                </Routes>
            </MemoryRouter>
        )
        await waitFor(() => screen.getByText('Test Person'))
        fireEvent.keyDown(document, { key: 'e', code: 'KeyE' })
        expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
        fireEvent.keyDown(document, { key: 'e', code: 'KeyE' })
        // Still only one input should be visible
        expect(screen.getAllByPlaceholderText('0.00').length).toBe(1)
    })

    it('handles Enter key press and saves down payment', async () => {
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        statementApi.updateStatement.mockResolvedValue({})
        render(
            <MemoryRouter initialEntries={['/statements/1']}>
                <Routes>
                    <Route path="/statements/:id" element={<StatementDetail />} />
                </Routes>
            </MemoryRouter>
        )
        await waitFor(() => screen.getByText('Test Person'))
        fireEvent.keyDown(document, { key: 'e', code: 'KeyE' })
        const input = screen.getByPlaceholderText('0.00')
        fireEvent.change(input, { target: { value: '500' } })
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
        await waitFor(() => {
            expect(statementApi.updateStatement).toHaveBeenCalledWith('1', expect.objectContaining({
                payment: '500'
            }))
        })
    })

    it('handles Escape key press, cancels down payment edit, and restores previous value', async () => {
        const statementWithPayment = {
            ...mockStatement,
            payment: '250.00'
        }

        statementApi.getStatement.mockResolvedValue({ data: statementWithPayment })
        render(
            <MemoryRouter initialEntries={['/statements/1']}>
                <Routes>
                    <Route path="/statements/:id" element={<StatementDetail />} />
                </Routes>
            </MemoryRouter>
        )
        await waitFor(() => screen.getByText('Test Person'))
        fireEvent.keyDown(document, { key: 'e', code: 'KeyE' })
        const input = screen.getByPlaceholderText('0.00')
        fireEvent.change(input, { target: { value: '500' } })
        fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })
        // Input should be gone and previous value should be shown
        expect(screen.queryByPlaceholderText('0.00')).not.toBeInTheDocument()
        expect(screen.getByText('$250.00')).toBeInTheDocument()
    })

    it('handles D press and triggers PDF download', async () => {
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        statementApi.getStatementPdf.mockResolvedValue({ data: new Blob(['PDF content'], { type: 'application/pdf' }) })
        render(
            <MemoryRouter initialEntries={['/statements/1']}>
                <Routes>
                    <Route path="/statements/:id" element={<StatementDetail />} />
                </Routes>
            </MemoryRouter>
        )
        await waitFor(() => screen.getByText('Test Person'))
        fireEvent.keyDown(document, { key: 'd', code: 'KeyD' })
        await waitFor(() => {
            expect(statementApi.getStatementPdf).toHaveBeenCalledWith('1')
        })
    })

    it('handles Shift+E press and navigates to edit page', async () => {
        const mockNavigate = vi.fn()
        useNavigate.mockReturnValue(mockNavigate)
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        render(
            <MemoryRouter initialEntries={['/statements/1']}>
                <Routes>
                    <Route path="/statements/:id" element={<StatementDetail />} />
                </Routes>
            </MemoryRouter>
        )
        await waitFor(() => screen.getByText('Test Person'))
        fireEvent.keyDown(document, { key: 'E', code: 'KeyE', shiftKey: true })
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/statements/1/edit')
        })
    })

})