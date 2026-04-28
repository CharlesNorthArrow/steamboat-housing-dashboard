import { useState, useMemo } from 'react'
import { useGoogleSheet } from '../hooks/useGoogleSheet'
import { SHEET_URLS } from '../utils/sheetUrls'
import PolicyKPICards from '../components/policies/PolicyKPICards'
import PolicySelector from '../components/policies/PolicySelector'
import PolicyDetail from '../components/policies/PolicyDetail'
import SectionHeader from '../components/ui/SectionHeader'

function parsePolicies(data) {
  if (!data) return []
  return data.map((row, i) => ({
    id: String(i),
    name: row['Policy Name'] || row['Name'] || row['Policy'] || row.name || `Policy ${i + 1}`,
    status: row['Status'] || row['status'] || '',
    description: row['Description'] || row['description'] || row['Summary'] || '',
    detailedStatus: row['Detailed Status'] || row['Detailed status'] || row['Implementation Status'] || '',
    challenges: row['Implementation Challenges'] || row['Challenges'] || row['Barriers'] || '',
    lead: row['Lead Organization'] || row['Lead'] || row['Lead Agency'] || '',
    timeline: row['Timeline'] || row['timeline'] || '',
    moreInfo: row['More Information'] || row['More Info'] || row['Link'] || '',
    moreInfoUrl: row['More Information URL'] || row['URL'] || row['Link URL'] || '',
  }))
}

export default function Policies() {
  const { data, loading, error } = useGoogleSheet(SHEET_URLS.policyOptions)
  const [selectedId, setSelectedId] = useState(null)

  const policies = useMemo(() => parsePolicies(data), [data])

  const firstId = policies[0]?.id
  const resolvedSelectedId = selectedId ?? firstId ?? null
  const resolvedPolicy = policies.find((p) => p.id === resolvedSelectedId) || null

  return (
    <div id="panel-policies" role="tabpanel" aria-labelledby="tab-policies" tabIndex={-1}>

      {/* Dark header */}
      <div style={{ backgroundColor: 'var(--dark-bg)', color: 'white' }}>
        <div className="section-pad">
          <h2 style={{ margin: '0 0 8px', fontSize: 40, color: 'white', fontFamily: "'Source Sans 3', sans-serif" }}>
            Policies &amp; Actions
          </h2>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)', marginBottom: 32, fontFamily: "'Source Sans 3', sans-serif" }}>
            Explore the affordable housing policies and programs being considered, implemented, or underway in Steamboat Springs.
          </p>
          <PolicyKPICards />
        </div>
      </div>

      {/* Policy explorer */}
      <div className="section-pad" style={{ paddingBottom: 64 }}>
        <SectionHeader
          title="Policy Explorer"
          subtitle="Select a policy to view its status, description, and implementation details."
        />

        {loading && (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading policies...</p>
        )}
        {error && (
          <p style={{ color: '#c0392b', fontSize: 14 }}>Error loading policies: {error}</p>
        )}

        {!loading && !error && policies.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No policy data found.</p>
        )}

        {!loading && !error && policies.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 340px) 1fr',
            gap: 0,
            border: '1px solid var(--border)',
            borderRadius: 6,
            overflow: 'hidden',
            minHeight: 600,
          }}>
            <div style={{ borderRight: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <PolicySelector
                policies={policies}
                selectedId={resolvedSelectedId}
                onSelect={setSelectedId}
              />
            </div>
            <div style={{ backgroundColor: 'white', overflowY: 'auto' }}>
              <PolicyDetail policy={resolvedPolicy} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
