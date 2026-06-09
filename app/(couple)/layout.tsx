import Sidebar from '@/components/Sidebar'
import AIAssistant from '@/components/AIAssistant'

export default function CoupleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#f9f5f0]">
        {children}
      </main>
      <AIAssistant />
    </div>
  )
}
