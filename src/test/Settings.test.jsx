import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Settings from '../pages/Settings'
import * as settingsApi from '../api/settingsApi'
import * as desktopApi from '../api/desktopApi'

vi.mock('../api/settingsApi', () => ({
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
}))

vi.mock('../api/desktopApi', () => ({
    getLicenseKey: vi.fn(),
    generateLicenseKey: vi.fn()
}))

const mockSettings = { tenantId: 'some-test-uuid', salesTaxRate: 0.0825 }

describe('Settings', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        settingsApi.getSettings.mockResolvedValue({ data: mockSettings })
        desktopApi.getLicenseKey.mockResolvedValue({ data: { licenseKey: 'EDC-ABCDE-FGHJK-MNPQR-STUVW' } })
    })

    it('shows loading state initially', () => {
        settingsApi.getSettings.mockReturnValue(new Promise(() => { }))
        render(<MemoryRouter><Settings /></MemoryRouter>)
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders sales tax rate after load', async () => {
        render(<MemoryRouter><Settings /></MemoryRouter>)
        await waitFor(() => {
            expect(screen.getByLabelText(/Sales Tax Rate/i)).toHaveValue(0.0825)
        })
    })

    it('shows error message when fetch fails', async () => {
        desktopApi.getLicenseKey.mockRejectedValue(new Error('Network error'))
        render(<MemoryRouter><Settings /></MemoryRouter>)
        await waitFor(() => expect(screen.getByRole('button', { name: /activate desktop access/i })).toBeInTheDocument())
    })

    it('updates sales tax rate input', async () => {
        render(<MemoryRouter><Settings /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText(/Sales Tax Rate/i)).toBeInTheDocument())
        fireEvent.change(screen.getByLabelText(/Sales Tax Rate/i), { target: { value: '0.09' } })
        expect(screen.getByLabelText(/Sales Tax Rate/i)).toHaveValue(0.09)
    })

    it('calls updateSettings with new rate on save', async () => {
        settingsApi.updateSettings.mockResolvedValue({ data: { tenantId: 'some-test-uuid', salesTaxRate: 0.09 } })
        render(<MemoryRouter><Settings /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText(/Sales Tax Rate/i)).toBeInTheDocument())
        fireEvent.change(screen.getByLabelText(/Sales Tax Rate/i), { target: { value: '0.09' } })
        fireEvent.click(screen.getByRole('button', { name: /save/i }))
        await waitFor(() => {
            expect(settingsApi.updateSettings).toHaveBeenCalledWith({ tenantId: 'some-test-uuid', salesTaxRate: 0.09 })
        })
    })

    it('renders the Desktop App section', async () => {
        render(<MemoryRouter><Settings /></MemoryRouter>)
        await waitFor(() => expect(screen.getByText('Desktop App')).toBeInTheDocument())
    })

    it('displays the license key', async () => {
        render(<MemoryRouter><Settings /></MemoryRouter>)
        await waitFor(() => expect(screen.getByText('EDC-ABCDE-FGHJK-MNPQR-STUVW')).toBeInTheDocument())
    })

    it('copies license key to clipboard', async () => {
        Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
        render(<MemoryRouter><Settings /></MemoryRouter>)
        await waitFor(() => expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument())
        fireEvent.click(screen.getByRole('button', { name: /copy/i }))
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('EDC-ABCDE-FGHJK-MNPQR-STUVW')
    })

    it('shows generate button when no license key exists', async () => {
        desktopApi.getLicenseKey.mockRejectedValue({ response: { status: 404 } })
        render(<MemoryRouter><Settings /></MemoryRouter>)
        await waitFor(() => expect(screen.getByRole('button', { name: /activate desktop access/i })).toBeInTheDocument())
    })

    it('generates and displays key on button click', async () => {
        desktopApi.getLicenseKey.mockRejectedValue({ response: { status: 404 } })
        desktopApi.generateLicenseKey.mockResolvedValue({ data: { licenseKey: 'EDC-ABCDE-FGHJK-MNPQR-STUVW' } })
        render(<MemoryRouter><Settings /></MemoryRouter>)
        await waitFor(() => expect(screen.getByRole('button', { name: /activate desktop access/i })).toBeInTheDocument())
        fireEvent.click(screen.getByRole('button', { name: /activate desktop access/i }))
        await waitFor(() => expect(screen.getByText('EDC-ABCDE-FGHJK-MNPQR-STUVW')).toBeInTheDocument())
    })

    it('shows error when generate fails', async () => {
        desktopApi.getLicenseKey.mockRejectedValue({ response: { status: 404 } })
        desktopApi.generateLicenseKey.mockRejectedValue(new Error('Network error'))
        render(<MemoryRouter><Settings /></MemoryRouter>)
        await waitFor(() => expect(screen.getByRole('button', { name: /activate desktop access/i })).toBeInTheDocument())
        fireEvent.click(screen.getByRole('button', { name: /activate desktop access/i }))
        await waitFor(() => expect(screen.queryByText('EDC-ABCDE-FGHJK-MNPQR-STUVW')).not.toBeInTheDocument())
    })
})