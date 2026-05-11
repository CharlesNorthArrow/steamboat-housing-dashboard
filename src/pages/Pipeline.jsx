import { useState, useRef, useMemo } from 'react'
import { useGoogleSheet } from '../hooks/useGoogleSheet'
import { SHEET_URLS } from '../utils/sheetUrls'
import { normalizeStatus, STATUS_CONFIG } from '../components/pipeline/PipelineStats'
import PipelineFilters from '../components/pipeline/PipelineFilters'
import PipelineMap from '../components/pipeline/PipelineMap'
import PipelineTable from '../components/pipeline/PipelineTable'
import SectionHeader from '../components/ui/SectionHeader'
import ReadAloudButton from '../components/ui/ReadAloudButton'

const STATUS_ICONS = {
  'Constructed and open': (color) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill={color} />
      <path d="M6 10.5l2.5 2.5 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'Under construction': null,
  'Planned': (color) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="2.5" strokeDasharray="5 3" />
    </svg>
  ),
  'In discussion': null,
}

export default function Pipeline() {
  const { data, loading, error } = useGoogleSheet(SHEET_URLS.housingPipeline)
  const [statusFilter, setStatusFilter] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('')
  const announceRef = useRef(null)

  const stats = useMemo(() => {
    const empty = { totalDev: 0, builtCount: 0, pipelineCount: 0, totalUnits: 0, groups: {} }
    if (!data) return empty
    const groups = {}
    Object.keys(STATUS_CONFIG).forEach(k => { groups[k] = { count: 0, units: 0 } })
    data.forEach(row => {
      const status = normalizeStatus(row.Status)
      if (groups[status]) {
        groups[status].count += 1
        const u = parseInt((row['Unit Count'] || '0').replace(/,/g, ''), 10)
        groups[status].units += isNaN(u) ? 0 : u
      }
    })
    const totalDev = data.length
    const builtCount = groups['Constructed and open']?.count || 0
    const pipelineCount = totalDev - builtCount
    const totalUnits = Object.values(groups).reduce((s, g) => s + g.units, 0)
    return { totalDev, builtCount, pipelineCount, totalUnits, groups }
  }, [data])

  const SCRIPTS = {
    intro: [
      { text: "Development Pipeline.", readId: "pl-intro-title" },
      { text: "New projects are underway, signaling progress but underscoring how far Steamboat Springs still has to go.", readId: "pl-intro-sub" },
      { text: "New developments are emerging, yet the number of income-restricted units remains far below what's needed to meet local demand. Building at scale will require continued coordination among the city, housing partners, and private developers. Each new project brings the community closer to ensuring that the people who power Steamboat Springs can continue to call it home.", readId: "pl-intro-p" },
    ],
    developments: [
      { text: "Affordable Housing Developments.", readId: "pl-dev-header" },
      { text: `There are ${stats.builtCount} built developments, and ${stats.pipelineCount} currently in the pipeline, for a potential total of ${stats.totalDev} developments and ${stats.totalUnits} units.`, readId: "pl-dev-sub" },
    ],
  }

  return (
    <div id="panel-pipeline" role="tabpanel" aria-labelledby="tab-pipeline" tabIndex={-1}>

      {/* Intro banner */}
      <div className="banner-pad" style={{ backgroundColor: 'var(--light-bg)' }}>
        <h2 data-read-id="pl-intro-title" style={{ margin: '0 0 10px', fontSize: 40, fontWeight: 700, color: 'var(--orange)', fontFamily: "'Source Sans 3', sans-serif" }}>
          Development Pipeline
        </h2>
        <p data-read-id="pl-intro-sub" style={{ margin: '0 0 16px', fontSize: 17, color: 'var(--text-muted)', fontFamily: "'Source Sans 3', sans-serif" }}>
          New projects are underway, signaling progress but underscoring how far Steamboat Springs still has to go.
        </p>
        <p data-read-id="pl-intro-p" style={{ margin: 0, fontSize: 16, color: 'var(--text-dark)', lineHeight: 1.75, fontFamily: "'Source Sans 3', sans-serif" }}>
          New developments are emerging, yet the number of income-restricted units remains far below what's needed
          to meet local demand. Building at scale will require continued coordination among the city, housing
          partners, and private developers. Each new project brings the community closer to ensuring that the
          people who power Steamboat Springs can continue to call it home.
        </p>
        <div style={{ marginTop: 20 }}>
          <ReadAloudButton segments={SCRIPTS.intro} dark={false} />
        </div>
      </div>

      {/* Affordable Housing Developments — navy section header */}
      <div className="banner-pad" style={{ backgroundColor: 'var(--navy)' }}>
        <div className="banner-flex">
          <div data-read-id="pl-dev-header">
            <SectionHeader dark
              title="Affordable Housing Developments"
              subtitle={!loading && !error && data
                ? `There are ${stats.builtCount} built developments, and ${stats.pipelineCount} currently in the pipeline`
                : 'Loading development data…'
              }
            />
          </div>
          <ReadAloudButton segments={SCRIPTS.developments} />
        </div>
      </div>

      {/* Stats + Map card */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid var(--border)' }}>
        <div className="section-pad">
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>

            {/* Card body: stats left, map right */}
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>

              {/* Left: stats table + legend */}
              <div style={{ flex: '0 0 50%', borderRight: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <table
                  style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Source Sans 3', sans-serif", fontSize: 16, fontWeight: 700 }}
                  aria-label="Pipeline summary by status"
                >
                  <caption style={{ captionSide: 'bottom', textAlign: 'left', paddingTop: 8, fontSize: 14, color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: "'Source Sans 3', sans-serif" }}>
                    {statusFilter
                      ? <>Filtered by: <strong style={{ color: STATUS_CONFIG[statusFilter]?.color }}>{STATUS_CONFIG[statusFilter]?.label}</strong> — <button onClick={() => setStatusFilter('')} style={{ background: 'none', border: 'none', color: 'var(--navy)', cursor: 'pointer', textDecoration: 'underline', fontSize: 14, fontFamily: 'inherit', padding: 0 }}>Clear filter</button></>
                      : 'Click a row to filter the map and directory below'
                    }
                  </caption>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th scope="col" colSpan={2} style={{ textAlign: 'left', padding: '0 8px 10px 0', fontWeight: 600, color: 'var(--navy)' }}>
                        Status
                      </th>
                      <th scope="col" style={{ textAlign: 'right', padding: '0 8px 10px', fontWeight: 600, color: 'var(--navy)' }}>
                        Developments
                      </th>
                      <th scope="col" style={{ textAlign: 'right', padding: '0 0 10px', fontWeight: 600, color: 'var(--navy)' }}>
                        Units
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                      const g = stats.groups?.[key] || { count: 0, units: 0 }
                      const iconFn = STATUS_ICONS[key]
                      const isSelected = statusFilter === key
                      return (
                        <tr
                          key={key}
                          onClick={() => setStatusFilter(isSelected ? '' : key)}
                          style={{
                            borderBottom: '1px solid var(--border)',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? `${cfg.color}18` : undefined,
                            outline: isSelected ? `2px solid ${cfg.color}` : undefined,
                            outlineOffset: -2,
                          }}
                          aria-pressed={isSelected}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setStatusFilter(isSelected ? '' : key) } }}
                          aria-label={`Filter by ${cfg.label}${isSelected ? ' — active, click to clear' : ''}`}
                        >
                          <td style={{ width: 28, padding: '10px 4px 10px 0', verticalAlign: 'middle' }}>
                            {iconFn ? iconFn(cfg.color) : null}
                          </td>
                          <th scope="row" style={{ textAlign: 'left', padding: '10px 12px 10px 0', fontWeight: 700, color: cfg.color }}>
                            {cfg.label}
                          </th>
                          <td style={{ textAlign: 'right', padding: '10px 8px', fontSize: 18, fontWeight: 700, color: cfg.color }}>
                            {g.count}
                          </td>
                          <td style={{ textAlign: 'right', padding: '10px 0', fontSize: 18, fontWeight: 700, color: cfg.color }}>
                            {g.units > 0 ? g.units : (g.count > 0 ? 'No data' : '—')}
                          </td>
                        </tr>
                      )
                    })}
                    <tr style={{ borderTop: '2px solid var(--navy)' }}>
                      <td style={{ width: 28, padding: '12px 4px 8px 0', verticalAlign: 'middle' }}>
                        <span aria-hidden="true" style={{ fontSize: 16 }}>💡</span>
                      </td>
                      <th scope="row" style={{ textAlign: 'left', padding: '12px 12px 8px 0', fontWeight: 700, color: 'var(--navy)' }}>
                        Potential Total
                      </th>
                      <td style={{ textAlign: 'right', padding: '12px 8px 8px', fontSize: 19, fontWeight: 700, color: 'var(--navy)' }}>
                        {stats.totalDev}
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px 0 8px', fontSize: 19, fontWeight: 700, color: 'var(--navy)' }}>
                        {stats.totalUnits > 0 ? stats.totalUnits : '—'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 16, color: 'var(--text-dark)', fontFamily: "'Source Sans 3', sans-serif", lineHeight: 1.6 }}>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <p key={key} style={{ margin: '0 0 6px' }}>
                      <strong style={{ color: cfg.color }}>{cfg.label}:</strong> {cfg.desc}
                    </p>
                  ))}
                </div>
              </div>

              {/* Right: map */}
              <div style={{ flex: '0 0 50%', padding: '24px' }}>
                {loading && (
                  <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                    Loading map data…
                  </div>
                )}
                {error && (
                  <p style={{ color: '#c0392b', fontSize: 14 }}>Error loading data: {error}</p>
                )}
                {!loading && !error && (
                  <PipelineMap data={data || []} statusFilter={statusFilter} />
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="section-pad" style={{ paddingBottom: 64 }}>
        <SectionHeader
          title="Development Directory"
          subtitle="Browse, filter, and explore all tracked affordable housing developments."
        />

        <PipelineFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          ownerFilter={ownerFilter}
          setOwnerFilter={setOwnerFilter}
          announceRef={announceRef}
        />

        {loading && (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading developments…</p>
        )}
        {error && (
          <p style={{ color: '#c0392b', fontSize: 14 }}>Error loading developments: {error}</p>
        )}
        {!loading && !error && (
          <PipelineTable
            data={data || []}
            statusFilter={statusFilter}
            ownerFilter={ownerFilter}
            announceRef={announceRef}
          />
        )}
      </div>
    </div>
  )
}
