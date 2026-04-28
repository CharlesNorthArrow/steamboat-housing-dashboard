import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { normalizeStatus, STATUS_CONFIG } from './PipelineStats'

const CENTER = [40.4850, -106.8317]
const ZOOM = 13

function unitRadius(unitCount) {
  const n = parseInt(String(unitCount || '0').replace(/,/g, ''), 10)
  if (isNaN(n) || n === 0) return 6
  return Math.min(28, Math.max(6, Math.sqrt(n) * 1.8))
}

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (!points || points.length === 0) return
    const latlngs = points.filter((p) => p.lat && p.lng).map((p) => [p.lat, p.lng])
    if (latlngs.length > 0) {
      map.fitBounds(latlngs, { padding: [32, 32], maxZoom: 15 })
    }
  }, [map, points])
  return null
}

export default function PipelineMap({ data }) {
  const skipRef = useRef(null)

  const points = (data || []).reduce((acc, row) => {
    const lat = parseFloat(row.Latitude || row.latitude || row.Lat || row.lat)
    const lng = parseFloat(row.Longitude || row.longitude || row.Lng || row.lng || row.Long || row.long)
    if (isNaN(lat) || isNaN(lng)) return acc
    const status = normalizeStatus(row.Status)
    const cfg = STATUS_CONFIG[status]
    acc.push({
      lat,
      lng,
      name: row['Development Name'] || row.Name || row.name || 'Unnamed Development',
      status,
      statusLabel: cfg?.label || status,
      color: cfg?.color || '#1b3a5c',
      unitCount: row['Unit Count'] || '—',
      affordability: row.Affordability || row['AMI Level'] || '—',
      address: row.Address || row.address || '—',
      type: row['Rental or Ownership'] || row.Type || '—',
      context: row.Context || row.Notes || '—',
      radius: unitRadius(row['Unit Count']),
    })
    return acc
  }, [])

  return (
    <div>
      <a
        ref={skipRef}
        href="#pipeline-table"
        className="skip-link"
        style={{ position: 'absolute', left: '-9999px', top: 'auto', zIndex: 9999 }}
        onFocus={(e) => { e.currentTarget.style.left = '8px'; e.currentTarget.style.top = '8px' }}
        onBlur={(e) => { e.currentTarget.style.left = '-9999px'; e.currentTarget.style.top = 'auto' }}
      >
        Skip map, go to data table
      </a>

      <div
        role="application"
        aria-label="Map showing affordable housing developments in Steamboat Springs. Use arrow keys or Tab to navigate markers."
        style={{ height: 480, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}
      >
        <MapContainer
          center={CENTER}
          zoom={ZOOM}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.length > 0 && <FitBounds points={points} />}
          {points.map((pt, i) => (
            <CircleMarker
              key={i}
              center={[pt.lat, pt.lng]}
              radius={pt.radius}
              pathOptions={{
                fillColor: pt.color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.85,
              }}
            >
              <Popup>
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, minWidth: 200 }}>
                  <strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>{pt.name}</strong>
                  <span style={{ display: 'inline-block', backgroundColor: pt.color, color: '#fff', borderRadius: 3, padding: '1px 7px', fontSize: 11, marginBottom: 8 }}>
                    {pt.statusLabel}
                  </span>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <tbody>
                      {[
                        ['Type', pt.type],
                        ['Units', pt.unitCount],
                        ['Affordability', pt.affordability],
                        ['Address', pt.address],
                      ].map(([label, val]) => (
                        <tr key={label}>
                          <th scope="row" style={{ textAlign: 'left', fontWeight: 600, paddingRight: 8, paddingBottom: 2, whiteSpace: 'nowrap', verticalAlign: 'top' }}>{label}</th>
                          <td style={{ paddingBottom: 2, verticalAlign: 'top' }}>{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {points.length === 0 && (
        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          No mappable developments found — latitude/longitude columns may not be present in the data sheet.
        </p>
      )}

      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 16 }} aria-label="Map legend">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: "'Source Sans 3', sans-serif" }}>
            <span
              style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: cfg.color, border: '2px solid #fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.2)' }}
              aria-hidden="true"
            />
            {cfg.label}
          </span>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
          Circle size = unit count
        </span>
      </div>
    </div>
  )
}
