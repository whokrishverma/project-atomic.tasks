import { useState } from 'react'
import { Flag, Calendar, CalendarDays, Paperclip, FileText, ListTree, GraduationCap, ChevronDown, ChevronRight, Trash2, Sun } from 'lucide-react'
import { fmtDate, todayISO, sortTasks } from '../lib.js'

function Meta({ task, hideDate }) {
  const bits = []
  if (task.sub) bits.push(<span key="s"><ListTree size={12} />{task.sub[0]}/{task.sub[1]}</span>)
  if (task.date && !hideDate) bits.push(<span key="d"><Calendar size={12} />{fmtDate(task.date)}</span>)
  if (task.deadline) bits.push(<span key="dl"><Flag size={12} />{fmtDate(task.deadline)}</span>)
  if (task.attachments) bits.push(<span key="a"><Paperclip size={12} />{task.attachments}</span>)
  if (task.notes) bits.push(<span key="n"><FileText size={12} />{task.notes}</span>)
  task.tags.forEach((g) => bits.push(<span key={g} className="tg">{g}</span>))
  return bits.length ? <div className="m">{bits}</div> : null
}

function Row({ task, onToggle, onRemove, onPurge, inTrash, hideDate, flat }) {
  return (
    <div className={`task ${flat ? 'flat' : ''}`}>
      <div className="t">
        <button className="cb" onClick={() => onToggle(task)} aria-label="toggle done">[{task.done ? 'x' : ' '}]</button>
        <span className={`title ${task.done ? 'done' : ''}`}>
          {task.priority === 'high' && <span className="hi">!!!</span>} {task.title}
        </span>
        <button className="del" onClick={() => (inTrash ? onPurge(task) : onRemove(task))} aria-label="delete">
          <Trash2 size={13} />
        </button>
      </div>
      <Meta task={task} hideDate={hideDate} />
    </div>
  )
}

// Big group title used by inbox ("tasks"), today ("today") and planned (a date)
function GroupHead({ icon: Icon, color, title, sub, count, open, toggle }) {
  return (
    <button className="gh" onClick={toggle} aria-expanded={open}>
      <Icon size={16} style={{ color }} />
      <b>{title}</b>
      {sub && <em>{sub}</em>}
      <em>{count}</em>
      {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
    </button>
  )
}

// Progress pie next to a project name: the green wedge is done / total of the tasks in that project
// (trashed tasks don't count), so it re-sizes itself as tasks are added, finished or deleted.
function ProgressPie({ done, total }) {
  const pct = total ? (done / total) * 100 : 0
  return (
    <span className="ring" role="img" aria-label={`${done} of ${total} done`} title={`${done} of ${total} done`}
      style={{ '--p': pct.toFixed(2) }} />
  )
}

// project -> section -> rows, keeping the original order
// `sort` orders the rows inside each section; the project and section order stays put
// `all` is every task, so the pie can count finished ones that are hidden from the list
function Projects({ tasks, rowProps, sort, all }) {
  const projects = new Map()
  for (const t of tasks) {
    const p = t.project || null
    if (!projects.has(p)) projects.set(p, new Map())
    const secs = projects.get(p)
    const s = t.section || null
    if (!secs.has(s)) secs.set(s, [])
    secs.get(s).push(t)
  }
  return [...projects.entries()].map(([project, secs]) => (
    <div key={project || 'inbox'}>
      {project && (
        <>
          <div className="proj"><Flag size={15} />{project}</div>
          <div className="sub1">
            <GraduationCap size={14} />learn init.Tasks
            <ProgressPie
              done={all.filter((x) => x.project === project && !x.deleted && x.done).length}
              total={all.filter((x) => x.project === project && !x.deleted).length}
            />
            <span className="k">{tasks.filter((x) => x.project === project).length} <ChevronDown size={12} style={{ display: 'inline', verticalAlign: -2 }} /></span>
          </div>
        </>
      )}
      {[...secs.entries()].map(([section, rows]) => (
        <div key={section || 'none'}>
          {section && <div className="grp">{section} <em>{rows.length}</em></div>}
          {!section && <div style={{ height: 8 }} />}
          {sortTasks(rows, sort).map((t) => <Row key={t.id} task={t} {...rowProps} />)}
        </div>
      ))}
    </div>
  ))
}

export default function TaskList({ tasks, onToggle, onRemove, onPurge, view, sort = 'manual', dim = false, emptyText, all = tasks }) {
  const [shut, setShut] = useState({})
  const flip = (k) => setShut((s) => ({ ...s, [k]: !s[k] }))

  const cls = `list ${dim ? 'dim' : ''}`
  if (!tasks.length) return <div className={cls}><div className="empty-list">{emptyText || 'nothing here yet'}</div></div>

  const rowProps = { onToggle, onRemove, onPurge, inTrash: view === 'trash', hideDate: view === 'today' || view === 'planned' }

  let body
  if (view === 'inbox') {
    const rows = sort === 'manual' ? [...tasks].sort((a, b) => a.createdAt - b.createdAt) : sortTasks(tasks, sort)
    body = (
      <>
        <GroupHead icon={ListTree} color="#8b7bd8" title="tasks" count={rows.length} open={!shut.inbox} toggle={() => flip('inbox')} />
        {!shut.inbox && rows.map((t) => <Row key={t.id} task={t} flat {...rowProps} />)}
      </>
    )
  } else if (view === 'today') {
    body = (
      <>
        <GroupHead icon={Sun} color="#d6b24a" title="today" count={tasks.length} open={!shut.today} toggle={() => flip('today')} />
        {!shut.today && <Projects tasks={tasks} rowProps={rowProps} sort={sort} all={all} />}
      </>
    )
  } else if (view === 'planned') {
    const days = [...new Set(tasks.map((t) => t.date))].sort()
    body = days.map((d) => {
      const rows = tasks.filter((t) => t.date === d)
      return (
        <div key={d}>
          <GroupHead icon={CalendarDays} color="#d6a23a" title={fmtDate(d)} sub={d === todayISO() ? 'today' : null}
            count={rows.length} open={!shut[d]} toggle={() => flip(d)} />
          {!shut[d] && <Projects tasks={rows} rowProps={rowProps} sort={sort} all={all} />}
        </div>
      )
    })
  } else {
    body = <Projects tasks={tasks} rowProps={rowProps} sort={sort} all={all} />
  }

  return <div className={cls}>{body}</div>
}
