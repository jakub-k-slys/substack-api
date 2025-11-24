'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkConfig() {
      try {
        const res = await fetch('/api/config')
        const data = await res.json()

        if (data.isConfigured) {
          router.push('/dashboard')
        } else {
          router.push('/settings')
        }
      } catch {
        router.push('/settings')
      } finally {
        setChecking(false)
      }
    }

    checkConfig()
  }, [router])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return null
}
