'use client'
import { useEffect, useState } from 'react'
import { CheckSquare, Plus, Trash2, X, Check, ChevronDown, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface Task { id: number; task: string; category: string; due_date: string; completed: number; priority: string; notes: string; prerequisite_id: number | null }

const PRIORITY_COLORS: Record<string, string> = { high: 'text-red-600 bg-red-50', medium: 'text-amber-600 bg-amber-50', low: 'text-green-600 bg-green-50' }

export default function Planner() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ task: '', category: 'General', priority: 'medium', due_date: '', notes: '' })
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const load = () => fetch('/api/planner/tasks').then(r => r.json()).then(setTasks)
  useEffect(() => { fetch('/api/planner/seed', { method: 'POST' }).then(load) }, [])

  const toggleTask = async (t: Task) => {
    if (!t.completed && t.prerequisite_id) {
      const prereq = tasks.find(x => x.id === t.prerequisite_id)
      if (prereq && !prereq.completed) { toast.error(`Complete "${prereq.task}" first`); return }
    }
    await fetch(`/api/planner/tasks/${t.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...t, completed: t.completed ? 0 : 1 }) })
    load()
  }

  const addTask = async () => {
    if (!form.task.trim()) return
    await fetch('/api/planner/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    toast.success('Task added'); setShowForm(false); setForm({ task: '', category: 'General', priority: 'medium', due_date: '', notes: '' }); load()
  }

  const del = async (id: number) => {
    await fetch(`/api/planner/tasks/${id}`, { method: 'DELETE' }); toast.success('Deleted'); load()
  }

  const categories = [...new Set(tasks.map(t => t.category))].sort()
  const grouped = Object.fromEntries(categories.map(cat => [cat, tasks.filter(t => t.category === cat)]))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810] mb-1">Wedding Planner</h1>
          <p className="text-[#9a7a5a] text-sm">{tasks.filter(t => t.completed).length} of {tasks.length} tasks completed</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-gold flex items-center gap-2"><Plus size={16} /> Add Task</button>
      </div>

      <div className="w-full bg-[#f0e8de] rounded-full h-2 mb-6">
        <div className="h-2 rounded-full transition-all" style={{ width: `${tasks.length ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%`, background: 'linear-gradient(90deg, #c9a96e, #a07840)' }} />
      </div>

      {showForm && (
        <div className="card mb-6 border-[#c9a96e]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#2c1810]">New Task</h3>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-[#9a7a5a]" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="block text-xs font-medium text-[#2c1810] mb-1">Task</label><input className="input-field" value={form.task} onChange={e => setForm(f => ({ ...f, task: e.target.value }))} placeholder="What needs to be done?" /></div>
            <div><label className="block text-xs font-medium text-[#2c1810] mb-1">Category</label><input className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
            <div><label className="block text-xs font-medium text-[#2c1810] mb-1">Priority</label>
              <select className="input-field" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
              </select>
            </div>
            <div><label className="block text-xs font-medium text-[#2c1810] mb-1">Due Date</label><input type="date" className="input-field" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></div>
            <div><label className="block text-xs font-medium text-[#2c1810] mb-1">Notes</label><input className="input-field" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addTask} className="btn-gold flex items-center gap-1.5"><Check size={14} /> Add Task</button>
            <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {categories.map(cat => {
          const catTasks = grouped[cat]
          const done = catTasks.filter(t => t.completed).length
          const pct = catTasks.length ? Math.round((done / catTasks.length) * 100) : 0
          const open = !collapsed[cat]
          return (
            <div key={cat} className="card">
              <button onClick={() => setCollapsed(c => ({ ...c, [cat]: !c[cat] }))} className="w-full flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {open ? <ChevronDown size={16} className="text-[#9a7a5a]" /> : <ChevronRight size={16} className="text-[#9a7a5a]" />}
                  <span className="font-semibold text-[#2c1810]">{cat}</span>
                  <span className="text-xs text-[#9a7a5a]">{done}/{catTasks.length}</span>
                </div>
                <span className="text-sm font-medium text-[#c9a96e]">{pct}%</span>
              </button>
              <div className="w-full bg-[#f0e8de] rounded-full h-1.5 mb-3">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #c9a96e, #a07840)' }} />
              </div>
              {open && (
                <div className="space-y-1">
                  {catTasks.map(t => (
                    <div key={t.id} className={`flex items-center gap-3 p-2 rounded-lg hover:bg-[#fdfaf7] group ${t.completed ? 'opacity-60' : ''}`}>
                      <button onClick={() => toggleTask(t)} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${t.completed ? 'bg-[#c9a96e] border-[#c9a96e]' : 'border-[#e5ddd4] hover:border-[#c9a96e]'}`}>
                        {t.completed ? <Check size={11} className="text-white" /> : null}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm ${t.completed ? 'line-through text-[#9a7a5a]' : 'text-[#2c1810]'}`}>{t.task}</span>
                        {t.due_date && <span className="text-xs text-[#c9b090] ml-2">{t.due_date}</span>}
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[t.priority] || ''}`}>{t.priority}</span>
                      <button onClick={() => del(t.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:bg-red-50 transition-opacity"><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
