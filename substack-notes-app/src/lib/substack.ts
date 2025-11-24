import { SubstackClient } from 'substack-api'
import { getConfig } from './storage'

let clientInstance: SubstackClient | null = null

export function getSubstackClient(): SubstackClient | null {
  const config = getConfig()

  if (!config.isConfigured || !config.apiKey || !config.hostname) {
    return null
  }

  // Create new instance if config changed or doesn't exist
  if (!clientInstance) {
    clientInstance = new SubstackClient({
      hostname: config.hostname,
      apiKey: config.apiKey,
    })
  }

  return clientInstance
}

export function resetClient(): void {
  clientInstance = null
}

export async function testConnection(): Promise<{ success: boolean; error?: string }> {
  const client = getSubstackClient()

  if (!client) {
    return { success: false, error: 'Client not configured' }
  }

  try {
    const isConnected = await client.testConnectivity()
    if (isConnected) {
      return { success: true }
    }
    return { success: false, error: 'Invalid credentials or connection failed' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export interface NoteData {
  id: string
  body: string
  publishedAt: Date
  likesCount: number
  author: {
    id: number
    name: string
    handle: string
    avatarUrl?: string
  }
}

export async function fetchNotes(limit: number = 20): Promise<NoteData[]> {
  const client = getSubstackClient()

  if (!client) {
    throw new Error('Client not configured')
  }

  const profile = await client.ownProfile()
  const notes: NoteData[] = []

  for await (const note of profile.notes({ limit })) {
    notes.push({
      id: note.id,
      body: note.body,
      publishedAt: note.publishedAt,
      likesCount: note.likesCount,
      author: note.author,
    })
  }

  return notes
}

export async function publishNote(content: string): Promise<{ id: string }> {
  const client = getSubstackClient()

  if (!client) {
    throw new Error('Client not configured')
  }

  const profile = await client.ownProfile()
  const response = await profile
    .newNote()
    .paragraph()
    .text(content)
    .publish()

  return { id: String(response.id) }
}

export async function getProfileInfo(): Promise<{
  name: string
  handle: string
  avatarUrl?: string
}> {
  const client = getSubstackClient()

  if (!client) {
    throw new Error('Client not configured')
  }

  const profile = await client.ownProfile()
  return {
    name: profile.name,
    handle: profile.slug,
    avatarUrl: profile.avatarUrl,
  }
}
