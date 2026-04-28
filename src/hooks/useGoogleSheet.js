import { useState, useEffect } from 'react'
import { parseCSV } from '../utils/csvParser'

const MAX_RETRIES = 3
const RETRY_DELAY = 1500

async function fetchWithRetry(url, attempts = 0) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } catch (err) {
    if (attempts < MAX_RETRIES - 1) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY * (attempts + 1)))
      return fetchWithRetry(url, attempts + 1)
    }
    throw err
  }
}

export function useGoogleSheet(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!url) return
    let cancelled = false

    setLoading(true)
    setError(null)

    fetchWithRetry(url)
      .then((text) => {
        if (!cancelled) {
          setData(parseCSV(text))
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load data')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [url])

  return { data, loading, error }
}
