import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import Sidebar from './components/Sidebar'
import GuestLayout from './components/GuestLayout'
import AIAssistant from './components/AIAssistant'

import Landing from './pages/Landing'
import CoupleLogin from './pages/CoupleLogin'

import Dashboard from './pages/Dashboard'
import Invitation from './pages/Invitation'
import Guests from './pages/Guests'
import Planner from './pages/Planner'
import Budget from './pages/Budget'
import Vendors from './pages/Vendors'
import Seating from './pages/Seating'
import Timeline from './pages/Timeline'
import DayOf from './pages/DayOf'
import DecisionBoard from './pages/DecisionBoard'
import Accommodation from './pages/Accommodation'
import PostWeddingReport from './pages/PostWeddingReport'

import GuestInvitation from './pages/GuestInvitation'
import GuestAccommodation from './pages/GuestAccommodation'
import GuestTimeline from './pages/GuestTimeline'

function CoupleRoutes() {
  const { role } = useAuth()
  if (role !== 'couple') return <Navigate to="/" replace />

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#f9f5f0]">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invitation" element={<Invitation />} />
          <Route path="/guests" element={<Guests />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/seating" element={<Seating />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/day-of" element={<DayOf />} />
          <Route path="/decisions" element={<DecisionBoard />} />
          <Route path="/accommodation" element={<Accommodation />} />
          <Route path="/report" element={<PostWeddingReport />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      <AIAssistant />
    </div>
  )
}

function GuestRoutes() {
  const { role } = useAuth()
  if (role !== 'guest') return <Navigate to="/" replace />

  return (
    <Routes>
      <Route element={<GuestLayout />}>
        <Route path="/guest" element={<Navigate to="/guest/invitation" replace />} />
        <Route path="/guest/invitation" element={<GuestInvitation />} />
        <Route path="/guest/accommodation" element={<GuestAccommodation />} />
        <Route path="/guest/timeline" element={<GuestTimeline />} />
        <Route path="*" element={<Navigate to="/guest/invitation" replace />} />
      </Route>
    </Routes>
  )
}

function AppRoutes() {
  const { role } = useAuth()

  if (role === 'couple') {
    return (
      <Routes>
        <Route path="/*" element={<CoupleRoutes />} />
      </Routes>
    )
  }

  if (role === 'guest') {
    return (
      <Routes>
        <Route path="/guest/*" element={<GuestRoutes />} />
        <Route path="*" element={<Navigate to="/guest/invitation" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/couple/login" element={<CoupleLogin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter', fontSize: '14px' } }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
