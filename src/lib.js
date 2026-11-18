export const todayISO = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
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
  anytime: (x) => !x.date,
  someday: () => false,
  all: () => true,
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
