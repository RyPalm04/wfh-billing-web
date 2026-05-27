import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../pages/Home'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return { ...actual, useNavigate: () => mockNavigate }
})

describe('Home', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the welcome title', () => {
        render(<MemoryRouter><Home /></MemoryRouter>)
        expect(screen.getByText('Funeral Home Statement Manager')).toBeInTheDocument()
    })

    it('renders the subtitle', () => {
        render(<MemoryRouter><Home /></MemoryRouter>)
        expect(screen.getByText('Manage and generate billing statements from anywhere.')).toBeInTheDocument()
    })

    it('renders New Statement and View Statement buttons', () => {
        render(<MemoryRouter><Home /></MemoryRouter>)
        expect(screen.getByText('New Statement')).toBeInTheDocument()
        expect(screen.getByText('View Statements')).toBeInTheDocument()
    })

    it('ensures that clicking New Statement navigates to /statements/new', () => {
        render(<MemoryRouter><Home /></MemoryRouter>)
        fireEvent.click(screen.getByText('New Statement'))
        expect(mockNavigate).toHaveBeenCalledWith('/statements/new')
    })

    it('ensures that clicking View Statements navigates to /statements', () => {
        render(<MemoryRouter><Home /></MemoryRouter>)
        fireEvent.click(screen.getByText('View Statements'))
        expect(mockNavigate).toHaveBeenCalledWith('/statements')
    })

    it ('renders the three how-it-works steps', () => {
        render(<MemoryRouter><Home /></MemoryRouter>)
        expect(screen.getByText('Create')).toBeInTheDocument()
        expect(screen.getByText('Review')).toBeInTheDocument()
        expect(screen.getByText('Download')).toBeInTheDocument()
    })
})