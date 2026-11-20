import { useCallback, useEffect, useState } from 'react'
import {
  ListChecks, ListFilter, Inbox, Sun, CalendarDays, Layers,
  Archive, CircleCheck, Trash2, ArchiveRestore,
} from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import TaskList from './components/TaskList.jsx'
import QuickAdd from './components/QuickAdd.jsx'
import RightPanel from './components/RightPanel.jsx'
import ViewHint from './components/ViewHint.jsx'
import Toolbar from './components/Toolbar.jsx'
import { listTasks, addTask, updateTask, removeTask, purgeTask } from './data/store.js'
import { inView, VIEW_TITLES, fmtDate, todayISO, applyFilters, emptyFilters, allTags, searchTasks } from './lib.js'

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
  const [sort, setSort] = useState('manual')
  const [filters, setFilters] = useState(emptyFilters)
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [panelOpen, setPanelOpen] = useState(() => {
    try { return localStorage.getItem('atomic.panel') === '1' } catch { return false }
  })

  const togglePanel = useCallback(() => setPanelOpen((open) => !open), [])
  useEffect(() => {
    try { localStorage.setItem('atomic.panel', panelOpen ? '1' : '0') } catch {}
  }, [panelOpen])
  // picking a view in the sidebar leaves search
  const pickView = (v) => { setView(v); setSearching(false); setQuery('') }

  const refresh = async () => setTasks(await listTasks())
  useEffect(() => { refresh() }, [])

  const onAdd = async (title) => { await addTask(title); refresh() }
  const onToggle = async (t) => { await updateTask(t.id, { done: !t.done }); refresh() }
  const onRemove = async (t) => { await removeTask(t.id); refresh() }
  const onPurge = async (t) => { await purgeTask(t.id); refresh() }

  const { icon: HeadIcon, color } = HEAD[view] || HEAD.all
  const inThisView = inView(tasks, view)
  const visible = applyFilters(inThisView, filters)
  const results = searching && query.trim() ? searchTasks(tasks, query) : null
  const emptyText = results ? 'no matches' : inThisView.length && !visible.length ? 'no tasks match the filters' : undefined

  return (
    <div className={`app ${panelOpen ? '' : 'nopanel'}`}>
      <Sidebar tasks={tasks} view={view} setView={pickView} />
      <main className={`main ${searching ? 'searching' : ''}`}>
        <div className="top">
          <HeadIcon size={16} style={{ color }} />
          {VIEW_TITLES[view]}
          {view === 'today' && <span className="sub">{fmtDate(todayISO())}</span>}
          {view === 'inbox' && (
            <button className="sortchip" type="button"><ArchiveRestore size={14} />sort {visible.length}</button>
          )}
          <Toolbar
            sort={sort} setSort={setSort}
            filters={filters} setFilters={setFilters} tags={allTags(tasks)}
            searching={searching} setSearching={setSearching} query={query} setQuery={setQuery}
            panelOpen={panelOpen} togglePanel={togglePanel}
          />
        </div>
        {!searching && <ViewHint key={view} view={view} />}
        <TaskList
          tasks={results || visible} view={results ? 'search' : view} sort={results ? 'manual' : sort}
          all={tasks} dim={searching && !results} emptyText={emptyText}
          onToggle={onToggle} onRemove={onRemove} onPurge={onPurge}
        />
        <QuickAdd onAdd={onAdd} />
      </main>
      {panelOpen && <RightPanel />}
    </div>
  )
}