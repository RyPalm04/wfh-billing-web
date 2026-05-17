import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import StatementDetail from '../pages/StatementDetail'
import * as statementApi from '../api/statementApi'

vi.mock('../api/statementApi', () => ({
    getStatement: vi.fn(),
}))

const mockStatement = {
    id: 1,
    controlNumber: 1,
    servicesForName: 'Test Person',
    serviceDate: '2024-01-18'
}

describe('StatementDetail', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows loading state initially', () => {
        statementApi.getStatement.mockReturnValue(new Promise(() => {}))
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

    it ('shows error messsage when fetch fails', async () => {
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
        expect(screen.getByRole('link', { name: /edit/i })).toBeInTheDocument()
      })
    })
})