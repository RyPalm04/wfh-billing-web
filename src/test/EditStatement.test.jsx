import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EditStatement from '../pages/EditStatement'
import * as catalogApi from '../api/catalogApi'
import * as statementApi from '../api/statementApi'
import toast from 'react-hot-toast'

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn()
    }
}))

vi.mock('../api/statementApi', () => ({
    getStatement: vi.fn(),
    updateStatement: vi.fn(),
}))

vi.mock('../api/catalogApi', () => ({
    getCatalog: vi.fn(),
}))

const mockStatement = {
    id: 1,
    controlNumber: 101,
    servicesForName: 'John Doe',
    serviceDate: '2024-01-15',
    dateOfDeath: '2024-01-10',
    placeOfDeath: 'Home',
    reasonForEmbalming: null,
    packageId: null,
    services: [{ serviceId: 1, inPackage: false }],
    merchandise: [
        { merchandiseId: 1, price: '2500.00', description: 'Oak casket' },
        { merchandiseId: 3, price: '30.00', description: '' }
    ],
    specialCharges: [{ specialChargeId: 1, price: '25.00', description: '' }],
    cashAdvances: [{ cashAdvanceId: 1, amount: '500.00', provider: 'Greenwood Cemetery' }]
}

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

describe('EditStatement', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows loading state initially', () => {
        catalogApi.getCatalog.mockReturnValue(new Promise(() => { }))
        statementApi.getStatement.mockReturnValue(new Promise(() => { }))
        render(
            <MemoryRouter>
                <EditStatement />
            </MemoryRouter>
        )
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders statement details', async () => {
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })

        render(
            <MemoryRouter>
                <EditStatement />
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.getByLabelText(/Control Number/i)).toHaveValue(mockStatement.controlNumber.toString())
            expect(screen.getByLabelText(/Services For Name/i)).toHaveValue(mockStatement.servicesForName)
            expect(screen.getByLabelText(/Service Date/i)).toHaveValue(mockStatement.serviceDate)
            expect(screen.getByLabelText(/Date of Death/i)).toHaveValue(mockStatement.dateOfDeath)
            expect(screen.getByLabelText(/Place of Death/i)).toHaveValue(mockStatement.placeOfDeath)
        })
    })

    it('shows error message when catalog fetch fails', async () => {
        catalogApi.getCatalog.mockRejectedValue(new Error('Network error'))
        statementApi.getStatement.mockRejectedValue(new Error('Network error'))
        render(
            <MemoryRouter>
                <EditStatement />
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(screen.getByText('Failed to load data')).toBeInTheDocument()
        })
    })

    it('pre-checks service from saved statement', async () => {
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })

        render(
            <MemoryRouter>
                <EditStatement />
            </MemoryRouter>
        )

        await waitFor(() => {
            const embalmingCheckbox = screen.getByLabelText(/Embalming/i)
            expect(embalmingCheckbox).toBeInTheDocument()
            expect(embalmingCheckbox).toBeChecked()
        })
    })

    it('pre-checks merchandise from saved statement', async () => {
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })

        render(
            <MemoryRouter>
                <EditStatement />
            </MemoryRouter>
        )

        await waitFor(() => {
            const casketCheckbox = screen.getByRole('checkbox', { name: /Casket/i })
            expect(casketCheckbox).toBeInTheDocument()
            expect(casketCheckbox).toBeChecked()
        })
    })

    it('pre-populates quantity for per-unit merchandise', async () => {
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })

        render(
            <MemoryRouter>
                <EditStatement />
            </MemoryRouter>
        )

        await waitFor(() => {
            const memorialVideoInput = screen.getByLabelText(/Quantity for Memorial Video/i)
            expect(memorialVideoInput).toBeInTheDocument()
            expect(memorialVideoInput).toHaveValue(2)
        })
    })

    it('pre-checks special charges from saved statement', async () => {
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })

        render(
            <MemoryRouter>
                <EditStatement />
            </MemoryRouter>
        )

        await waitFor(() => {
            const deathCertificateCheckbox = screen.getByLabelText(/Death Certificate/i)
            expect(deathCertificateCheckbox).toBeInTheDocument()
            expect(deathCertificateCheckbox).toBeChecked()
        })
    })

    it('pre-checks cash advances from saved statement', async () => {
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })

        render(
            <MemoryRouter>
                <EditStatement />
            </MemoryRouter>
        )

        await waitFor(() => {
            const cemeteryOpeningCheckbox = screen.getByRole('checkbox', { name: /Cemetery Opening/i })
            expect(cemeteryOpeningCheckbox).toBeInTheDocument()
            expect(cemeteryOpeningCheckbox).toBeChecked()
        })
    })

    it('pre-selects package from saved statement', async () => {
        statementApi.getStatement.mockResolvedValue({ data: { ...mockStatement, packageId: 1, services: [{ serviceId: 1, inPackage: true }] } })
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })

        render(
            <MemoryRouter>
                <EditStatement />
            </MemoryRouter>
        )

        await waitFor(() => {
            const packageSelect = screen.getByLabelText(/Package/i)
            expect(packageSelect).toBeInTheDocument()
            expect(packageSelect).toHaveValue('1')
        })
    })

    it('saves updated statement via updateStatement API call', async () => {
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.updateStatement.mockResolvedValue({})

        render(
            <MemoryRouter>
                <EditStatement />
            </MemoryRouter>
        )

        await waitFor(() => {
            const servicesForNameInput = screen.getByLabelText(/Services For Name/i)
            fireEvent.change(servicesForNameInput, { target: { value: 'Jane Doe' } })
            const submitButton = screen.getByText(/Save/i)
            fireEvent.click(submitButton)
        })

        await waitFor(() => {
            expect(statementApi.updateStatement).toHaveBeenCalled()
            const payload = statementApi.updateStatement.mock.calls[0][1]
            expect(payload).toEqual(expect.objectContaining({
                servicesForName: 'Jane Doe'
            }))
        })
    })

    it('shows success message after successful save', async () => {
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.updateStatement.mockResolvedValue({})

        render(
            <MemoryRouter>
                <EditStatement />
            </MemoryRouter>
        )

        await waitFor(() => {
            const submitButton = screen.getByText(/Save/i)
            fireEvent.click(submitButton)
        })

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Statement updated successfully')
        })
    })

    it('shows error message if updateStatement API call fails', async () => {
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.updateStatement.mockRejectedValue(new Error('Network error'))

        render(
            <MemoryRouter>
                <EditStatement />
            </MemoryRouter>
        )

        await waitFor(() => {
            const submitButton = screen.getByText(/Save/i)
            fireEvent.click(submitButton)
        })

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to save statement')
        })
    })

    it('diables save button while submitting', async () => {
        statementApi.getStatement.mockResolvedValue({ data: mockStatement })
        catalogApi.getCatalog.mockResolvedValue({ data: mockCatalog })
        statementApi.updateStatement.mockReturnValue(new Promise(() => { }))

        render(
            <MemoryRouter>
                <EditStatement />
            </MemoryRouter>
        )

        await waitFor(() => {
            const submitButton = screen.getByText(/Save/i)
            fireEvent.click(submitButton)
            expect(submitButton).toBeDisabled()
        })
    })
})