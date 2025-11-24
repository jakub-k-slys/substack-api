import { NextResponse } from 'next/server'
import { startScheduler, stopScheduler, isSchedulerRunning, triggerScheduler } from '@/lib/scheduler'

export async function GET() {
  return NextResponse.json({
    running: isSchedulerRunning(),
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'start':
        startScheduler()
        return NextResponse.json({
          success: true,
          message: 'Scheduler started',
          running: true,
        })

      case 'stop':
        stopScheduler()
        return NextResponse.json({
          success: true,
          message: 'Scheduler stopped',
          running: false,
        })

      case 'trigger':
        const result = await triggerScheduler()
        return NextResponse.json({
          success: true,
          message: `Processed ${result.processed} notes`,
          ...result,
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start, stop, or trigger' },
          { status: 400 }
        )
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scheduler operation failed' },
      { status: 500 }
    )
  }
}
