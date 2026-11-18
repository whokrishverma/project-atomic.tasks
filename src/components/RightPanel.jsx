import { PanelRight } from 'lucide-react'

export default function RightPanel() {
  return (
    <section className="right">
      <div className="empty">
        <div className="box"><PanelRight size={22} /></div>
        <b>nothing selected</b>
        <p>open a task or a note and it shows here.</p>
      </div>
    </section>
  )
}
