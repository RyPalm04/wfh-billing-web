import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StatementList from '../pages/StatementList'
import * as statementApi from '../api/statementApi'

vi.mock('../api/statementApi', () => ({
    getStatements: vi.fn(),
}))

const mockStatements = [
    { id: 1, controlNumber: 101, servicesForName: 'John Doe', serviceDate: '2024-01-15', savedAt: '2024-01-15T10:00:00Z' },
    { id: 2, controlNumber: 102, servicesForName: 'Jane Smith', serviceDate: '2024-02-20', savedAt: '2024-02-20T10:00:00Z' },
    { id: 3, controlNumber: 103, servicesForName: 'Bob Johnson', serviceDate: '2024-03-10', savedAt: '2024-03-10T10:00:00Z' },
]

describe('StatementList', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows loading state initially', () => {
        statementApi.getStatements.mockReturnValue(new Promise(() => { }))
        render(<MemoryRouter><StatementList /></MemoryRouter>)
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders statements after load', async () => {
        statementApi.getStatements.mockResolvedValue({ data: mockStatements })
        render(<MemoryRouter><StatementList /></MemoryRouter>)
        await waitFor(() => {
            expect(screen.getByText(/#101 John Doe/i)).toBeInTheDocument()
            expect(screen.getByText(/#102 Jane Smith/i)).toBeInTheDocument()
            expect(screen.getByText(/#103 Bob Johnson/i)).toBeInTheDocument()
        })
    })

    it('shows error message when fetch fails', async () => {
        statementApi.getStatements.mockRejectedValue(new Error('Network error'))
        render(<MemoryRouter><StatementList /></MemoryRouter>)
        await waitFor(() => {
            expect(screen.getByText('Failed to load statements')).toBeInTheDocument()
        })
    })

    it('shows empty state when no statements exist', async () => {
        statementApi.getStatements.mockResolvedValue({ data: [] })
        render(<MemoryRouter><StatementList /></MemoryRouter>)
        await waitFor(() => {
            expect(screen.getByText(/No statements found/i)).toBeInTheDocument()
        })
    })

    it('renders search input and date filters', async () => {
        statementApi.getStatements.mockResolvedValue({ data: mockStatements })
        render(<MemoryRouter><StatementList /></MemoryRouter>)
        await waitFor(() => {
            expect(screen.getByLabelText(/Search/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/From/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/To/i)).toBeInTheDocument()
        })
    })

    it('filters by client name', async () => {
        statementApi.getStatements.mockResolvedValue({ data: mockStatements })
        render(<MemoryRouter><StatementList /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText(/Search/i)).toBeInTheDocument())
        fireEvent.change(screen.getByLabelText(/Search/i), { target: { value: 'Jane' } })
        expect(screen.getByText(/#102 Jane Smith/i)).toBeInTheDocument()
        expect(screen.queryByText(/#101 John Doe/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/#103 Bob Johnson/i)).not.toBeInTheDocument()
    })

    it('filters by control number', async () => {
        statementApi.getStatements.mockResolvedValue({ data: mockStatements })
        render(<MemoryRouter><StatementList /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText(/Search/i)).toBeInTheDocument())
        fireEvent.change(screen.getByLabelText(/Search/i), { target: { value: '103' } })
        expect(screen.getByText(/#103 Bob Johnson/i)).toBeInTheDocument()
        expect(screen.queryByText(/#101 John Doe/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/#102 Jane Smith/i)).not.toBeInTheDocument()
    })

    it('filters by date range', async () => {
        statementApi.getStatements.mockResolvedValue({ data: mockStatements })
        render(<MemoryRouter><StatementList /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText(/From/i)).toBeInTheDocument())
        fireEvent.change(screen.getByLabelText(/From/i), { target: { value: '2024-02-01' } })
        fireEvent.change(screen.getByLabelText(/To/i), { target: { value: '2024-02-28' } })
        expect(screen.getByText(/#102 Jane Smith/i)).toBeInTheDocument()
        expect(screen.queryByText(/#101 John Doe/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/#103 Bob Johnson/i)).not.toBeInTheDocument()
    })

    it('shows no results message when filter matches nothing', async () => {
        statementApi.getStatements.mockResolvedValue({ data: mockStatements })
        render(<MemoryRouter><StatementList /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText(/Search/i)).toBeInTheDocument())
        fireEvent.change(screen.getByLabelText(/Search/i), { target: { value: 'zzz' } })
        expect(screen.getByText(/No results/i)).toBeInTheDocument()
    })

    it('clears filter when input is cleared', async () => {
        statementApi.getStatements.mockResolvedValue({ data: mockStatements })
        render(<MemoryRouter><StatementList /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText(/Search/i)).toBeInTheDocument())
        fireEvent.change(screen.getByLabelText(/Search/i), { target: { value: 'Jane' } })
        fireEvent.change(screen.getByLabelText(/Search/i), { target: { value: '' } })
        expect(screen.getByText(/#101 John Doe/i)).toBeInTheDocument()
        expect(screen.getByText(/#102 Jane Smith/i)).toBeInTheDocument()
        expect(screen.getByText(/#103 Bob Johnson/i)).toBeInTheDocument()
    })
})