const KEY = 'logify_state_v1'

const initialState = {
  users: [],          // {id, role, email, password, name}
  studentProfiles: {}, // userId -> profile
  supervisors: [],     // seeded + any created
  joinRequests: [],    // {id, studentId, supervisorId, status, createdAt}
  logbooks: {},        // studentId -> {months: [...]}
  currentUserId: null,
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // ignore quota errors for prototype
  }
}

export function getInitialState() {
  return initialState
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

// Build a fresh logbook structure: N months x 4 weeks x 5 days (Mon-Fri labels)
export function buildLogbook(numMonths = 4, startMonthLabel = null) {
  const now = new Date()
  const months = []
  for (let m = 0; m < numMonths; m++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + m, 1)
    const label = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
    const weeks = []
    for (let w = 0; w < 4; w++) {
      const days = []
      for (let d = 0; d < 5; d++) {
        days.push({ id: `d${d}`, label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][d], text: '', filled: false })
      }
      weeks.push({ id: `w${w}`, label: `Week ${w + 1}`, days, weekDone: false })
    }
    months.push({
      id: `m${m}`,
      label,
      deadline: lastDay.toISOString(),
      weeks,
      submitted: false,
      locked: false,
      secondPartyEmail: null,
      submittedAt: null,
    })
  }
  return { months }
}
