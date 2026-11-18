import { useState } from 'react'
import { Lightbulb } from 'lucide-react'

export const HINTS = {
  inbox: 'the inbox is for quick capture. add things here through the day, and sort them when you have a minute.',
  planned: 'planned shows every task that has a date. assign one to a task and it will show up here.',
}

// Dismissible tip card at the top of a view. Remembers "got it" per view.
export default function ViewHint({ view }) {
  const key = `atomic.hint.${view}`
  const [gone, setGone] = useState(() => localStorage.getItem(key) === '1')
  if (!HINTS[view] || gone) return null
  return (
    <div className="vhint" role="note">
      <Lightbulb size={14} className="c-grn" />
      <div>
        <p>{HINTS[view]}</p>
        <button type="button" className="gotit" onClick={() => { localStorage.setItem(key, '1'); setGone(true) }}>got it</button>
      </div>
    </div>
  )
}
