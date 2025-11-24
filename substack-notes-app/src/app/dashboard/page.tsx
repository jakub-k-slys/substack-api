'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  FileText,
  Settings,
  Plus,
  Clock,
  RefreshCw,
  Send,
  Trash2,
  Calendar,
  Loader2,
  Heart,
  User,
  AlertCircle,
  Check,
} from 'lucide-react'

interface Note {
  id: string
  body: string
  publishedAt: string
  likesCount: number
  author: {
    id: number
    name: string
    handle: string
    avatarUrl?: string
  }
}

interface ScheduledNote {
  id: string
  content: string
  scheduledAt: string
  status: 'pending' | 'published' | 'failed'
  publishedId?: string
  error?: string
  createdAt: string
}

interface Profile {
  name: string
  handle: string
  avatarUrl?: string
}

type Tab = 'notes' | 'create' | 'scheduled'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('notes')
  const [notes, setNotes] = useState<Note[]>([])
  const [scheduledNotes, setScheduledNotes] = useState<ScheduledNote[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create note form
  const [noteContent, setNoteContent] = useState('')
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/notes?limit=20')
      if (!res.ok) throw new Error('Failed to fetch notes')
      const data = await res.json()
      setNotes(data.notes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes')
    }
  }, [])

  const fetchScheduledNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/scheduled')
      if (!res.ok) throw new Error('Failed to fetch scheduled notes')
      const data = await res.json()
      setScheduledNotes(data.notes)
    } catch (err) {
      console.error('Failed to fetch scheduled notes:', err)
    }
  }, [])

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('Failed to fetch profile')
      const data = await res.json()
      setProfile(data.profile)
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    }
  }, [])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      await Promise.all([fetchNotes(), fetchScheduledNotes(), fetchProfile()])
      setLoading(false)
    }
    loadData()
  }, [fetchNotes, fetchScheduledNotes, fetchProfile])

  async function handleRefresh() {
    setLoading(true)
    setError(null)
    await Promise.all([fetchNotes(), fetchScheduledNotes()])
    setLoading(false)
  }

  async function handleSubmitNote(e: React.FormEvent) {
    e.preventDefault()
    if (!noteContent.trim()) return

    setSubmitting(true)
    setSubmitMessage(null)

    try {
      if (isScheduled) {
        // Schedule the note
        const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`)
        const res = await fetch('/api/scheduled', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: noteContent, scheduledAt: scheduledAt.toISOString() }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to schedule note')
        }

        setSubmitMessage({ type: 'success', text: 'Note scheduled successfully!' })
        setNoteContent('')
        setScheduleDate('')
        setScheduleTime('')
        setIsScheduled(false)
        fetchScheduledNotes()
      } else {
        // Publish immediately
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: noteContent }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to publish note')
        }

        setSubmitMessage({ type: 'success', text: 'Note published successfully!' })
        setNoteContent('')
        fetchNotes()
      }
    } catch (err) {
      setSubmitMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to submit note',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteScheduled(id: string) {
    if (!confirm('Are you sure you want to delete this scheduled note?')) return

    try {
      const res = await fetch(`/api/scheduled?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      fetchScheduledNotes()
    } catch (err) {
      alert('Failed to delete scheduled note')
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString()
  }

  // Get minimum date/time for scheduling (now + 1 minute)
  const now = new Date()
  const minDate = now.toISOString().split('T')[0]
  const minTime = now.toTimeString().slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-orange-600" />
            <h1 className="text-xl font-semibold">Substack Notes</h1>
          </div>
          <div className="flex items-center gap-4">
            {profile && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span>{profile.name}</span>
              </div>
            )}
            <Link href="/settings" className="p-2 text-gray-500 hover:text-gray-700">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex gap-6">
            {[
              { id: 'notes' as Tab, label: 'My Notes', icon: FileText },
              { id: 'create' as Tab, label: 'Create', icon: Plus },
              { id: 'scheduled' as Tab, label: 'Scheduled', icon: Clock },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 py-3 border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {id === 'scheduled' && scheduledNotes.filter((n) => n.status === 'pending').length > 0 && (
                  <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">
                    {scheduledNotes.filter((n) => n.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Recent Notes</h2>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {loading && notes.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No notes yet. Create your first note!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="bg-white rounded-lg border p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{note.body}</p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {note.likesCount}
                      </span>
                      <span>{formatDate(note.publishedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-medium mb-4">Create Note</h2>

            {submitMessage && (
              <div
                className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  submitMessage.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {submitMessage.type === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {submitMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmitNote} className="space-y-4">
              <div>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={5}
                  className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  maxLength={280}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {noteContent.length}/280
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Schedule for later</span>
                </label>
              </div>

              {isScheduled && (
                <div className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={minDate}
                      required={isScheduled}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      min={scheduleDate === minDate ? minTime : undefined}
                      required={isScheduled}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !noteContent.trim() || (isScheduled && (!scheduleDate || !scheduleTime))}
                className="w-full bg-orange-600 text-white py-2.5 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isScheduled ? 'Scheduling...' : 'Publishing...'}
                  </>
                ) : (
                  <>
                    {isScheduled ? <Calendar className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                    {isScheduled ? 'Schedule Note' : 'Publish Now'}
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Scheduled Tab */}
        {activeTab === 'scheduled' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Scheduled Notes</h2>
              <button
                onClick={fetchScheduledNotes}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {scheduledNotes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No scheduled notes. Create one from the Create tab!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`bg-white rounded-lg border p-4 ${
                      note.status === 'failed' ? 'border-red-200' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <span
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                              note.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : note.status === 'published'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {note.status === 'pending' && <Clock className="w-3 h-3" />}
                            {note.status === 'published' && <Check className="w-3 h-3" />}
                            {note.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                            {note.status}
                          </span>
                          <span className="text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(note.scheduledAt)}
                          </span>
                        </div>
                        {note.error && (
                          <p className="mt-2 text-sm text-red-600">Error: {note.error}</p>
                        )}
                      </div>
                      {note.status === 'pending' && (
                        <button
                          onClick={() => handleDeleteScheduled(note.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
