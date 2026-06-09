import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Heart, Mail, Hotel, Clock, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const guestNav = [
  { to: '/guest/invitation',    icon: Mail,   label: 'Invitation & RSVP' },
  { to: '/guest/accommodation', icon: Hotel,  label: 'Accommodation' },
  { to: '/guest/timeline',      icon: Clock,  label: 'Day Schedule' },
]

export default function GuestLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#f9f5f0]">
      {/* Top nav */}
      <header className="bg-white border-b border-[#f0e8de] shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="text-[#c9a96e]" size={20} fill="#c9a96e" />
            <div>
              <span className="font-playfair text-base font-semibold text-[#2c1810]">Forever Together</span>
              <span className="ml-2 text-[10px] bg-[#fdf5eb] text-[#a07840] border border-[#e8d5b0] px-2 py-0.5 rounded-full uppercase tracking-wider">Guest</span>
            </div>
          </div>

          <nav className="hidden sm:flex items-center gap-1">
            {guestNav.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#fdf5eb] text-[#a07840] border border-[#e8d5b0]'
                      : 'text-[#7a6652] hover:bg-[#fdf5eb] hover:text-[#a07840]'
                  }`
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-[#9a7a5a] hover:text-[#a07840] transition-colors"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex border-t border-[#f0e8de]">
          {guestNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-all ${
                  isActive ? 'text-[#a07840] bg-[#fdf5eb]' : 'text-[#9a7a5a]'
                }`
              }
            >
              <Icon size={16} />
              {label.split(' ')[0]}
            </NavLink>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
