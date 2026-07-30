import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpenCheck, GraduationCap, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Button, Card, Field, Input, Select } from '../components/ui'
import { SCHOOLS, DEPARTMENTS } from '../data/seed'

export default function Login() {
  const { login, signup, getStudentProfile } = useApp()
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [mode, setMode] = useState('login') // login | signup
  const [form, setForm] = useState({ name: '', email: '', password: '', school: SCHOOLS[0], department: DEPARTMENTS[0] })
  const [error, setError] = useState('')

  function update(field, val) {
    setForm((f) => ({ ...f, [field]: val }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (mode === 'login') {
      const res = login({ role, email: form.email, password: form.password })
      if (!res.ok) return setError(res.error)
      routeAfterAuth(res.id)
    } else {
      if (!form.name || !form.email || !form.password) return setError('Please fill in all fields.')
      const res = signup({ role, ...form })
      if (!res.ok) return setError(res.error)
      routeAfterAuth(res.id)
    }
  }

  function routeAfterAuth(userId) {
    if (role === 'supervisor') {
      navigate('/supervisor')
    } else {
      const profile = getStudentProfile(userId)
      navigate(profile?.confirmed ? '/student' : '/onboarding')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-forest-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-forest-600/20">
            <BookOpenCheck size={26} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Logify</h1>
          <p className="text-ink-500 text-sm mt-1">The digital SIWES logbook</p>
        </div>

        <Card className="p-6">
          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-2 mb-6 bg-ink-50 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                role === 'student' ? 'bg-white shadow-sm text-forest-700' : 'text-ink-500'
              }`}
            >
              <GraduationCap size={16} /> Student
            </button>
            <button
              type="button"
              onClick={() => setRole('supervisor')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                role === 'supervisor' ? 'bg-white shadow-sm text-trust-700' : 'text-ink-500'
              }`}
            >
              <ShieldCheck size={16} /> Supervisor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Field label="Full name">
                <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Jane Doe" />
              </Field>
            )}
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" />
            </Field>
            <Field label="Password">
              <Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="••••••••" />
            </Field>

            {mode === 'signup' && role === 'supervisor' && (
              <>
                <Field label="School">
                  <Select value={form.school} onChange={(e) => update('school', e.target.value)}>
                    {SCHOOLS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Department">
                  <Select value={form.department} onChange={(e) => update('department', e.target.value)}>
                    {DEPARTMENTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </Select>
                </Field>
              </>
            )}

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <Button type="submit" className="w-full justify-center flex">
              {mode === 'login' ? 'Log in' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-ink-500 mt-5">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              className="text-forest-700 font-medium hover:underline"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setError('')
              }}
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </Card>

        {role === 'supervisor' && mode === 'login' && (
          <p className="text-center text-xs text-ink-400 mt-4">
            Demo supervisor: anwosu@rsu.edu.ng / password
          </p>
        )}
      </div>
    </div>
  )
}
