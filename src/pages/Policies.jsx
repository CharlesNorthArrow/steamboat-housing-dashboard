import { useState, useMemo } from 'react'
import { useGoogleSheet } from '../hooks/useGoogleSheet'
import { SHEET_URLS } from '../utils/sheetUrls'
import PolicyKPICards from '../components/policies/PolicyKPICards'
import PolicySelector from '../components/policies/PolicySelector'
import PolicyDetail from '../components/policies/PolicyDetail'
import SectionHeader from '../components/ui/SectionHeader'
import ReadAloudButton from '../components/ui/ReadAloudButton'

function parsePolicies(data) {
  if (!data) return []
  return data.map((row, i) => {
    const v = Object.values(row)
    return {
      id: String(i),
      name: v[0] || `Policy ${i + 1}`,  // A
      challenges: v[3] || '',             // D
      detailedStatus: v[4] || '',         // E
      description: v[5] || '',            // F
      status: v[13] || '',               // N
      moreInfo: v[14] || '',             // O
    }
  })
}

export default function Policies() {
  const { data, loading, error } = useGoogleSheet(SHEET_URLS.policyOptions)
  const [selectedId, setSelectedId] = useState(null)

  const policies = useMemo(() => parsePolicies(data), [data])

  const firstId = policies[0]?.id
  const resolvedSelectedId = selectedId ?? firstId ?? null
  const resolvedPolicy = policies.find((p) => p.id === resolvedSelectedId) || null

  const introSegments = [
    { text: 'Housing Investments, Programs and Policies.', readId: 'pol-intro-title' },
    { text: 'Steamboat Springs is deploying a diverse suite of policy tools to address the housing crisis.', readId: 'pol-intro-sub' },
    { text: 'The city is actively utilizing deed restrictions, zoning updates, development incentives, funding from Short-Term Rentals, and inclusionary housing measures. This comprehensive toolkit is designed to increase supply and ensure that the people who work in Steamboat Springs can afford to live here.', readId: 'pol-intro-p' },
  ]

  const sectionSegments = useMemo(() => [
    { text: 'Policy Options Deep Dive.' },
    { text: policies.length > 0
        ? `There are currently ${policies.length} policy tools actively being considered and advanced in Steamboat Springs.`
        : '' },
  ], [policies.length])

  return (
    <div id="panel-policies" role="tabpanel" aria-labelledby="tab-policies" tabIndex={-1}>

      {/* Intro banner */}
      <div className="banner-pad" style={{ backgroundColor: 'var(--light-bg)' }}>
        <h2 data-read-id="pol-intro-title" style={{ margin: '0 0 10px', fontSize: 40, fontWeight: 700, color: 'var(--orange)', fontFamily: "'Source Sans 3', sans-serif" }}>
          Housing Investments, Programs and Policies
        </h2>
        <p data-read-id="pol-intro-sub" style={{ margin: '0 0 16px', fontSize: 17, color: 'var(--text-muted)', fontFamily: "'Source Sans 3', sans-serif" }}>
          Steamboat Springs is deploying a diverse suite of policy tools to address the housing crisis.
        </p>
        <p data-read-id="pol-intro-p" style={{ margin: 0, fontSize: 16, color: 'var(--text-dark)', lineHeight: 1.75, fontFamily: "'Source Sans 3', sans-serif" }}>
          The city is actively utilizing deed restrictions, zoning updates, development incentives, funding from
          Short-Term Rentals, and inclusionary housing measures. This comprehensive toolkit is designed to
          increase supply and ensure that the people who work in Steamboat Springs can afford to live here.
        </p>
        <div style={{ marginTop: 20 }}>
          <ReadAloudButton segments={introSegments} dark={false} />
        </div>
      </div>

      {/* Policy Options Deep Dive — navy section header */}
      <div className="banner-pad" style={{ backgroundColor: 'var(--navy)' }}>
        <div className="banner-flex">
          <SectionHeader dark
            title="Policy Options Deep Dive"
            subtitle={policies.length > 0
              ? `There are currently ${policies.length} policy tools actively being considered and advanced in Steamboat Springs.`
              : 'Loading policy data…'
            }
          />
          <div style={{ flexShrink: 0, paddingTop: 4 }}>
            <ReadAloudButton segments={sectionSegments} dark={true} />
          </div>
        </div>
      </div>

      {/* KPI bar + Policy explorer */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid var(--border)' }}>
        <div className="section-pad" style={{ paddingBottom: 64 }}>

          {/* KPI stats bar */}
          <div style={{ paddingBottom: 28, marginBottom: 28, borderBottom: '1px solid var(--border)' }}>
            <PolicyKPICards />
          </div>

          {loading && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading policies…</p>}
          {error   && <p style={{ color: '#c0392b',      fontSize: 14 }}>Error loading policies: {error}</p>}
          {!loading && !error && policies.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No policy data found.</p>
          )}

          {!loading && !error && policies.length > 0 && (
            <div className="policy-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(280px, 320px) 1fr',
              border: '1px solid var(--border)',
              borderRadius: 6,
              overflow: 'hidden',
              minHeight: 600,
            }}>
              <div className="policy-sidebar" style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
    </div>
  )
}
