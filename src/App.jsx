import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from './components/ErrorFallback'
import StatementList from './pages/StatementList'
import StatementDetail from './pages/StatementDetail'
import NewStatement from './pages/NewStatement'
import EditStatement from './pages/EditStatement'
import Nav from './components/Nav'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <BrowserRouter>
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
        success: { iconTheme: { primary: '#2d6a35', secondary: '#fff' } },
        error: { iconTheme: { primary: '#a0522d', secondary: '#fff' } }
      }} />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Routes>
          <Route path="/" element={<StatementList />} />
          <Route path="/statements" element={<StatementList />} />
          <Route path="/statements/new" element={<NewStatement />} />
          <Route path="/statements/:id" element={<StatementDetail />} />
          <Route path="/statements/:id/edit" element={<EditStatement />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
