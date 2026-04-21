import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Mail, Users, CheckSquare,
  DollarSign, Store, Grid3X3, Heart
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invitation', icon: Mail,            label: 'Invitation' },
  { to: '/guests',     icon: Users,           label: 'Guests' },
  { to: '/planner',    icon: CheckSquare,     label: 'Planner' },
  { to: '/budget',     icon: DollarSign,      label: 'Budget' },
  { to: '/vendors',    icon: Store,           label: 'Vendors' },
  { to: '/seating',    icon: Grid3X3,         label: 'Seating' },
]

export default function Sidebar() {
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
      <nav className="flex-1 py-4 px-3 space-y-1">
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
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#f0e8de] text-center">
        <p className="text-[11px] text-[#b09070]">Wedding Planner v1.0</p>
        <p className="text-[10px] text-[#c9b090]">✨ Your perfect day awaits</p>
      </div>
    </aside>
  )
}
