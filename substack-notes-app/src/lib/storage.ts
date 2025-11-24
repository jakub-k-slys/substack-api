import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const CONFIG_FILE = path.join(DATA_DIR, 'config.json')
const SCHEDULED_NOTES_FILE = path.join(DATA_DIR, 'scheduled-notes.json')

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Config types
export interface SubstackConfig {
  apiKey: string // connect.sid cookie value
  hostname: string // e.g., 'yourname.substack.com'
  isConfigured: boolean
}

// Scheduled note types
export interface ScheduledNote {
  id: string
  content: string
  scheduledAt: string // ISO date string
  status: 'pending' | 'published' | 'failed'
  publishedId?: string
  error?: string
  createdAt: string
  updatedAt: string
}

// Default config
const DEFAULT_CONFIG: SubstackConfig = {
  apiKey: '',
  hostname: '',
  isConfigured: false,
}

// Config operations
export function getConfig(): SubstackConfig {
  ensureDataDir()
  if (!fs.existsSync(CONFIG_FILE)) {
    return DEFAULT_CONFIG
  }
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return DEFAULT_CONFIG
  }
}

export function saveConfig(config: SubstackConfig): void {
  ensureDataDir()
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}

export function clearConfig(): void {
  ensureDataDir()
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE)
  }
}

// Scheduled notes operations
export function getScheduledNotes(): ScheduledNote[] {
  ensureDataDir()
  if (!fs.existsSync(SCHEDULED_NOTES_FILE)) {
    return []
  }
  try {
    const data = fs.readFileSync(SCHEDULED_NOTES_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function saveScheduledNotes(notes: ScheduledNote[]): void {
  ensureDataDir()
  fs.writeFileSync(SCHEDULED_NOTES_FILE, JSON.stringify(notes, null, 2))
}

export function addScheduledNote(content: string, scheduledAt: Date): ScheduledNote {
  const notes = getScheduledNotes()
  const newNote: ScheduledNote = {
    id: `note_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    content,
    scheduledAt: scheduledAt.toISOString(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  notes.push(newNote)
  saveScheduledNotes(notes)
  return newNote
}

export function updateScheduledNote(id: string, updates: Partial<ScheduledNote>): ScheduledNote | null {
  const notes = getScheduledNotes()
  const index = notes.findIndex(n => n.id === id)
  if (index === -1) return null

  notes[index] = {
    ...notes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  saveScheduledNotes(notes)
  return notes[index]
}

export function deleteScheduledNote(id: string): boolean {
  const notes = getScheduledNotes()
  const filtered = notes.filter(n => n.id !== id)
  if (filtered.length === notes.length) return false
  saveScheduledNotes(filtered)
  return true
}

export function getPendingNotes(): ScheduledNote[] {
  return getScheduledNotes().filter(
    n => n.status === 'pending' && new Date(n.scheduledAt) <= new Date()
  )
}
