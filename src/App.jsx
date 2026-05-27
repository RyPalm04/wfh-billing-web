import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from './components/ErrorFallback'
import StatementList from './pages/StatementList'
import StatementDetail from './pages/StatementDetail'
import NewStatement from './pages/NewStatement'
import EditStatement from './pages/EditStatement'
import Home from './pages/Home'
import Nav from './components/Nav'
import logger from './utils/logger'
import { Toaster } from 'react-hot-toast'

function AppContent() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if(document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.isContentEditable) {
        return
      }

      if (e.key === 's' && !e.shiftKey && !e.altKey && !e.ctrlKey) {
        logger.debug('S key pressed - navigating to statement list')
        navigate('/statements')
      } else if (e.key === 'n' && !e.shiftKey && !e.altKey && !e.ctrlKey) {
        logger.debug('N key pressed - navigating to new statement page')
        navigate('/statements/new')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  return (
    <>
      <Nav />
      <Toaster position="bottom-right" toastOptions={{
        style: {
          fontFamily: 'Lato, sans-serif',
          fontSize: '13px',
          color: '#2c2c2c',
          border: '1px solid #d0ccc7',
          borderRadius: '6px',
        },
        duration: 4000,
        success: { iconTheme: { primary: '#1B3A6B', secondary: '#fff' } },
        error: { iconTheme: { primary: '#C0392B', secondary: '#fff' } }
      }} />
      <main>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/statements" element={<StatementList />} />
            <Route path="/statements/new" element={<NewStatement />} />
            <Route path="/statements/:id" element={<StatementDetail />} />
            <Route path="/statements/:id/edit" element={<EditStatement />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
