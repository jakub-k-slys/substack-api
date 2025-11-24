export async function register() {
  // Only run on the server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startScheduler } = await import('./lib/scheduler')

    // Start the scheduler when the server starts
    console.log('[Instrumentation] Starting scheduler...')
    startScheduler()
  }
}
