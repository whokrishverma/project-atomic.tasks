import { Flag, Calendar, Paperclip, FileText, ListTree, GraduationCap, ChevronDown, Trash2 } from 'lucide-react'
import { fmtDate } from '../lib.js'

function Meta({ task }) {
  const bits = []
  if (task.sub) bits.push(<span key="s"><ListTree size={12} />{task.sub[0]}/{task.sub[1]}</span>)
  if (task.date) bits.push(<span key="d"><Calendar size={12} />{fmtDate(task.date)}</span>)
  if (task.deadline) bits.push(<span key="dl"><Flag size={12} />{fmtDate(task.deadline)}</span>)
  if (task.attachments) bits.push(<span key="a"><Paperclip size={12} />{task.attachments}</span>)
  if (task.notes) bits.push(<span key="n"><FileText size={12} />{task.notes}</span>)
  task.tags.forEach((g) => bits.push(<span key={g} className="tg">{g}</span>))
  return bits.length ? <div className="m">{bits}</div> : null
}

function Row({ task, onToggle, onRemove, onPurge, inTrash }) {
  return (
    <div className="task">
      <div className="t">
        <button className="cb" onClick={() => onToggle(task)} aria-label="toggle done">[{task.done ? 'x' : ' '}]</button>
        <span className={`title ${task.done ? 'done' : ''}`}>
          {task.priority === 'high' && <span className="hi">!!!</span>} {task.title}
        </span>
        <button className="del" onClick={() => (inTrash ? onPurge(task) : onRemove(task))} aria-label="delete">
          <Trash2 size={13} />
        </button>
      </div>
      <Meta task={task} />
    </div>
  )
}

// groups tasks by project, then by section, keeping the original order
function group(tasks) {
  const projects = new Map()
  for (const t of tasks) {
    const p = t.project || null
    if (!projects.has(p)) projects.set(p, new Map())
    const secs = projects.get(p)
    const s = t.section || null
    if (!secs.has(s)) secs.set(s, [])
    secs.get(s).push(t)
  }
  return projects
}

export default function TaskList({ tasks, onToggle, onRemove, onPurge, view }) {
  if (!tasks.length) return <div className="list"><div className="empty-list">nothing here yet</div></div>
  const projects = group(tasks)
  const inTrash = view === 'trash'
  const rowProps = { onToggle, onRemove, onPurge, inTrash }

  return (
    <div className="list">
      {[...projects.entries()].map(([project, secs]) => (
        <div key={project || 'inbox'}>
          {project && (
            <>
              <div className="proj"><Flag size={15} />{project}</div>
              <div className="sub1"><GraduationCap size={14} />learn init.Tasks <span className="k">{tasks.filter((x) => x.project === project).length} <ChevronDown size={12} style={{ display: 'inline', verticalAlign: -2 }} /></span></div>
            </>
          )}
          {[...secs.entries()].map(([section, rows]) => (
            <div key={section || 'none'}>
              {section && <div className="grp">{section} <em>{rows.length}</em></div>}
              {!section && <div style={{ height: 8 }} />}
              {rows.map((t) => <Row key={t.id} task={t} {...rowProps} />)}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
