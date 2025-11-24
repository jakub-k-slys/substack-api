import { NextResponse } from 'next/server'
import { fetchNotes, publishNote, getSubstackClient } from '@/lib/substack'

export async function GET(request: Request) {
  const client = getSubstackClient()
  if (!client) {
    return NextResponse.json(
      { error: 'Not configured. Please set up your Substack credentials first.' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const notes = await fetchNotes(limit)
    return NextResponse.json({ notes })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch notes' },
      { status: 500 }
    )
  }
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
    const { content } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    const result = await publishNote(content.trim())
    return NextResponse.json({
      success: true,
      noteId: result.id,
      message: 'Note published successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish note' },
      { status: 500 }
    )
  }
}
