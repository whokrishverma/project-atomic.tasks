import { useState } from 'react'
import { Folder, Calendar, Clock, Tag, Flag, Bell, ArrowUpNarrowWide, Repeat, Paperclip, Lightbulb, ArrowUp, Plus } from 'lucide-react'

const CHIPS = [
  ['where', Folder], ['when', Calendar], ['time', Clock], ['tags', Tag], ['deadline', Flag],
  ['reminder', Bell], ['priority', ArrowUpNarrowWide], ['repeat', Repeat], ['attach', Paperclip],
]

export default function QuickAdd({ onAdd, hintDismissed, dismissHint }) {
  const [text, setText] = useState('')

  const submit = () => {
    const v = text.trim()
    if (!v) return
    onAdd(v)
    setText('')
  }

  return (
    <div className="dock">
      <div className={`hint ${hintDismissed ? 'hidden' : ''}`} role="note">
        <h3><Lightbulb size={13} style={{ color: 'var(--green)', marginRight: 10, verticalAlign: -2 }} />type it the way you'd say it</h3>
        <p>call mom <span className="g">tomorrow</span> <span className="g">18:00</span> <span className="tag">#calls</span></p>
        <p>pay rent <span className="g">monthly</span> <span className="g">on the 1st</span> <span style={{ color: '#e0a43a' }}>!!</span></p>
        <small>days, times, repeats, reminders, priority, #tags and a project's name are picked up as you type.</small>
        <button type="button" onClick={dismissHint}>got it</button>
      </div>

      <div className="bar">
        <div className="row">
          <b>&gt;</b>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="add to inbox…"
            aria-label="add to inbox"
          />
          <button className="send" type="button" aria-label="add" onClick={submit}>
            <span className="plus"><Plus size={14} /></span>
            <span className="arrow"><ArrowUp size={14} /></span>
          </button>
        </div>
        <div className="chips">
          {CHIPS.map(([label, Icon]) => (
            <button key={label} type="button"><Icon size={12} style={{ marginRight: 5, verticalAlign: -2 }} />{label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
