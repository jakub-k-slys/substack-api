import { NextResponse } from 'next/server'
import { getConfig, saveConfig, clearConfig, SubstackConfig } from '@/lib/storage'
import { testConnection, resetClient } from '@/lib/substack'

export async function GET() {
  const config = getConfig()
  // Don't expose the full API key, just indicate if it's set
  return NextResponse.json({
    hostname: config.hostname,
    isConfigured: config.isConfigured,
    hasApiKey: !!config.apiKey,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { apiKey, hostname } = body

    if (!apiKey || !hostname) {
      return NextResponse.json(
        { error: 'apiKey and hostname are required' },
        { status: 400 }
      )
    }

    // Save config temporarily to test connection
    const config: SubstackConfig = {
      apiKey,
      hostname,
      isConfigured: true,
    }
    saveConfig(config)
    resetClient()

    // Test the connection
    const connectionResult = await testConnection()

    if (!connectionResult.success) {
      // Revert config if connection failed
      clearConfig()
      resetClient()
      return NextResponse.json(
        { error: connectionResult.error || 'Connection test failed' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration saved and connection verified',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  clearConfig()
  resetClient()
  return NextResponse.json({ success: true, message: 'Configuration cleared' })
}
