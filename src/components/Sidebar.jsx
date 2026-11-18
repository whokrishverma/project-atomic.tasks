import { useEffect, useRef, useState } from 'react'
import {
  House, ChevronDown, ChevronRight, Inbox, Sun, CalendarDays, Layers, Archive, ListChecks, Paperclip,
  Folder, Flag, GraduationCap, Plus, StickyNote, Tag, ListFilter, CircleCheck, Trash2,
  CircleUser, Settings, FolderOpen, Notebook, PanelLeft, Check, Lightbulb,
} from 'lucide-react'
import { inView } from '../lib.js'

const S = 14
function Nav({ icon: Icon, label, count, view, current, onPick, color, className = '' }) {
  return (
    <button className={`nav ${className} ${current === view ? 'on' : ''}`} onClick={() => onPick(view)}>
      <span className="ic" style={color ? { color } : undefined}>{Icon ? <Icon size={S} /> : null}</span>
      {label}
      <span className="n">{count}</span>
    </button>
  )
}
// Section header (projects / notes / tags / filters) that collapses its children
function Section({ icon: Icon, label, open, toggle, children }) {
  return (
    <>
      <div className="sec" role="button" tabIndex={0} onClick={toggle}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle()}>
        <Icon size={S} /> {label} {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className="plus" onClick={(e) => e.stopPropagation()}><Plus size={S} /></span>
      </div>
      {open && children}
    </>
  )
}
function ProfileMenu({ profiles, current, onPick }) {
  const [open, setOpen] = useState(false)
  const [hintGone, setHintGone] = useState(() => localStorage.getItem('atomic.profileHint') === '1')
  const ref = useRef(null)
  // close on outside click or Escape
  useEffect(() => {
    if (!open) return
    const down = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const key = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', down)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key) }
  }, [open])
  const gotIt = () => { localStorage.setItem('atomic.profileHint', '1'); setHintGone(true) }

  return (
    <div className="wsrow" ref={ref}>
      <button className="ws" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <House size={S} /> {current}
        <span className="sp" />
        <ChevronDown size={S} className={`chev ${open ? 'up' : ''}`} />
      </button>
      <PanelLeft size={16} className="paneltoggle" />
      <div className={`pmenu ${open ? 'open' : ''}`} role="menu" aria-hidden={!open}>
        {profiles.map((p) => (
          <button key={p.name} role="menuitem" className="prow on" onClick={() => { onPick(p.name); setOpen(false) }}>
            <House size={S} /> {p.name}
            <span className="sp" />
            {p.name === current && <Check size={13} className="c-grn" />}
            <span className="badge">{p.count}</span>
          </button>
        ))}
        <div className="psep" />
        <button role="menuitem" className="prow muted"><Settings size={S} /> edit profiles…</button>
        {!hintGone && (
          <>
            <div className="psep" />
            <div className="phint">
              <Lightbulb size={S} className="c-grn" />
              <p>profiles keep parts of your life apart. each one has its own projects, tasks, notes and tags. switch between them at any time. pick "all" to see everything in the app.</p>
              <button type="button" className="gotit" onClick={gotIt}>got it</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
export default function Sidebar({ tasks, view, setView }) {
  const c = (v) => inView(tasks, v).length
  const [profile, setProfile] = useState('personal')
  const [open, setOpen] = useState({ projects: true, notes: false, tags: true, filters: true })
  const flip = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }))
  const projectCount = tasks.filter((x) => x.project && !x.done && !x.deleted).length
  return (
    <aside className="side">
      <ProfileMenu profiles={[{ name: 'personal', count: 1 }]} current={profile} onPick={setProfile} />
      <Nav icon={Inbox} label="inbox" count={c('inbox')} view="inbox" current={view} onPick={setView} color="#5b9cf5" />
      <div className="sep" style={{ margin: '6px 0' }} />
      <Nav icon={Sun} label="today" count={c('today')} view="today" current={view} onPick={setView} color="#d6b24a" />
      <Nav icon={CalendarDays} label="planned" count={c('planned')} view="planned" current={view} onPick={setView} color="#e5534b" />
      <Nav icon={Layers} label="anytime" count={c('anytime')} view="anytime" current={view} onPick={setView} color="#3fb7a8" />
      <Nav icon={Archive} label="someday" count={c('someday')} view="someday" current={view} onPick={setView} color="#d6b24a" />
      <div className="sep" />
      <Nav icon={ListChecks} label="all tasks" count={c('all')} view="all" current={view} onPick={setView} color="#8b7bd8" />
      <button className="nav" style={{ cursor: 'default' }}>
        <span className="ic" style={{ color: '#c0607a' }}><Paperclip size={S} /></span>attachments
        <span className="n">{tasks.reduce((a, x) => a + (x.deleted || x.done ? 0 : x.attachments || 0), 0)}</span>
      </button>
      <div className="sep" />
      <Section icon={Folder} label="projects" open={open.projects} toggle={() => flip('projects')}>
        <div className="nav" style={{ fontWeight: 700, color: '#e4eaee' }}>
          <span className="ic"><Flag size={S} /></span>getting started <ChevronDown size={12} />
          <span className="n">{projectCount}</span>
        </div>
        <div className="nav sub c-grn">
          <span className="ic"><GraduationCap size={S} /></span>learn init.Tas…
          <span className="n">{projectCount}</span>
        </div>
      </Section>
      <div className="sep" />
      <Section icon={StickyNote} label="notes" open={open.notes} toggle={() => flip('notes')}>
        <div className="nav"><span className="ic"><Notebook size={S} /></span>all notes<span className="n">3</span></div>
        <div className="nav"><span className="ic"><Paperclip size={S} /></span>attached notes<span className="n">0</span></div>
        <div className="nav"><span className="ic" style={{ color: '#a77bf0' }}><FolderOpen size={S} /></span>tips<span className="n">3</span></div>
      </Section>
      <div className="sep" />
      <Section icon={Tag} label="tags" open={open.tags} toggle={() => flip('tags')}>
        <span className="tagchip">quick</span>
      </Section>
      <div className="sep" style={{ marginTop: open.tags ? 10 : 8 }} />
      <Section icon={ListFilter} label="filters" open={open.filters} toggle={() => flip('filters')}>
        <Nav label="high" count={c('high')} view="high" current={view} onPick={setView} icon={() => <span className="c-red" style={{ fontWeight: 700 }}>!!!</span>} />
        <Nav label="medium" count={c('medium')} view="medium" current={view} onPick={setView} icon={() => <span className="c-org" style={{ fontWeight: 700 }}>!!</span>} />
        <Nav label="low" count={c('low')} view="low" current={view} onPick={setView} icon={() => <span className="c-yel" style={{ fontWeight: 700 }}>!</span>} />
        <div className="nav"><span className="ic"><ListFilter size={S} /></span>quick wins<span className="n">2</span></div>
      </Section>
      <div className="sep" />
      <Nav icon={CircleCheck} label="completed" count={c('completed')} view="completed" current={view} onPick={setView} color="#3fcf9a" />
      <Nav icon={Trash2} label="trash" count={c('trash')} view="trash" current={view} onPick={setView} />
      <div className="gap" />
      <div className="sep" />
      <div className="nav" style={{ color: '#9aa4ab' }}><span className="ic"><CircleUser size={S} /></span>account</div>
      <div className="nav" style={{ color: '#9aa4ab' }}><span className="ic"><Settings size={S} /></span>settings</div>
    </aside>
  )
}
