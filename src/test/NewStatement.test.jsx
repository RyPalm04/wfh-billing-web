import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NewStatement from '../pages/NewStatement'
import * as statementApi from '../api/statementApi'
import * as catalogApi from '../api/catalogApi'

vi.mock('../api/statementApi', () => ({
    createStatement: vi.fn(),
    getNextControlNumber: vi.fn()
}))

vi.mock('../api/catalogApi', () => ({
    getCatalog: vi.fn(),
}))

const mockCatalog = {
    packages: [],
    services: [],
    merchandise: [],
    specialCharges: [],
    cashAdvances: []
}

const mockControlNumber = 123

describe('NewStatement', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows loading state initially', () => {
        catalogApi.getCatalog.mockReturnValue(new Promise(() => { }))
        render(
            <MemoryRouter>
                <NewStatement />
            </MemoryRouter>
        )
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('shows form after catalog loads', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(
            <MemoryRouter>
                <NewStatement />
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(screen.getByLabelText('Control Number')).toBeInTheDocument()
        })
    })

    it('shows error message when catalog fetch fails', async () => {
        catalogApi.getCatalog.mockRejectedValue(new Error('Network error'))
        render(
            <MemoryRouter>
                <NewStatement />
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(screen.getByText('Failed to load catalog')).toBeInTheDocument()
        })
    })

    it('submits form and shows success message', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        statementApi.createStatement.mockResolvedValue({ data: { controlNumber: mockControlNumber } })
        render(
            <MemoryRouter>
                <NewStatement />
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(screen.getByLabelText('Control Number')).toBeInTheDocument()
        })
        fireEvent.change(screen.getByLabelText('Services For Name'), { target: { value: 'Test Person' } })
        fireEvent.change(screen.getByLabelText('Service Date'), { target: { value: '2024-01-18' } })
        fireEvent.click(screen.getByText('Create Statement'))
        await waitFor(() => {
            expect(screen.getByText(`Statement #${mockControlNumber} created successfully!`)).toBeInTheDocument()
        })
    })

    it('shows error message when form submission fails', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.createStatement.mockRejectedValue(new Error('Network error'))
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(
            <MemoryRouter>
                <NewStatement />
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(screen.getByLabelText('Control Number')).toBeInTheDocument()
        })
        fireEvent.change(screen.getByLabelText('Services For Name'), { target: { value: 'Test Person' } })
        fireEvent.change(screen.getByLabelText('Service Date'), { target: { value: '2024-01-18' } })
        fireEvent.click(screen.getByText('Create Statement'))
        await waitFor(() => {
            expect(screen.getByText('Failed to create statement')).toBeInTheDocument()
        })
    })

    it('disables submit button while submitting', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.createStatement.mockReturnValue(new Promise(() => { }))
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(
            <MemoryRouter>
                <NewStatement />
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(screen.getByLabelText('Control Number')).toBeInTheDocument()
        })
        fireEvent.change(screen.getByLabelText('Services For Name'), { target: { value: 'Test Person' } })
        fireEvent.change(screen.getByLabelText('Service Date'), { target: { value: '2024-01-18' } })
        fireEvent.click(screen.getByText('Create Statement'))
        expect(screen.getByText('Create Statement')).toBeDisabled()
    })

    it('re-enables submit button after failed submission', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.createStatement.mockRejectedValue(new Error('Network error'))
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(
            <MemoryRouter>
                <NewStatement />
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(screen.getByLabelText('Control Number')).toBeInTheDocument()
        })
        fireEvent.change(screen.getByLabelText('Services For Name'), { target: { value: 'Test Person' } })
        fireEvent.change(screen.getByLabelText('Service Date'), { target: { value: '2024-01-18' } })
        fireEvent.click(screen.getByText('Create Statement'))
        await waitFor(() => {
            expect(screen.getByText('Create Statement')).not.toBeDisabled()
        })
    })

    it('pulls the next control number when the page loads', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(
            <MemoryRouter>
                <NewStatement />
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(screen.getByLabelText('Control Number')).toHaveValue(mockControlNumber.toString())
        })
    })

    it('pulls catalog data from the api when the page loads', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: { controlNumber: mockControlNumber } })
        render(
            <MemoryRouter>
                <NewStatement />
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(catalogApi.getCatalog).toHaveBeenCalled()
        })
    })
})