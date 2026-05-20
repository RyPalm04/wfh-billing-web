import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from './components/ErrorFallback'
import StatementList from './pages/StatementList'
import StatementDetail from './pages/StatementDetail'
import NewStatement from './pages/NewStatement'
import EditStatement from './pages/EditStatement'
import Nav from './components/Nav'

function App() {
  return (
    <BrowserRouter>
      <Nav />
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
