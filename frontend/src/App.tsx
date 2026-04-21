import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Invitation from './pages/Invitation'
import Guests from './pages/Guests'
import Planner from './pages/Planner'
import Budget from './pages/Budget'
import Vendors from './pages/Vendors'
import Seating from './pages/Seating'
import AIAssistant from './components/AIAssistant'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter', fontSize: '14px' } }} />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#f9f5f0]">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invitation" element={<Invitation />} />
            <Route path="/guests" element={<Guests />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/seating" element={<Seating />} />
          </Routes>
        </main>
        <AIAssistant />
      </div>
    </BrowserRouter>
  )
}
