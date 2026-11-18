// Data layer. The UI only calls these functions and never touches storage directly.
// To move to a database / account sync later (e.g. Supabase), replace the bodies
// of these functions and keep their names and return shapes the same.

const KEY = 'atomic.tasks.v1'

const seed = () => [
  t('click me to see more details', { section: 'start here', sub: [0, 2] }),
  t('right-click me to see what you can do', { section: 'start here' }),
  t('add a task from the bar at the bottom', { section: 'start here', sub: [0, 2], date: '2026-11-18', notes: 1, tags: ['quick'] }),
  t('plan with dates and deadlines', { section: 'go further', sub: [0, 3], deadline: '2026-11-25', notes: 1 }),
  t('group tasks with tags', { section: 'go further', sub: [0, 2], tags: ['quick'] }),
  t('find tasks with filters and priority', { section: 'go further', sub: [0, 2], priority: 'high' }),
  t('keep notes and files with your tasks', { section: 'go further', sub: [0, 3], attachments: 2, notes: 1 }),
  t('keep parts of your life apart with profiles', { section: 'go further', sub: [0, 2] }),
  t('sync your devices', { section: 'wrap up', sub: [0, 2] }),
  t('finish onboarding', { section: 'wrap up', sub: [0, 4] }),
]

let n = 0
function t(title, extra = {}) {
  return {
    id: `seed-${++n}`,
    title,
    done: false,
    deleted: false,
    project: 'getting started',
    section: null,
    priority: null, // 'high' | 'medium' | 'low' | null
    tags: [],
    date: null, // 'YYYY-MM-DD'
    deadline: null,
    sub: null, // [done, total]
    attachments: 0,
    notes: 0,
    createdAt: Date.now() + n,
    ...extra,
  }
}

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return seed()
}

function write(tasks) {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks))
  } catch {}
}

export async function listTasks() {
  return read()
}

export async function addTask(title) {
  const tasks = read()
  const task = {
    id: crypto.randomUUID(),
    title,
    done: false,
    deleted: false,
    project: null, // null = inbox
    section: null,
    priority: null,
    tags: [],
    date: null,
    deadline: null,
    sub: null,
    attachments: 0,
    notes: 0,
    createdAt: Date.now(),
  }
  write([...tasks, task])
  return task
}

export async function updateTask(id, patch) {
  const tasks = read().map((x) => (x.id === id ? { ...x, ...patch } : x))
  write(tasks)
  return tasks.find((x) => x.id === id)
}

// Soft delete: moves to trash. Call purgeTask to remove for good.
export async function removeTask(id) {
  return updateTask(id, { deleted: true })
}

export async function purgeTask(id) {
  write(read().filter((x) => x.id !== id))
}
