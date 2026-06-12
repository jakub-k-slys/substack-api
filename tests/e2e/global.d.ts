declare global {
  var E2E_CONFIG: {
    hasCredentials: boolean
    substackSid?: string
    connectSid?: string
    publicationUrl?: string
  }

  function getTestCredentials(): {
    substackSid?: string
    connectSid?: string
    publicationUrl?: string
  } | null
}

export {}
