'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Settings, ArrowLeft, Check, AlertCircle, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [hostname, setHostname] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/config')
        const data = await res.json()
        setHostname(data.hostname || '')
        setIsConfigured(data.isConfigured)
      } catch {
        // Ignore errors on initial load
      }
    }
    loadConfig()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostname, apiKey }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Configuration saved! Redirecting...' })
        setIsConfigured(true)
        setTimeout(() => router.push('/dashboard'), 1500)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save configuration' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleDisconnect() {
    setTesting(true)
    try {
      await fetch('/api/config', { method: 'DELETE' })
      setIsConfigured(false)
      setHostname('')
      setApiKey('')
      setMessage({ type: 'success', text: 'Disconnected successfully' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to disconnect' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-orange-600" />
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
          {isConfigured && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-medium mb-4">Connect to Substack</h2>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">How to get your connect.sid cookie:</h3>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Log in to your Substack account at substack.com</li>
              <li>Open Browser DevTools (F12 or Right-click → Inspect)</li>
              <li>Go to Application tab → Cookies → substack.com</li>
              <li>Find the cookie named <code className="bg-blue-100 px-1 rounded">connect.sid</code></li>
              <li>Copy the entire value (starts with &quot;s%3A...&quot;)</li>
            </ol>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="hostname" className="block text-sm font-medium text-gray-700 mb-1">
                Publication Hostname
              </label>
              <input
                type="text"
                id="hostname"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                placeholder="yourname.substack.com"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Your Substack publication URL (e.g., yourname.substack.com)
              </p>
            </div>

            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                connect.sid Cookie Value
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="s%3A..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required={!isConfigured}
              />
              {isConfigured && (
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to keep current value, or enter new value to update
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Testing Connection...
                  </>
                ) : isConfigured ? (
                  'Update Configuration'
                ) : (
                  'Connect'
                )}
              </button>

              {isConfigured && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={testing}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  Disconnect
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-sm text-gray-500">
          <p>
            <strong>Security Note:</strong> Your cookie is stored locally on the server and is never
            shared. The cookie provides full access to your Substack account, so keep it secure.
          </p>
        </div>
      </main>
    </div>
  )
}
