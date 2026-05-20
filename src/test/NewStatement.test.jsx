import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NewStatement from '../pages/NewStatement'
import * as statementApi from '../api/statementApi'
import * as catalogApi from '../api/catalogApi'
import Shepherd from 'shepherd.js'
import toast from 'react-hot-toast'

vi.mock('../api/statementApi', () => ({
    createStatement: vi.fn(),
    getNextControlNumber: vi.fn()
}))

vi.mock('../api/catalogApi', () => ({
    getCatalog: vi.fn(),
}))

vi.mock('shepherd.js', () => ({
    default: { Tour: vi.fn() }
}))

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn()
    }
}))

const mockCatalog = {
    packages: [
        { id: 1, name: 'Basic Package', sortOrder: 1, defaultCost: '1200.00', serviceIds: [1] }
    ],
    services: [
        { id: 1, name: 'Embalming', sortOrder: 1, defaultCost: '450.00', includedInPackage: false }
    ],
    merchandise: [
        { id: 1, name: 'Casket', sortOrder: 1, defaultCost: '2500.00', requiresDescription: true, salesTaxable: true, pricingMode: 'FLAT' },
        { id: 2, name: 'Flower Arrangement', sortOrder: 2, defaultCost: null, requiresDescription: false, salesTaxable: true, pricingMode: 'FLAT' },
        { id: 3, name: 'Memorial Video', sortOrder: 3, defaultCost: '15.00', requiresDescription: true, salesTaxable: false, pricingMode: 'PER_UNIT' }
    ],
    specialCharges: [
        { id: 1, name: 'Death Certificate', sortOrder: 1, defaultCost: '25.00', requiresDescription: false },
        { id: 2, name: 'Mileage', sortOrder: 2, defaultCost: null, requiresDescription: true }
    ],
    cashAdvances: [
        { id: 1, name: 'Cemetery Opening', sortOrder: 1 }
    ]
}

const mockControlNumber = 123

