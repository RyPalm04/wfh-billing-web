import { describe, it, expect, vi } from 'vitest'
  import { render, screen, fireEvent } from '@testing-library/react'
  import ErrorFallback from '../components/ErrorFallback'
  
  describe('ErrorFallback', () => {
      it('renders the error heading', () => {
          render(<ErrorFallback resetErrorBoundary={vi.fn()} />)
          expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      })    

      it('renders the error message', () => {
          render(<ErrorFallback resetErrorBoundary={vi.fn()} />)
          expect(screen.getByText(/unexpected error/i)).toBeInTheDocument()
      })    

      it('calls resetErrorBoundary when Try again is clicked', () => {
          const reset = vi.fn() 
          render(<ErrorFallback resetErrorBoundary={reset} />)
          fireEvent.click(screen.getByText('Try again'))
          expect(reset).toHaveBeenCalled()
      })    
  })