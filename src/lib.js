const toISO = (d) => {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
export const todayISO = () => toISO(new Date())

// the coming Sunday (today if it is Sunday): the end of "this week"
export const weekEndISO = () => {
  const d = new Date()
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7))
  return toISO(d)
}

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

// '2026-11-18' -> 'wed 18 nov'
export function fmtDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return `${DAYS[dt.getDay()]} ${d} ${MONTHS[m - 1]}`
}

export const VIEWS = {
  inbox: (x) => !x.project,
  today: (x) => x.date === todayISO(),
  planned: (x) => !!x.date,
  anytime: (x) => !!x.project && !x.date,
  someday: () => false,
  all: (x) => !!x.project, // inbox tasks have no home yet, so they are not in "all tasks"
  high: (x) => x.priority === 'high',
  medium: (x) => x.priority === 'medium',
  low: (x) => x.priority === 'low',
}

// tasks visible in a view (completed and trash are their own views)
export function inView(tasks, view) {
  if (view === 'completed') return tasks.filter((x) => x.done && !x.deleted)
  if (view === 'trash') return tasks.filter((x) => x.deleted)
  return tasks.filter((x) => !x.done && !x.deleted && (VIEWS[view] || VIEWS.all)(x))
}

export const VIEW_TITLES = {
  inbox: 'inbox', today: 'today', planned: 'planned', anytime: 'anytime', someday: 'someday',
  all: 'all tasks', high: 'high', medium: 'medium', low: 'low', completed: 'completed', trash: 'trash',
}

// ---------- sort ----------
export const SORTS = ['manual', 'date', 'deadline', 'priority', 'created', 'name', 'length']

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 }
// ascending, with empty values always last
const nullLast = (a, b) => {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return a < b ? -1 : a > b ? 1 : 0
}
const COMPARE = {
  date: (a, b) => nullLast(a.date, b.date),
  deadline: (a, b) => nullLast(a.deadline, b.deadline),
  priority: (a, b) => nullLast(PRIORITY_RANK[a.priority], PRIORITY_RANK[b.priority]),
  created: (a, b) => b.createdAt - a.createdAt, // newest first
  name: (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
  length: (a, b) => nullLast(a.length, b.length),
}

// 'manual' keeps the stored order; every other sort is stable
export function sortTasks(tasks, sort) {
  const cmp = COMPARE[sort]
  return cmp ? [...tasks].sort(cmp) : tasks
}

// ---------- filter ----------
// Options inside one group are OR-ed, groups are AND-ed. Tags are built from the tasks themselves.
const mins = (n) => (x) => x.length != null && x.length <= n

export const FILTERS = {
  when: [
    { key: 'today', label: 'today', test: (x, c) => x.date === c.today },
    { key: 'this week', label: 'this week', test: (x, c) => !!x.date && x.date >= c.today && x.date <= c.weekEnd },
    { key: 'later', label: 'later', test: (x, c) => !!x.date && x.date > c.weekEnd },
    { key: 'no date', label: 'no date', test: (x) => !x.date },
  ],
  deadline: [
    { key: 'overdue', label: 'overdue', test: (x, c) => !!x.deadline && x.deadline < c.today },
    { key: 'this week', label: 'this week', test: (x, c) => !!x.deadline && x.deadline >= c.today && x.deadline <= c.weekEnd },
    { key: 'has one', label: 'has one', test: (x) => !!x.deadline },
  ],
  priority: [
    { key: 'high', label: '!!! high', test: (x) => x.priority === 'high' },
    { key: 'medium', label: '!! medium', test: (x) => x.priority === 'medium' },
    { key: 'low', label: '! low', test: (x) => x.priority === 'low' },
  ],
  reminder: [{ key: 'has a reminder', label: 'has a reminder', test: (x) => !!x.reminder }],
  length: [
    { key: '15', label: 'up to 15 min', test: mins(15) },
    { key: '30', label: 'up to 30 min', test: mins(30) },
    { key: '60', label: 'up to 1 hour', test: mins(60) },
  ],
}

export const emptyFilters = () => ({ tags: [], when: [], deadline: [], priority: [], reminder: [], length: [] })
export const countFilters = (sel) => Object.values(sel).reduce((n, v) => n + v.length, 0)

export function applyFilters(tasks, sel) {
  if (!countFilters(sel)) return tasks
  const ctx = { today: todayISO(), weekEnd: weekEndISO() }
  return tasks.filter((x) => {
    if (sel.tags.length && !sel.tags.some((g) => (x.tags || []).includes(g))) return false
    return Object.keys(FILTERS).every((group) => {
      const chosen = sel[group]
      if (!chosen.length) return true
      return FILTERS[group].some((o) => chosen.includes(o.key) && o.test(x, ctx))
    })
  })
}

export const allTags = (tasks) => [...new Set(tasks.filter((x) => !x.deleted).flatMap((x) => x.tags || []))].sort()

// ---------- search ----------
// every word must appear in the title, tags, project or section (trash is left out)
export function searchTasks(tasks, query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  return tasks.filter((x) => {
    if (x.deleted) return false
    const hay = [x.title, ...(x.tags || []), x.project, x.section].filter(Boolean).join(' ').toLowerCase()
    return words.every((w) => hay.includes(w))
  })
}
