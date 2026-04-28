import { useState, useEffect, useRef } from 'react'

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const PROXIMITY = '-106.8317,40.4850'
const CACHE_PREFIX = 'geocache_v1_'

function fromCache(address) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + address)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function toCache(address, coords) {
  try {
    localStorage.setItem(CACHE_PREFIX + address, JSON.stringify(coords))
  } catch {}
}

async function geocodeOne(address) {
  const cached = fromCache(address)
  if (cached) return cached

  const query = encodeURIComponent(`${address}, Steamboat Springs, CO`)
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json` +
    `?access_token=${TOKEN}&proximity=${PROXIMITY}&country=US&types=address,place&limit=1`

  const res = await fetch(url)
  if (!res.ok) return null

  const json = await res.json()
  const feature = json.features?.[0]
  if (!feature) return null

  const [lng, lat] = feature.center
  const coords = { lat, lng }
  toCache(address, coords)
  return coords
}

// Returns { coords: { [address]: {lat, lng} }, loading: bool }
export function useGeocoder(addresses) {
  const [coords, setCoords] = useState({})
  const [loading, setLoading] = useState(false)
  const prevKey = useRef(null)

  useEffect(() => {
    if (!TOKEN || !addresses || addresses.length === 0) return

    const key = addresses.join('||')
    if (key === prevKey.current) return
    prevKey.current = key

    // Seed with anything already in cache so the map isn't empty during fetch
    const initial = {}
    addresses.forEach((a) => {
      const hit = fromCache(a)
      if (hit) initial[a] = hit
    })
    if (Object.keys(initial).length > 0) setCoords(initial)

    const uncached = addresses.filter((a) => !fromCache(a))
    if (uncached.length === 0) return

    setLoading(true)
    Promise.all(uncached.map(async (a) => [a, await geocodeOne(a).catch(() => null)]))
      .then((results) => {
        setCoords((prev) => {
          const next = { ...prev }
          results.forEach(([a, c]) => { if (c) next[a] = c })
          return next
        })
        setLoading(false)
      })
  }, [addresses.join('||')])

  return { coords, loading }
}
