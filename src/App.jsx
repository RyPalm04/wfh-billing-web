import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from './components/ErrorFallback'
import StatementList from './pages/StatementList'
import StatementDetail from './pages/StatementDetail'
import NewStatement from './pages/NewStatement'
import EditStatement from './pages/EditStatement'
import Home from './pages/Home'
import Nav from './components/Nav'
import Settings from './pages/Settings'
import logger from './utils/logger'
import { Toaster } from 'react-hot-toast'
import FeedbackModal from './components/FeedbackModal'
import './App.css'
import AppFooter from './components/AppFooter'

function AppContent() {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyF' && !e.shiftKey && e.altKey && !e.ctrlKey) {
        logger.debug('Alt+F key combo pressed - opening feedback modal')
        e.preventDefault()
        setFeedbackOpen(prev => !prev)
        return
      }

      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.isContentEditable) {
        return
      }

      if (e.code === 'KeyS' && !e.shiftKey && !e.altKey && !e.ctrlKey) {
        logger.debug('S key pressed - navigating to statement list')
        navigate('/statements')
      } else if (e.code === 'KeyN' && !e.shiftKey && !e.altKey && !e.ctrlKey) {
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
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </ErrorBoundary>
        <button className="feedback-fab" onClick={() => setFeedbackOpen(prev => !prev)}>Feedback</button>
        <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      </main>
      <AppFooter />
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
