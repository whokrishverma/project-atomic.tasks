import { useEffect, useState } from 'react'
import {
  ListChecks, ListFilter, ArrowUpDown, Search, PanelRight, Inbox, Sun, CalendarDays, Layers,
  Archive, CircleCheck, Trash2, ArchiveRestore,
} from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import TaskList from './components/TaskList.jsx'
import QuickAdd from './components/QuickAdd.jsx'
import RightPanel from './components/RightPanel.jsx'
import ViewHint from './components/ViewHint.jsx'
import { listTasks, addTask, updateTask, removeTask, purgeTask } from './data/store.js'
import { inView, VIEW_TITLES, fmtDate, todayISO } from './lib.js'

// header icon + colour for each view
const HEAD = {
  inbox: { icon: Inbox, color: '#5b9cf5' },
  today: { icon: Sun, color: '#d6b24a' },
  planned: { icon: CalendarDays, color: '#e5534b' },
  anytime: { icon: Layers, color: '#3fb7a8' },
  someday: { icon: Archive, color: '#d6b24a' },
  all: { icon: ListChecks, color: '#8b7bd8' },
  high: { icon: ListFilter, color: '#e5534b' },
  medium: { icon: ListFilter, color: '#f0a13a' },
  low: { icon: ListFilter, color: '#d6b24a' },
  completed: { icon: CircleCheck, color: '#3fcf9a' },
  trash: { icon: Trash2, color: '#9aa4ab' },
}

export default function App() {
  const [tasks, setTasks] = useState([])
  const [view, setView] = useState('all')

  const refresh = async () => setTasks(await listTasks())
  useEffect(() => { refresh() }, [])

  const onAdd = async (title) => { await addTask(title); refresh() }
  const onToggle = async (t) => { await updateTask(t.id, { done: !t.done }); refresh() }
  const onRemove = async (t) => { await removeTask(t.id); refresh() }
  const onPurge = async (t) => { await purgeTask(t.id); refresh() }

  const { icon: HeadIcon, color } = HEAD[view] || HEAD.all
  const visible = inView(tasks, view)

  return (
    <div className="app">
      <Sidebar tasks={tasks} view={view} setView={setView} />
      <main className="main">
        <div className="top">
          <HeadIcon size={16} style={{ color }} />
          {VIEW_TITLES[view]}
          {view === 'today' && <span className="sub">{fmtDate(todayISO())}</span>}
          {view === 'inbox' && (
            <button className="sortchip" type="button"><ArchiveRestore size={14} />sort {visible.length}</button>
          )}
          <span className="tools">
            <ListFilter size={15} /><ArrowUpDown size={15} /><Search size={15} />
            <PanelRight size={15} className="c-grn" />
          </span>
        </div>
        <ViewHint key={view} view={view} />
        <TaskList tasks={visible} view={view} onToggle={onToggle} onRemove={onRemove} onPurge={onPurge} />
        <QuickAdd onAdd={onAdd} />
      </main>
      <RightPanel />
    </div>
  )
}
