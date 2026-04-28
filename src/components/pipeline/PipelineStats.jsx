import { useMemo } from 'react'

const STATUS_CONFIG = {
  'Constructed and open': { color: '#2e8b57', label: 'Constructed and Open', icon: '✓', desc: 'Completed developments that are ready for residents.' },
  'Under construction': { color: '#1b3a5c', label: 'Under Construction', icon: '🔨', desc: 'Approved projects where physical building has begun.' },
  'Planned': { color: '#e07b2a', label: 'Planned', icon: '📋', desc: 'Active projects are in the design, review, or pre-development phase.' },
  'In discussion': { color: '#7a4f9e', label: 'In Discussion', icon: '💡', desc: 'Early concepts currently being explored for feasibility.' },
}

function normalizeStatus(s) {
  if (!s) return 'In discussion'
  const lower = s.toLowerCase()
  if (lower.includes('constructed') || lower.includes('open')) return 'Constructed and open'
  if (lower.includes('under') || lower.includes('construction')) return 'Under construction'
  if (lower.includes('planned')) return 'Planned'
  return 'In discussion'
}

export { normalizeStatus, STATUS_CONFIG }

export default function PipelineStats({ data }) {
  const stats = useMemo(() => {
    if (!data) return {}
    const groups = {}
    Object.keys(STATUS_CONFIG).forEach((k) => { groups[k] = { count: 0, units: 0 } })
    data.forEach((row) => {
      const status = normalizeStatus(row.Status)
      groups[status].count += 1
      const units = parseInt(row['Unit Count']?.replace(/,/g, '') || 0, 10)
      groups[status].units += isNaN(units) ? 0 : units
    })
    return groups
  }, [data])

  const totalDev = Object.values(stats).reduce((s, g) => s + g.count, 0)
  const totalUnits = Object.values(stats).reduce((s, g) => s + g.units, 0)
  const builtCount = stats['Constructed and open']?.count || 0
  const pipelineCount = totalDev - builtCount

  return (
    <div>
      <p style={{ fontSize: 15, color: 'white', marginBottom: 16 }}>
        There are{' '}
        <strong style={{ color: 'white' }}>{builtCount}</strong> built developments, and{' '}
        <strong style={{ color: 'white' }}>{pipelineCount}</strong> currently in the pipeline
      </p>

      <table
        style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, color: 'white', marginBottom: 24 }}
        aria-label="Pipeline summary by status"
      >
        <caption className="sr-only">Affordable Housing Pipeline Summary</caption>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
            <th scope="col" style={{ textAlign: 'left', padding: '4px 8px 8px 0', fontWeight: 600 }}>Status</th>
            <th scope="col" style={{ textAlign: 'right', padding: '4px 8px 8px', fontWeight: 600 }}>Developments</th>
            <th scope="col" style={{ textAlign: 'right', padding: '4px 0 8px', fontWeight: 600 }}>Units</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th scope="row" style={{ textAlign: 'left', padding: '6px 8px 6px 0', fontWeight: 400 }}>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', backgroundColor: cfg.color, marginRight: 8 }} aria-hidden="true" />
                {cfg.label}
              </th>
              <td style={{ textAlign: 'right', padding: '6px 8px' }}>{stats[key]?.count ?? 0}</td>
              <td style={{ textAlign: 'right', padding: '6px 0' }}>
                {stats[key]?.units > 0 ? stats[key].units : '—'}
              </td>
            </tr>
          ))}
          <tr style={{ borderTop: '2px solid rgba(255,255,255,0.4)' }}>
            <th scope="row" style={{ textAlign: 'left', padding: '8px 8px 4px 0', fontWeight: 700 }}>Potential Total</th>
            <td style={{ textAlign: 'right', padding: '8px 8px 4px', fontWeight: 700 }}>{totalDev}</td>
            <td style={{ textAlign: 'right', padding: '8px 0 4px', fontWeight: 700 }}>{totalUnits}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: 13, color: 'white', lineHeight: 1.6 }}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <p key={key} style={{ margin: '0 0 6px' }}>
            <strong style={{ color: 'white' }}>{cfg.label}:</strong> {cfg.desc}
          </p>
        ))}
      </div>
    </div>
  )
}
