import { useEffect, useState } from 'react'
import { ListChecks, ListFilter, ArrowUpDown, Search, PanelRight } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import TaskList from './components/TaskList.jsx'
import QuickAdd from './components/QuickAdd.jsx'
import RightPanel from './components/RightPanel.jsx'
import { listTasks, addTask, updateTask, removeTask, purgeTask } from './data/store.js'
import { inView, VIEW_TITLES } from './lib.js'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [view, setView] = useState('all')
  const [hintDismissed, setHintDismissed] = useState(() => localStorage.getItem('atomic.hint') === '1')

  const refresh = async () => setTasks(await listTasks())
  useEffect(() => { refresh() }, [])

  const onAdd = async (title) => { await addTask(title); refresh() }
  const onToggle = async (t) => { await updateTask(t.id, { done: !t.done }); refresh() }
  const onRemove = async (t) => { await removeTask(t.id); refresh() }
  const onPurge = async (t) => { await purgeTask(t.id); refresh() }
  const dismissHint = () => { localStorage.setItem('atomic.hint', '1'); setHintDismissed(true) }

  return (
    <div className="app">
      <Sidebar tasks={tasks} view={view} setView={setView} />
      <main className="main">
        <div className="top">
          <ListChecks size={16} />{VIEW_TITLES[view]}
          <span className="tools">
            <ListFilter size={15} /><ArrowUpDown size={15} /><Search size={15} />
            <PanelRight size={15} className="c-grn" />
          </span>
        </div>
        <TaskList tasks={inView(tasks, view)} view={view} onToggle={onToggle} onRemove={onRemove} onPurge={onPurge} />
        <QuickAdd onAdd={onAdd} hintDismissed={hintDismissed} dismissHint={dismissHint} />
      </main>
      <RightPanel />
    </div>
  )
}
