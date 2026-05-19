import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StatementList from './pages/StatementList'
import StatementDetail from './pages/StatementDetail'
import NewStatement from './pages/NewStatement'
import EditStatement from './pages/EditStatement'
import Nav from './components/Nav'

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<StatementList />} />
        <Route path="/statements" element={<StatementList />} />
        <Route path="/statements/new" element={<NewStatement />} />
        <Route path="/statements/:id" element={<StatementDetail />} />
        <Route path="/statements/:id/edit" element={<EditStatement />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
