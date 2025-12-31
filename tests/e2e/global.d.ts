declare global {
  var E2E_CONFIG: {
    hasCredentials: boolean
    token?: string
    publicationUrl?: string
  }

  function getTestCredentials(): { token: string; publicationUrl?: string } | null
}

export {}
