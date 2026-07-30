import React, { createContext, useContext, useEffect, useState } from 'react'
import { loadState, saveState, getInitialState, uid, buildLogbook } from '../data/store'
import { SEED_SUPERVISORS } from '../data/seed'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    const loaded = loadState()
    if (loaded) return loaded
    const init = getInitialState()
    init.supervisors = SEED_SUPERVISORS.map((s) => ({ ...s }))
    return init
  })

  useEffect(() => {
    saveState(state)
  }, [state])

  // ---- Auth ----
  function signup({ role, name, email, password, school, department }) {
    const existing = state.users.find((u) => u.email === email)
    if (existing) return { ok: false, error: 'An account with this email already exists.' }
    const id = uid(role === 'student' ? 'stu' : 'sup')
    const user = { id, role, name, email, password }
    setState((s) => {
      const next = { ...s, users: [...s.users, user], currentUserId: id }
      if (role === 'supervisor') {
        next.supervisors = [...s.supervisors, { id, name, email, school, department, password }]
      }
      return next
    })
    return { ok: true, id }
  }

  function login({ role, email, password }) {
    if (role === 'student') {
      const user = state.users.find((u) => u.email === email && u.password === password && u.role === 'student')
      if (!user) return { ok: false, error: 'No matching student account. Check your details or sign up.' }
      setState((s) => ({ ...s, currentUserId: user.id }))
      return { ok: true, id: user.id }
    } else {
      // supervisors may be seeded (not in users[]) or self-registered
      const seeded = state.supervisors.find((sv) => sv.email === email && sv.password === password)
      if (!seeded) return { ok: false, error: 'No matching supervisor account. Check your details or sign up.' }
      setState((s) => ({ ...s, currentUserId: seeded.id }))
      return { ok: true, id: seeded.id }
    }
  }

  function logout() {
    setState((s) => ({ ...s, currentUserId: null }))
  }

  const currentUser = (() => {
    if (!state.currentUserId) return null
    const u = state.users.find((x) => x.id === state.currentUserId)
    if (u) return u
    const sup = state.supervisors.find((x) => x.id === state.currentUserId)
    if (sup) return { ...sup, role: 'supervisor' }
    return null
  })()

  // ---- Student profile ----
  function saveStudentProfile(userId, profile) {
    setState((s) => ({
      ...s,
      studentProfiles: { ...s.studentProfiles, [userId]: { ...(s.studentProfiles[userId] || {}), ...profile } },
    }))
  }

  function getStudentProfile(userId) {
    return state.studentProfiles[userId] || null
  }

  // ---- Join requests ----
  function sendJoinRequest(studentId, supervisorId) {
    setState((s) => {
      const already = s.joinRequests.find((r) => r.studentId === studentId && r.status !== 'declined')
      if (already) return s
      const req = { id: uid('req'), studentId, supervisorId, status: 'pending', createdAt: new Date().toISOString() }
      return { ...s, joinRequests: [...s.joinRequests, req] }
    })
  }

  function respondJoinRequest(requestId, accept) {
    setState((s) => {
      const joinRequests = s.joinRequests.map((r) =>
        r.id === requestId ? { ...r, status: accept ? 'accepted' : 'declined' } : r
      )
      let logbooks = s.logbooks
      if (accept) {
        const req = s.joinRequests.find((r) => r.id === requestId)
        if (req && !logbooks[req.studentId]) {
          logbooks = { ...logbooks, [req.studentId]: buildLogbook(4) }
        }
      }
      return { ...s, joinRequests, logbooks }
    })
  }

  function getJoinRequestForStudent(studentId) {
    return state.joinRequests.find((r) => r.studentId === studentId) || null
  }

  function getSupervisorForStudent(studentId) {
    const req = state.joinRequests.find((r) => r.studentId === studentId && r.status === 'accepted')
    if (!req) return null
    return state.supervisors.find((s) => s.id === req.supervisorId) || null
  }

  function getStudentsForSupervisor(supervisorId) {
    return state.joinRequests
      .filter((r) => r.supervisorId === supervisorId && r.status === 'accepted')
      .map((r) => {
        const profile = state.studentProfiles[r.studentId]
        const logbook = state.logbooks[r.studentId]
        return { studentId: r.studentId, profile, logbook }
      })
  }

  function getPendingRequestsForSupervisor(supervisorId) {
    return state.joinRequests
      .filter((r) => r.supervisorId === supervisorId && r.status === 'pending')
      .map((r) => ({ ...r, profile: state.studentProfiles[r.studentId] }))
  }

  function suggestSupervisors(school, department) {
    return state.supervisors.filter((sv) => sv.school === school && sv.department === department)
  }

  // ---- Logbook ----
  function getLogbook(studentId) {
    return state.logbooks[studentId] || null
  }

  function updateDayEntry(studentId, monthId, weekId, dayId, text) {
    setState((s) => {
      const lb = s.logbooks[studentId]
      if (!lb) return s
      const months = lb.months.map((m) => {
        if (m.id !== monthId || m.locked) return m
        const weeks = m.weeks.map((w) => {
          if (w.id !== weekId) return w
          const days = w.days.map((d) => (d.id === dayId ? { ...d, text, filled: text.trim().length > 0 } : d))
          return { ...w, days }
        })
        return { ...m, weeks }
      })
      return { ...s, logbooks: { ...s.logbooks, [studentId]: { months } } }
    })
  }

  function markWeekDone(studentId, monthId, weekId) {
    setState((s) => {
      const lb = s.logbooks[studentId]
      if (!lb) return s
      const months = lb.months.map((m) => {
        if (m.id !== monthId || m.locked) return m
        const weeks = m.weeks.map((w) => {
          if (w.id !== weekId) return w
          const allFilled = w.days.every((d) => d.filled)
          return allFilled ? { ...w, weekDone: true } : w
        })
        return { ...m, weeks }
      })
      return { ...s, logbooks: { ...s.logbooks, [studentId]: { months } } }
    })
  }

  function submitMonth(studentId, monthId, secondPartyEmail) {
    setState((s) => {
      const lb = s.logbooks[studentId]
      if (!lb) return s
      const months = lb.months.map((m) =>
        m.id === monthId
          ? { ...m, submitted: true, locked: true, secondPartyEmail: secondPartyEmail || null, submittedAt: new Date().toISOString() }
          : m
      )
      return { ...s, logbooks: { ...s.logbooks, [studentId]: { months } } }
    })
  }

  const value = {
    state,
    currentUser,
    signup,
    login,
    logout,
    saveStudentProfile,
    getStudentProfile,
    sendJoinRequest,
    respondJoinRequest,
    getJoinRequestForStudent,
    getSupervisorForStudent,
    getStudentsForSupervisor,
    getPendingRequestsForSupervisor,
    suggestSupervisors,
    getLogbook,
    updateDayEntry,
    markWeekDone,
    submitMonth,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
