import { NextResponse } from 'next/server'
import {
  getScheduledNotes,
  addScheduledNote,
  deleteScheduledNote,
  updateScheduledNote,
} from '@/lib/storage'
import { getSubstackClient } from '@/lib/substack'

export async function GET() {
  const notes = getScheduledNotes()
  return NextResponse.json({ notes })
}

export async function POST(request: Request) {
  const client = getSubstackClient()
  if (!client) {
    return NextResponse.json(
      { error: 'Not configured. Please set up your Substack credentials first.' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { content, scheduledAt } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (!scheduledAt) {
      return NextResponse.json(
        { error: 'scheduledAt is required' },
        { status: 400 }
      )
    }

    const scheduledDate = new Date(scheduledAt)
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format for scheduledAt' },
        { status: 400 }
      )
    }

    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      )
    }

    const note = addScheduledNote(content.trim(), scheduledDate)
    return NextResponse.json({
      success: true,
      note,
      message: 'Note scheduled successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to schedule note' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      )
    }

    const deleted = deleteScheduledNote(id)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Note deleted' })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete note' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, content, scheduledAt } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      )
    }

    const updates: { content?: string; scheduledAt?: string } = {}

    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json(
          { error: 'Content must be a non-empty string' },
          { status: 400 }
        )
      }
      updates.content = content.trim()
    }

    if (scheduledAt !== undefined) {
      const scheduledDate = new Date(scheduledAt)
      if (isNaN(scheduledDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format for scheduledAt' },
          { status: 400 }
        )
      }
      if (scheduledDate <= new Date()) {
        return NextResponse.json(
          { error: 'Scheduled time must be in the future' },
          { status: 400 }
        )
      }
      updates.scheduledAt = scheduledDate.toISOString()
    }

    const updated = updateScheduledNote(id, updates)
    if (!updated) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, note: updated })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update note' },
      { status: 500 }
    )
  }
}
