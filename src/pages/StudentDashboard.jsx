import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Lock, Mail, Send, CheckCircle2, Building2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import { Button, Card, Badge, Field, Input, Textarea, ProgressBar } from '../components/ui'

export default function StudentDashboard() {
  const { currentUser, getStudentProfile, getSupervisorForStudent, getLogbook, updateDayEntry, markWeekDone, submitMonth } = useApp()
  const navigate = useNavigate()
  const profile = getStudentProfile(currentUser.id)
  const supervisor = getSupervisorForStudent(currentUser.id)
  const logbook = getLogbook(currentUser.id)
  const [secondEmail, setSecondEmail] = useState('')
  const [submitMsg, setSubmitMsg] = useState('')

  if (!profile) {
    navigate('/onboarding')
    return null
  }
  if (!supervisor) {
    navigate('/match')
    return null
  }
  if (!logbook) {
    return (
      <div className="min-h-screen bg-ink-50">
        <Navbar />
        <p className="text-center text-ink-500 mt-20">Setting up your logbook…</p>
      </div>
    )
  }

  const currentMonth = logbook.months.find((m) => !m.locked) || logbook.months[logbook.months.length - 1]
  const history = logbook.months.filter((m) => m.locked)

  const totalDays = currentMonth.weeks.reduce((acc, w) => acc + w.days.length, 0)
  const filledDays = currentMonth.weeks.reduce((acc, w) => acc + w.days.filter((d) => d.filled).length, 0)
  const weeksDone = currentMonth.weeks.filter((w) => w.weekDone).length
  const allWeeksDone = weeksDone === currentMonth.weeks.length

  function handleSubmitMonth() {
    submitMonth(currentUser.id, currentMonth.id, secondEmail.trim() || null)
    setSubmitMsg('Monthly report submitted' + (secondEmail.trim() ? ` and copied to ${secondEmail.trim()}.` : '.'))
    setSecondEmail('')
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header / status row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">{currentMonth.label}</h1>
            <p className="text-ink-500 text-sm mt-0.5">
              Supervisor: <span className="font-medium text-ink-700">{supervisor.name}</span>
            </p>
          </div>
          <Badge tone="forest">{weeksDone}/{currentMonth.weeks.length} weeks done</Badge>
        </div>

        {/* Overview card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-ink-700">Overall progress</p>
            <p className="text-sm text-ink-500">{filledDays}/{totalDays} days logged</p>
          </div>
          <ProgressBar done={filledDays} total={totalDays} />
        </Card>

        {/* Weeks */}
        <div className="space-y-5">
          {currentMonth.weeks.map((week) => (
            <WeekCard
              key={week.id}
              month={currentMonth}
              week={week}
              onChangeDay={(dayId, text) => updateDayEntry(currentUser.id, currentMonth.id, week.id, dayId, text)}
              onMarkDone={() => markWeekDone(currentUser.id, currentMonth.id, week.id)}
              locked={currentMonth.locked}
            />
          ))}
        </div>

        {/* Submission */}
        {!currentMonth.locked && (
          <Card className="p-5">
            <p className="text-sm font-semibold text-ink-800 mb-1">Submit monthly report</p>
            <p className="text-xs text-ink-500 mb-4">
              {allWeeksDone
                ? 'All weeks are marked done — you can submit now.'
                : `Mark all ${currentMonth.weeks.length} weeks done before submitting, or wait for the deadline.`}
            </p>
            <Field label="Copy a second party (optional)">
              <Input
                type="email"
                placeholder="e.g. hr@yourplacement.com"
                value={secondEmail}
                onChange={(e) => setSecondEmail(e.target.value)}
              />
            </Field>
            <Button className="mt-4 flex items-center gap-2" onClick={handleSubmitMonth} disabled={!allWeeksDone}>
              <Send size={15} /> Submit to {supervisor.name.split(' ')[0]}
            </Button>
            {submitMsg && (
              <p className="text-sm text-forest-700 bg-forest-50 px-3 py-2 rounded-lg mt-3 flex items-center gap-2">
                <CheckCircle2 size={15} /> {submitMsg}
              </p>
            )}
          </Card>
        )}

        {/* Placement info */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={16} className="text-trust-600" />
            <p className="text-sm font-semibold text-ink-800">IT placement details</p>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><dt className="text-ink-400 text-xs">Organisation</dt><dd className="text-ink-800">{profile.orgName}</dd></div>
            <div><dt className="text-ink-400 text-xs">Staff contact</dt><dd className="text-ink-800">{profile.staffName} · {profile.staffPhone}</dd></div>
          </dl>
        </Card>

        {/* History */}
        {history.length > 0 && (
          <Card className="p-5">
            <p className="text-sm font-semibold text-ink-800 mb-3">Submitted months</p>
            <div className="space-y-2">
              {history.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-ink-50 last:border-0">
                  <span className="text-sm text-ink-700">{m.label}</span>
                  <span className="flex items-center gap-1.5 text-xs text-ink-400"><Lock size={12} /> Locked</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

function WeekCard({ month, week, onChangeDay, onMarkDone, locked }) {
  const [open, setOpen] = useState(!week.weekDone)
  const allFilled = week.days.every((d) => d.filled)

  return (
    <Card className="p-5">
      <button className="w-full flex items-center justify-between" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-ink-400" />
          <span className="font-medium text-ink-900 text-sm">{week.label}</span>
        </div>
        {week.weekDone ? <Badge tone="forest">Done</Badge> : <Badge tone="ink">{week.days.filter((d) => d.filled).length}/{week.days.length}</Badge>}
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          {week.days.map((day) => (
            <div key={day.id}>
              <p className="text-xs font-medium text-ink-500 mb-1">{day.label}</p>
              <Textarea
                rows={2}
                value={day.text}
                disabled={locked}
                onChange={(e) => onChangeDay(day.id, e.target.value)}
                placeholder="What did you work on today?"
              />
            </div>
          ))}
          {!week.weekDone && !locked && (
            <Button variant="secondary" onClick={onMarkDone} disabled={!allFilled} className="w-full justify-center flex">
              {allFilled ? 'Mark week done' : 'Fill all days to mark week done'}
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
