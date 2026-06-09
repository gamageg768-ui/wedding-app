import { createContext, useContext, useState, ReactNode } from 'react'

type Role = 'couple' | 'guest' | null

interface AuthContextType {
  role: Role
  loginAsCouple: (pin: string) => boolean
  loginAsGuest: () => void
  enterCouple: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const COUPLE_PIN = '1234'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(() =>
    (localStorage.getItem('weddingRole') as Role) || null
  )

  const loginAsCouple = (pin: string): boolean => {
    if (pin === COUPLE_PIN) {
      setRole('couple')
      localStorage.setItem('weddingRole', 'couple')
      return true
    }
    return false
  }

  const loginAsGuest = () => {
    setRole('guest')
    localStorage.setItem('weddingRole', 'guest')
  }

  const enterCouple = () => {
    setRole('couple')
    localStorage.setItem('weddingRole', 'couple')
  }

  const logout = () => {
    setRole(null)
    localStorage.removeItem('weddingRole')
  }

  return (
    <AuthContext.Provider value={{ role, loginAsCouple, loginAsGuest, enterCouple, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
