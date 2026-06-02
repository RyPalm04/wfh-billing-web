import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Settings from '../pages/Settings'
import * as settingsApi from '../api/settingsApi'

vi.mock('../api/settingsApi', () => ({
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
}))

const mockSettings = { id: 1, salesTaxRate: 0.0825 }

describe('Settings', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows loading state initially', () => {
        settingsApi.getSettings.mockReturnValue(new Promise(() => { }))
        render(<MemoryRouter><Settings /></MemoryRouter>)
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders sales tax rate after load', async () => {
        settingsApi.getSettings.mockResolvedValue({ data: mockSettings })
        render(<MemoryRouter><Settings /></MemoryRouter>)
        await waitFor(() => {
            expect(screen.getByLabelText(/Sales Tax Rate/i)).toHaveValue(0.0825)
        })
    })

    it('shows error message when fetch fails', async () => {
        settingsApi.getSettings.mockRejectedValue(new Error('Network error'))
        render(<MemoryRouter><Settings /></MemoryRouter>)
        await waitFor(() => {
            expect(screen.getByText('Failed to load settings')).toBeInTheDocument()
        })
    })

    it('updates sales tax rate input', async () => {
        settingsApi.getSettings.mockResolvedValue({ data: mockSettings })
        render(<MemoryRouter><Settings /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText(/Sales Tax Rate/i)).toBeInTheDocument())
        fireEvent.change(screen.getByLabelText(/Sales Tax Rate/i), { target: { value: '0.09' } })
        expect(screen.getByLabelText(/Sales Tax Rate/i)).toHaveValue(0.09)
    })

    it('calls updateSettings with new rate on save', async () => {
        settingsApi.getSettings.mockResolvedValue({ data: mockSettings })
        settingsApi.updateSettings.mockResolvedValue({ data: { id: 1, salesTaxRate: 0.09 } })
        render(<MemoryRouter><Settings /></MemoryRouter>)
        await waitFor(() => expect(screen.getByLabelText(/Sales Tax Rate/i)).toBeInTheDocument())
        fireEvent.change(screen.getByLabelText(/Sales Tax Rate/i), { target: { value: '0.09' } })
        fireEvent.click(screen.getByRole('button', { name: /save/i }))
        await waitFor(() => {
            expect(settingsApi.updateSettings).toHaveBeenCalledWith({ id: 1, salesTaxRate: 0.09 })
        })
    })
})