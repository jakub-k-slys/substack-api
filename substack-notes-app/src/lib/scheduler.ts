import cron, { ScheduledTask } from 'node-cron'
import { getPendingNotes, updateScheduledNote } from './storage'
import { publishNote, getSubstackClient } from './substack'

let schedulerTask: ScheduledTask | null = null

export function startScheduler(): void {
  if (schedulerTask) {
    console.log('[Scheduler] Already running')
    return
  }

  // Run every minute
  schedulerTask = cron.schedule('* * * * *', async () => {
    console.log('[Scheduler] Checking for pending notes...')
    await processPendingNotes()
  })

  console.log('[Scheduler] Started - checking every minute')
}

export function stopScheduler(): void {
  if (schedulerTask) {
    schedulerTask.stop()
    schedulerTask = null
    console.log('[Scheduler] Stopped')
  }
}

export function isSchedulerRunning(): boolean {
  return schedulerTask !== null
}

async function processPendingNotes(): Promise<void> {
  const client = getSubstackClient()
  if (!client) {
    console.log('[Scheduler] Client not configured, skipping...')
    return
  }

  const pendingNotes = getPendingNotes()
  console.log(`[Scheduler] Found ${pendingNotes.length} pending notes`)

  for (const note of pendingNotes) {
    try {
      console.log(`[Scheduler] Publishing note ${note.id}...`)
      const result = await publishNote(note.content)

      updateScheduledNote(note.id, {
        status: 'published',
        publishedId: result.id,
      })

      console.log(`[Scheduler] Note ${note.id} published successfully as ${result.id}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[Scheduler] Failed to publish note ${note.id}:`, errorMessage)

      updateScheduledNote(note.id, {
        status: 'failed',
        error: errorMessage,
      })
    }
  }
}

// Manual trigger for testing
export async function triggerScheduler(): Promise<{
  processed: number
  results: Array<{ id: string; status: string; error?: string }>
}> {
  const results: Array<{ id: string; status: string; error?: string }> = []
  const pendingNotes = getPendingNotes()

  for (const note of pendingNotes) {
    try {
      const result = await publishNote(note.content)
      updateScheduledNote(note.id, {
        status: 'published',
        publishedId: result.id,
      })
      results.push({ id: note.id, status: 'published' })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      updateScheduledNote(note.id, {
        status: 'failed',
        error: errorMessage,
      })
      results.push({ id: note.id, status: 'failed', error: errorMessage })
    }
  }

  return { processed: results.length, results }
}