describe('NewStatement', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
        Shepherd.Tour.mockImplementation(function() { return { addSteps: vi.fn(), start: vi.fn() } })
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
            expect(statementApi.createStatement).toHaveBeenCalled()
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
            expect(toast.error).toHaveBeenCalledWith('Failed to create statement')
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

    it('renders service items from catalog', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => {
            expect(screen.getByText('Embalming')).toBeInTheDocument()
        })
    })

    it('renders merchandise items from catalog', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => {
            expect(screen.getByText('Casket')).toBeInTheDocument()
        })
    })

    it('includes checked services in form submission', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        statementApi.createStatement.mockResolvedValue({ data: { controlNumber: mockControlNumber } })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText('Embalming')).toBeInTheDocument())
        fireEvent.click(screen.getByLabelText('Embalming'))
        fireEvent.change(screen.getByLabelText('Services For Name'), { target: { value: 'Test Person' } })
        fireEvent.change(screen.getByLabelText('Service Date'), { target: { value: '2024-01-18' } })
        fireEvent.click(screen.getByText('Create Statement'))
        await waitFor(() => {
            expect(statementApi.createStatement).toHaveBeenCalledWith(
                expect.objectContaining({
                    services: [{ serviceId: 1, inPackage: false }]
                })
            )
        })
    })

    it('includes checked merchandise in form submission', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        statementApi.createStatement.mockResolvedValue({ data: { controlNumber: mockControlNumber } })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText('Casket')).toBeInTheDocument())
        fireEvent.click(screen.getByLabelText('Casket'))
        fireEvent.change(screen.getByLabelText('Description for Casket'), { target: { value: 'Oak casket' } })
        fireEvent.change(screen.getByLabelText('Services For Name'), { target: { value: 'Test Person' } })
        fireEvent.change(screen.getByLabelText('Service Date'), { target: { value: '2024-01-18' } })
        fireEvent.click(screen.getByText('Create Statement'))
        await waitFor(() => {
            expect(statementApi.createStatement).toHaveBeenCalledWith(
                expect.objectContaining({
                    merchandise: [{ merchandiseId: 1, price: '2500.00', description: 'Oak casket' }]
                })
            )
        })
    })

    it('includes cash advance provider and amount in form submission', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        statementApi.createStatement.mockResolvedValue({ data: { controlNumber: mockControlNumber } })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText('Cemetery Opening')).toBeInTheDocument())
        fireEvent.click(screen.getByLabelText('Cemetery Opening'))
        fireEvent.change(screen.getByLabelText('Provider for Cemetery Opening'), { target: { value: 'Greenwood Cemetery' } })
        fireEvent.change(screen.getByLabelText('Amount for Cemetery Opening'), { target: { value: '1500.00' } })
        fireEvent.change(screen.getByLabelText('Services For Name'), { target: { value: 'Test Person' } })
        fireEvent.change(screen.getByLabelText('Service Date'), { target: { value: '2024-01-18' } })
        fireEvent.click(screen.getByText('Create Statement'))
        await waitFor(() => {
            expect(statementApi.createStatement).toHaveBeenCalledWith(
                expect.objectContaining({
                    cashAdvances: [{ cashAdvanceId: 1, provider: 'Greenwood Cemetery', amount: '1500.00' }]
                })
            )
        })
    })

    it('shows editable price field for merchandise with no default cost', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText('Flower Arrangement')).toBeInTheDocument())
        fireEvent.click(screen.getByLabelText('Flower Arrangement'))
        expect(screen.getByLabelText('Price for Flower Arrangement')).toBeInTheDocument()
    })

    it('shows description field for merchandise that requires one', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText('Casket')).toBeInTheDocument())
        fireEvent.click(screen.getByLabelText('Casket'))
        expect(screen.getByLabelText('Description for Casket')).toBeInTheDocument()
    })

    it('shows editable price field for special charge with no default cost', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText('Mileage')).toBeInTheDocument())
        fireEvent.click(screen.getByLabelText('Mileage'))
        expect(screen.getByLabelText('Price for Mileage')).toBeInTheDocument()
    })

    it('shows description field for special charge that requires one', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText('Mileage')).toBeInTheDocument())
        fireEvent.click(screen.getByLabelText('Mileage'))
        expect(screen.getByLabelText('Description for Mileage')).toBeInTheDocument()
    })

    it('renders package dropdown', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => {
            expect(screen.getByLabelText('Package')).toBeInTheDocument()
        })
    })

    it('selecting a package auto-checks included services with inPackage true', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        statementApi.createStatement.mockResolvedValue({ data: { controlNumber: mockControlNumber } })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText('Package')).toBeInTheDocument())
        fireEvent.change(screen.getByLabelText('Package'), { target: { value: '1' } })
        fireEvent.change(screen.getByLabelText('Services For Name'), { target: { value: 'Test Person' } })
        fireEvent.change(screen.getByLabelText('Service Date'), { target: { value: '2024-01-18' } })
        fireEvent.click(screen.getByText('Create Statement'))
        await waitFor(() => {
            expect(statementApi.createStatement).toHaveBeenCalledWith(
                expect.objectContaining({
                    packageId: 1,
                    services: [{ serviceId: 1, inPackage: true }]
                })
            )
        })
    })

    it('strips non-numeric characters from price inputs', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText('Flower Arrangement')).toBeInTheDocument())
        fireEvent.click(screen.getByLabelText('Flower Arrangement'))
        fireEvent.change(screen.getByLabelText('Price for Flower Arrangement'), { target: { value: 'abc' } })
        expect(screen.getByLabelText('Price for Flower Arrangement')).toHaveValue('')
    })

    it('formats price to 2 decimal places on blur', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText('Flower Arrangement')).toBeInTheDocument())
        fireEvent.click(screen.getByLabelText('Flower Arrangement'))
        fireEvent.change(screen.getByLabelText('Price for Flower Arrangement'), { target: { value: '25' } })
        fireEvent.blur(screen.getByLabelText('Price for Flower Arrangement'))
        expect(screen.getByLabelText('Price for Flower Arrangement')).toHaveValue('25.00')
    })

    it('shows quantity input for per-unit merchandise', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText('Memorial Video')).toBeInTheDocument())
        fireEvent.click(screen.getByLabelText('Memorial Video'))
        expect(screen.getByLabelText('Quantity for Memorial Video')).toBeInTheDocument()
    })

    it('calculates price from quantity for per-unit merchandise', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        statementApi.createStatement.mockResolvedValue({ data: { controlNumber: mockControlNumber } })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText('Memorial Video')).toBeInTheDocument())
        fireEvent.click(screen.getByLabelText('Memorial Video'))
        fireEvent.change(screen.getByLabelText('Quantity for Memorial Video'), { target: { value: '2' } })
        fireEvent.change(screen.getByLabelText('Services For Name'), { target: { value: 'Test Person' } })
        fireEvent.change(screen.getByLabelText('Service Date'), { target: { value: '2024-01-18' } })
        fireEvent.click(screen.getByText('Create Statement'))
        await waitFor(() => {
            expect(statementApi.createStatement).toHaveBeenCalledWith(
                expect.objectContaining({
                    merchandise: [{ merchandiseId: 3, price: '30.00', description: '' }]
                })
            )
        })
    })

    it('does not submit when variable-price merchandise has no price', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText('Flower Arrangement')).toBeInTheDocument())
        fireEvent.click(screen.getByLabelText('Flower Arrangement'))
        fireEvent.change(screen.getByLabelText('Services For Name'), { target: { value: 'Test Person' } })
        fireEvent.change(screen.getByLabelText('Service Date'), { target: { value: '2024-01-18' } })
        fireEvent.click(screen.getByText('Create Statement'))
        await waitFor(() => {
            expect(statementApi.createStatement).not.toHaveBeenCalled()
            expect(screen.getByText('Price required')).toBeInTheDocument()
        })
    })

    it('does not submit when merchandise with required description has no description', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText('Casket')).toBeInTheDocument())
        fireEvent.click(screen.getByLabelText('Casket'))
        fireEvent.change(screen.getByLabelText('Services For Name'), { target: { value: 'Test Person' } })
        fireEvent.change(screen.getByLabelText('Service Date'), { target: { value: '2024-01-18' } })
        fireEvent.click(screen.getByText('Create Statement'))
        await waitFor(() => {
            expect(statementApi.createStatement).not.toHaveBeenCalled()
            expect(screen.getByText('Description required')).toBeInTheDocument()
        })
    })

    it('does not submit when variable-price special charge has no price', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText('Mileage')).toBeInTheDocument())
        fireEvent.click(screen.getByLabelText('Mileage'))
        fireEvent.change(screen.getByLabelText('Services For Name'), { target: { value: 'Test Person' } })
        fireEvent.change(screen.getByLabelText('Service Date'), { target: { value: '2024-01-18' } })
        fireEvent.click(screen.getByText('Create Statement'))
        await waitFor(() => {
            expect(statementApi.createStatement).not.toHaveBeenCalled()
            expect(screen.getByText('Price required')).toBeInTheDocument()
        })
    })

    it('does not submit when special charge description is missing', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText('Mileage')).toBeInTheDocument())
        fireEvent.click(screen.getByLabelText('Mileage'))
        fireEvent.change(screen.getByLabelText('Price for Mileage'), { target: { value: '100.00' } })
        fireEvent.change(screen.getByLabelText('Services For Name'), { target: { value: 'Test Person' } })
        fireEvent.change(screen.getByLabelText('Service Date'), { target: { value: '2024-01-18' } })
        fireEvent.click(screen.getByText('Create Statement'))
        await waitFor(() => {
            expect(statementApi.createStatement).not.toHaveBeenCalled()
            expect(screen.getByText('Description required')).toBeInTheDocument()
        })
    })

    it('does not submit when cash advance amount is missing', async () => {
        // check Cemetery Opening, leave amount empty, fill servicesForName, click submit
        // same assertions
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText('Cemetery Opening')).toBeInTheDocument())
        fireEvent.click(screen.getByLabelText('Cemetery Opening'))
        fireEvent.change(screen.getByLabelText('Provider for Cemetery Opening'), { target: { value: 'Greenwood Cemetery' } })
        fireEvent.change(screen.getByLabelText('Services For Name'), { target: { value: 'Test Person' } })
        fireEvent.change(screen.getByLabelText('Service Date'), { target: { value: '2024-01-18' } })
        fireEvent.click(screen.getByText('Create Statement'))
        await waitFor(() => {
            expect(statementApi.createStatement).not.toHaveBeenCalled()
            expect(screen.getByText('Amount required')).toBeInTheDocument()
        })
    })

    it('starts guided tour on first visit', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        const mockStart = vi.fn()
        const mockTour = { addSteps: vi.fn(), start: mockStart }
        Shepherd.Tour.mockImplementation(function() { return mockTour })

        render(<MemoryRouter><NewStatement /></MemoryRouter>)

        await waitFor(() => {
            expect(mockStart).toHaveBeenCalled()
        })
    })

    it('does not start tour if already seen', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        const mockStart = vi.fn()
        const mockTour = { addSteps: vi.fn(), start: mockStart }
        Shepherd.Tour.mockImplementation(function() { return mockTour })

        localStorage.setItem('tourSeen', 'true')

        render(<MemoryRouter><NewStatement /></MemoryRouter>)

        await waitFor(() => {
            expect(screen.getByLabelText(/Services For Name/i)).toBeInTheDocument()
        })
        expect(mockStart).not.toHaveBeenCalled()
    })

    it('sets tourSeen in localStorage when tour starts', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        const mockStart = vi.fn()
        const mockTour = { addSteps: vi.fn(), start: mockStart }
        Shepherd.Tour.mockImplementation(function() { return mockTour })


        render(<MemoryRouter><NewStatement /></MemoryRouter>)

        await waitFor(() => {
            expect(mockStart).toHaveBeenCalled()
        })
        expect(localStorage.getItem('tourSeen')).toBe('true')
    })

    it('renders Restart Tour button after form loads', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => {
            expect(screen.getByText('Restart Tour')).toBeInTheDocument()
        })
    })

    it('clicking Restart Tour clears tourSeen and starts the tour', async () => {
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.getNextControlNumber.mockResolvedValue({ data: mockControlNumber })
        localStorage.setItem('tourSeen', 'true')
        const mockStart = vi.fn()
        const mockTour = { addSteps: vi.fn(), start: mockStart }
        Shepherd.Tour.mockImplementation(function() { return mockTour })

        render(<MemoryRouter><NewStatement /></MemoryRouter>)
        await waitFor(() => expect(screen.getByText('Restart Tour')).toBeInTheDocument())
        fireEvent.click(screen.getByText('Restart Tour'))

        expect(mockStart).toHaveBeenCalled()
        expect(localStorage.getItem('tourSeen')).toBe('true')
    })
})