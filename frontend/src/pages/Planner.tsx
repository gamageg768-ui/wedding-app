import { useEffect, useState } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronRight, Link, Info } from 'lucide-react'
import toast from 'react-hot-toast'

interface Task {
  id: number; task: string; category: string; due_date: string
  completed: number; priority: string; notes: string; prerequisite_id: number | null
}

const PRIORITIES = ['high', 'medium', 'low']
const PRIORITY_COLORS = { high: 'text-red-500 bg-red-50', medium: 'text-yellow-600 bg-yellow-50', low: 'text-green-600 bg-green-50' }

export default function Planner() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ task: '', category: 'General', due_date: '', priority: 'medium', notes: '', prerequisite_id: '' })
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [suggestedDate, setSuggestedDate] = useState<string | null>(null)
  const [suggestInfo, setSuggestInfo] = useState<string | null>(null)

  const load = () => fetch('/api/planner/tasks').then(r => r.json()).then(setTasks)
  useEffect(load, [])

  const fetchSuggestedDate = async (category: string) => {
    const res = await fetch(`/api/planner/suggest-date?category=${encodeURIComponent(category)}`)
    const data = await res.json()
    setSuggestedDate(data.suggested_date)
    setSuggestInfo(data.days_before ? `${data.days_before} days before wedding` : null)
  }

  const handleCategoryChange = (cat: string) => {
    setForm(p => ({ ...p, category: cat }))
    fetchSuggestedDate(cat)
  }

  const toggle = async (t: Task) => {
    // Check prerequisite
    if (!t.completed && t.prerequisite_id) {
      const prereq = tasks.find(x => x.id === t.prerequisite_id)
      if (prereq && !prereq.completed) {
        toast.error(`Complete "${prereq.task}" first`)
        return
      }
    }
    await fetch(`/api/planner/tasks/${t.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...t, completed: t.completed ? 0 : 1 })
    })
    load()
  }

  const del = async (id: number) => {
    await fetch(`/api/planner/tasks/${id}`, { method: 'DELETE' })
    toast.success('Task removed'); load()
  }

  const save = async () => {
    if (!form.task.trim()) { toast.error('Task name required'); return }
    const payload = {
      ...form,
      prerequisite_id: form.prerequisite_id ? parseInt(form.prerequisite_id) : null,
      due_date: form.due_date || suggestedDate || ''
    }
    await fetch('/api/planner/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    toast.success('Task added!'); setModal(false)
    setForm({ task: '', category: 'General', due_date: '', priority: 'medium', notes: '', prerequisite_id: '' })
    setSuggestedDate(null); setSuggestInfo(null)
    load()
  }

  const openModal = () => {
    setModal(true)
    fetchSuggestedDate('General')
  }

  const categories = [...new Set(tasks.map(t => t.category))]
  const done = tasks.filter(t => t.completed).length
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

  const toggleCat = (cat: string) => setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))

  const getPrereqName = (id: number | null) => {
    if (!id) return null
    return tasks.find(t => t.id === id)?.task || null
  }

  const isBlocked = (t: Task) => {
    if (!t.prerequisite_id || t.completed) return false
    const prereq = tasks.find(x => x.id === t.prerequisite_id)
    return prereq ? !prereq.completed : false
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Wedding Planner</h1>
          <p className="text-sm text-[#9a7a5a] mt-1">Track everything from venue booking to vows</p>
        </div>
        <button onClick={openModal} className="btn-gold flex items-center gap-2 text-sm">
          <Plus size={15} /> Add Task
        </button>
      </div>

      {/* Progress */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-[#2c1810]">Overall Progress</span>
          <span className="text-lg font-bold text-[#c9a96e] font-playfair">{pct}%</span>
        </div>
        <div className="w-full bg-[#f0e8de] rounded-full h-4 overflow-hidden">
          <div className="h-4 rounded-full transition-all duration-700"
               style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #c9a96e, #a07840)' }} />
        </div>
        <p className="text-xs text-[#9a7a5a] mt-2">{done} of {tasks.length} tasks completed</p>
      </div>

      {/* Tasks by category */}
      {categories.map(cat => {
        const catTasks = tasks.filter(t => t.category === cat)
        const catDone = catTasks.filter(t => t.completed).length
        const isOpen = !collapsed[cat]
        return (
          <div key={cat} className="card mb-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleCat(cat)}>
              <div className="flex items-center gap-2">
                {isOpen ? <ChevronDown size={16} className="text-[#c9a96e]"/> : <ChevronRight size={16} className="text-[#c9a96e]"/>}
                <h3 className="font-semibold text-[#2c1810]">{cat}</h3>
                <span className="text-xs text-[#9a7a5a] ml-1">{catDone}/{catTasks.length}</span>
              </div>
              <div className="w-24 bg-[#f0e8de] rounded-full h-2">
                <div className="h-2 rounded-full" style={{
                  width: `${catTasks.length > 0 ? (catDone / catTasks.length) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, #c9a96e, #a07840)'
                }}/>
              </div>
            </div>

            {isOpen && (
              <div className="mt-3 space-y-2">
                {catTasks.map(t => {
                  const blocked = isBlocked(t)
                  const prereqName = getPrereqName(t.prerequisite_id)
                  return (
                    <div key={t.id}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                        blocked ? 'bg-gray-50 opacity-70' :
                        t.completed ? 'bg-[#f9f5f0] opacity-60' : 'bg-[#fdf5eb]'
                      }`}>
                      <button onClick={() => toggle(t)} className="mt-0.5 flex-shrink-0" title={blocked ? `Blocked by: ${prereqName}` : ''}>
                        {t.completed
                          ? <CheckCircle2 size={20} className="text-[#c9a96e]" />
                          : blocked
                          ? <Circle size={20} className="text-gray-300" />
                          : <Circle size={20} className="text-[#d4b896]" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${t.completed ? 'line-through text-[#b09070]' : 'text-[#2c1810]'}`}>{t.task}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_COLORS[t.priority as keyof typeof PRIORITY_COLORS] || ''}`}>
                            {t.priority}
                          </span>
                          {t.due_date && <span className="text-[10px] text-[#9a7a5a]">Due: {new Date(t.due_date).toLocaleDateString()}</span>}
                          {prereqName && !t.completed && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                              <Link size={9}/> {blocked ? `Blocked by: ${prereqName}` : `After: ${prereqName}`}
                            </span>
                          )}
                          {t.notes && <span className="text-[10px] text-[#b09070] truncate">{t.notes}</span>}
                        </div>
                      </div>
                      <button onClick={() => del(t.id)} className="p-1 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                        <Trash2 size={13} className="text-red-300 hover:text-red-500" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {tasks.length === 0 && (
        <div className="card text-center py-12 border-dashed border-2 border-[#e8d5b0]">
          <CheckCircle2 size={32} className="mx-auto mb-2 text-[#c9a96e] opacity-50" />
          <p className="text-[#b09070]">No tasks yet. Tasks will auto-populate on first load!</p>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="font-playfair text-xl text-[#2c1810] mb-5">Add Task</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Task Name *</label>
                <input value={form.task} onChange={e => setForm(p=>({...p,task:e.target.value}))} placeholder="e.g. Book florist" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Category</label>
                  <input value={form.category} onChange={e => handleCategoryChange(e.target.value)} placeholder="Venue" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p=>({...p,priority:e.target.value}))} className="input-field">
                    {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Due Date</label>
                <input type="date" value={form.due_date} onChange={e => setForm(p=>({...p,due_date:e.target.value}))} className="input-field" />
                {suggestedDate && !form.due_date && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Info size={11} className="text-[#c9a96e]"/>
                    <span className="text-[10px] text-[#a07840]">
                      Suggested: {new Date(suggestedDate).toLocaleDateString()} {suggestInfo && `(${suggestInfo})`}
                    </span>
                    <button onClick={() => setForm(p => ({ ...p, due_date: suggestedDate! }))}
                      className="text-[10px] text-[#c9a96e] underline">Use this</button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Depends On (prerequisite task)</label>
                <select value={form.prerequisite_id} onChange={e => setForm(p=>({...p,prerequisite_id:e.target.value}))} className="input-field">
                  <option value="">None</option>
                  {tasks.filter(t => !t.completed).map(t => (
                    <option key={t.id} value={t.id}>{t.task}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(p=>({...p,notes:e.target.value}))} className="input-field resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={save} className="btn-gold flex-1">Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
