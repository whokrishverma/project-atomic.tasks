import { useEffect, useRef, useState } from 'react'
import {
  ListFilter, ArrowUpDown, Search, PanelRight, ChevronLeft, X, Check, Pointer, CalendarDays, Flag,
  ChartNoAxesColumn, Clock, CaseSensitive, Hourglass, Bell, Tag,
} from 'lucide-react'
import { SORTS, FILTERS, countFilters } from '../lib.js'

const SORT_ICONS = {
  manual: Pointer, date: CalendarDays, deadline: Flag, priority: ChartNoAxesColumn,
  created: Clock, name: CaseSensitive, length: Hourglass,
}
const GROUP_META = {
  when: { icon: CalendarDays, label: 'when' },
  deadline: { icon: Flag, label: 'deadline' },
  priority: { icon: ChartNoAxesColumn, label: 'priority' },
  reminder: { icon: Bell, label: 'reminder' },
  length: { icon: Hourglass, label: 'length' },
}

// icon button with a hover tooltip (label + optional shortcut keys)
function TipBtn({ label, keys, on, open, last, onClick, children }) {
  return (
    <span className={`tbwrap ${open ? 'open' : ''}`}>
      <button type="button" className={`tb ${on ? 'on' : ''}`} aria-label={label} aria-expanded={open} onClick={onClick}>
        {children}
      </button>
      <span className={`tip ${last ? 'r' : ''}`} role="tooltip">
        {label}
        {keys && keys.map((k) => <kbd key={k}>{k}</kbd>)}
      </span>
    </span>
  )
}

function PopHead({ title, onClose, extra }) {
  return (
    <div className="ph">
      <b>{title}</b>
      {extra}
      <button type="button" className="px" aria-label="close" onClick={onClose}><X size={14} /></button>
    </div>
  )
}

export default function Toolbar({
  sort, setSort, filters, setFilters, tags,
  searching, setSearching, query, setQuery,
  panelOpen, togglePanel,
}) {
  const [pop, setPop] = useState(null) // 'sort' | 'filter' | null
  const root = useRef(null)
  const nFilters = countFilters(filters)

  const closeSearch = () => { setSearching(false); setQuery('') }
  const openSearch = () => { setPop(null); setSearching(true) }

  // outside click closes the popover; Esc closes the popover, then the search; F opens sort; opt+cmd+I toggles the panel
  useEffect(() => {
    const down = (e) => { if (pop && root.current && !root.current.contains(e.target)) setPop(null) }
    const key = (e) => {
      if (e.key === 'Escape') {
        if (pop) setPop(null)
        else if (searching) closeSearch()
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.code === 'KeyI') { e.preventDefault(); togglePanel(); return }
      const t = e.target
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable
      if (!typing && !searching && !e.metaKey && !e.ctrlKey && !e.altKey && e.code === 'KeyF') {
        e.preventDefault()
        setPop((p) => (p === 'sort' ? null : 'sort'))
      }
    }
    document.addEventListener('mousedown', down)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key) }
  }, [pop, searching, togglePanel])

  const toggleFilter = (group, k) => setFilters((f) => ({
    ...f,
    [group]: f[group].includes(k) ? f[group].filter((x) => x !== k) : [...f[group], k],
  }))
  const clearFilters = () => setFilters((f) => Object.fromEntries(Object.keys(f).map((g) => [g, []])))

  const panelBtn = (
    <TipBtn label={panelOpen ? 'hide the panel' : 'show the panel'} keys={['⌥', '⌘', 'I']} on={panelOpen} last onClick={togglePanel}>
      <PanelRight size={15} />
    </TipBtn>
  )

  if (searching) {
    return (
      <span className="tools" ref={root}>
        <button type="button" className="tb" aria-label="close search" onClick={closeSearch}><ChevronLeft size={16} /></button>
        <label className="sbox">
          <Search size={14} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search everything…"
            aria-label="search everything"
          />
        </label>
        {panelBtn}
      </span>
    )
  }

  return (
    <span className="tools" ref={root}>
      <TipBtn label="filter" on={pop === 'filter' || nFilters > 0} open={pop === 'filter'}
        onClick={() => setPop(pop === 'filter' ? null : 'filter')}>
        <ListFilter size={15} />
      </TipBtn>
      <TipBtn label="sort" keys={['F']} on={pop === 'sort' || sort !== 'manual'} open={pop === 'sort'}
        onClick={() => setPop(pop === 'sort' ? null : 'sort')}>
        <ArrowUpDown size={15} />
      </TipBtn>
      <TipBtn label="search" onClick={openSearch}><Search size={15} /></TipBtn>
      {panelBtn}

      <div className={`pop sortp ${pop === 'sort' ? 'open' : ''}`} role="menu" aria-label="sort">
        <PopHead title="sort" onClose={() => setPop(null)} />
        {SORTS.map((k) => {
          const Icon = SORT_ICONS[k]
          return (
            <button key={k} type="button" role="menuitemradio" aria-checked={sort === k}
              className={`opt ${sort === k ? 'on' : ''}`} onClick={() => { setSort(k); setPop(null) }}>
              <span className="oic"><Icon size={14} /></span>
              {k}
              {sort === k && <Check size={14} className="ck" />}
            </button>
          )
        })}
      </div>

      <div className={`pop filterp ${pop === 'filter' ? 'open' : ''}`} aria-label="filter">
        <PopHead title="filter" onClose={() => setPop(null)}
          extra={nFilters > 0 && <button type="button" className="pclear" onClick={clearFilters}>clear</button>} />
        {tags.length > 0 && (
          <>
            <div className="pl"><Tag size={13} />tags</div>
            <div className="pchips">
              {tags.map((g) => (
                <button key={g} type="button" aria-pressed={filters.tags.includes(g)}
                  className={`ptag ${filters.tags.includes(g) ? 'on' : ''}`} onClick={() => toggleFilter('tags', g)}>
                  {g}
                </button>
              ))}
            </div>
          </>
        )}
        {Object.entries(FILTERS).map(([group, options]) => {
          const { icon: Icon, label } = GROUP_META[group]
          return (
            <div key={group}>
              <div className="pl"><Icon size={13} />{label}</div>
              {options.map((o) => {
                const on = filters[group].includes(o.key)
                return (
                  <button key={o.key} type="button" aria-pressed={on} className={`opt ${on ? 'on' : ''}`}
                    onClick={() => toggleFilter(group, o.key)}>
                    {o.label}
                    {on && <Check size={14} className="ck" />}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </span>
  )
}
