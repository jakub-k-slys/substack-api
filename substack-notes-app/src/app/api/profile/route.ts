import { NextResponse } from 'next/server'
import { getProfileInfo, getSubstackClient } from '@/lib/substack'

export async function GET() {
  const client = getSubstackClient()
  if (!client) {
    return NextResponse.json(
      { error: 'Not configured' },
      { status: 401 }
    )
  }

  try {
    const profile = await getProfileInfo()
    return NextResponse.json({ profile })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
