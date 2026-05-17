import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StatementList from './pages/StatementList'
import StatementDetail from './pages/StatementDetail'
import NewStatement from './pages/NewStatement'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StatementList />} />
        <Route path="/statements/new" element={<NewStatement />} />
        <Route path="/statements/:id" element={<StatementDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
