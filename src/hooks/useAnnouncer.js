import { useState, useCallback } from 'react'

export function useAnnouncer() {
  const [message, setMessage] = useState('')

  const announce = useCallback((text) => {
    setMessage('')
    requestAnimationFrame(() => setMessage(text))
  }, [])

  return { message, announce }
}
