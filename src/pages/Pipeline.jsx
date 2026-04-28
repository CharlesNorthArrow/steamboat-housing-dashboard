import { useState, useRef } from 'react'
import { useGoogleSheet } from '../hooks/useGoogleSheet'
import { SHEET_URLS } from '../utils/sheetUrls'
import PipelineStats from '../components/pipeline/PipelineStats'
import PipelineFilters from '../components/pipeline/PipelineFilters'
import PipelineMap from '../components/pipeline/PipelineMap'
import PipelineTable from '../components/pipeline/PipelineTable'
import SectionHeader from '../components/ui/SectionHeader'

export default function Pipeline() {
  const { data, loading, error } = useGoogleSheet(SHEET_URLS.housingPipeline)
  const [statusFilter, setStatusFilter] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('')
  const announceRef = useRef(null)

  return (
    <div id="panel-pipeline" role="tabpanel" aria-labelledby="tab-pipeline" tabIndex={-1}>

      {/* Dark header with stats */}
      <div style={{ backgroundColor: 'var(--dark-bg)', color: 'white' }}>
        <div className="section-pad">
          <h2 style={{ margin: '0 0 8px', fontSize: 40, color: 'white', fontFamily: "'Source Sans 3', sans-serif" }}>
            Housing Pipeline
          </h2>
          <p style={{ fontSize: 20, color: 'white', marginBottom: 24, fontFamily: "'Source Sans 3', sans-serif" }}>
            Tracking affordable housing developments across all stages in Steamboat Springs.
          </p>
          {loading && (
            <p style={{ color: 'white', fontSize: 14 }}>Loading pipeline data...</p>
          )}
          {error && (
            <p style={{ color: '#f87171', fontSize: 14 }}>Error loading data: {error}</p>
          )}
          {!loading && !error && data && (
            <PipelineStats data={data} />
          )}
        </div>
      </div>

      {/* Map section */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid var(--border)' }}>
        <div className="section-pad">
          <SectionHeader
            title="Development Map"
            subtitle="Each circle represents a development — size reflects unit count, color reflects status."
          />
          {!loading && !error && (
            <PipelineMap data={data || []} />
          )}
          {loading && (
            <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', fontSize: 14 }}>
              Loading map data...
            </div>
          )}
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
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading developments...</p>
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
