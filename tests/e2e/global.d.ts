declare global {
  var E2E_CONFIG: {
    hasCredentials: boolean
    apiKey?: string
    hostname?: string
  }

  function getTestCredentials(): { apiKey: string; hostname?: string } | null
}

export {}
