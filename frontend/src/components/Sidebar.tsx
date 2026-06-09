import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Mail, Users, CheckSquare,
  DollarSign, Store, Grid3X3, Heart, Clock,
  Zap, Vote, Hotel, BarChart2, LogOut
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invitation',    icon: Mail,            label: 'Invitation' },
  { to: '/guests',        icon: Users,           label: 'Guests' },
  { to: '/planner',       icon: CheckSquare,     label: 'Planner' },
  { to: '/budget',        icon: DollarSign,      label: 'Budget' },
  { to: '/vendors',       icon: Store,           label: 'Vendors' },
  { to: '/seating',       icon: Grid3X3,         label: 'Seating' },
]

const dayItems = [
  { to: '/timeline',      icon: Clock,           label: 'Timeline' },
  { to: '/day-of',        icon: Zap,             label: 'Day-Of' },
]

const planningItems = [
  { to: '/decisions',     icon: Vote,            label: 'Decisions' },
  { to: '/accommodation', icon: Hotel,           label: 'Accommodation' },
  { to: '/report',        icon: BarChart2,       label: 'Post-Wedding' },
]

function NavGroup({ label, items }: { label: string; items: typeof navItems }) {
  return (
    <>
      <p className="px-3 pt-3 pb-1 text-[9px] font-semibold tracking-widest uppercase text-[#c9b090]">{label}</p>
      {items.map(({ to, icon: Icon, navLabel = '', label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-[#fdf5eb] text-[#a07840] border border-[#e8d5b0]'
                : 'text-[#7a6652] hover:bg-[#fdf5eb] hover:text-[#a07840]'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </>
  )
}

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="w-64 bg-white border-r border-[#f0e8de] flex flex-col h-full shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-[#f0e8de]">
        <div className="flex items-center gap-2">
          <Heart className="text-[#c9a96e]" size={24} fill="#c9a96e" />
          <div>
            <h1 className="font-playfair text-lg font-semibold text-[#2c1810] leading-tight">Forever</h1>
            <p className="text-[10px] text-[#a07840] tracking-widest uppercase">Together</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 pt-2 pb-1 text-[9px] font-semibold tracking-widest uppercase text-[#c9b090]">Planning</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#fdf5eb] text-[#a07840] border border-[#e8d5b0]'
                  : 'text-[#7a6652] hover:bg-[#fdf5eb] hover:text-[#a07840]'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        <p className="px-3 pt-3 pb-1 text-[9px] font-semibold tracking-widest uppercase text-[#c9b090]">Wedding Day</p>
        {dayItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#fdf5eb] text-[#a07840] border border-[#e8d5b0]'
                  : 'text-[#7a6652] hover:bg-[#fdf5eb] hover:text-[#a07840]'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        <p className="px-3 pt-3 pb-1 text-[9px] font-semibold tracking-widest uppercase text-[#c9b090]">Tools</p>
        {planningItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#fdf5eb] text-[#a07840] border border-[#e8d5b0]'
                  : 'text-[#7a6652] hover:bg-[#fdf5eb] hover:text-[#a07840]'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#f0e8de]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm text-[#9a7a5a] hover:bg-[#fdf5eb] hover:text-[#a07840] transition-all"
        >
          <LogOut size={15} />
          Switch View
        </button>
        <p className="text-[10px] text-[#c9b090] text-center mt-2">Your perfect day awaits</p>
      </div>
    </aside>
  )
}
