import { useMemo } from 'react'
import KPICard from '../ui/KPICard'
import { useGoogleSheet } from '../../hooks/useGoogleSheet'
import { SHEET_URLS } from '../../utils/sheetUrls'

function HousesIcon() {
  return (
    <svg width="72" height="64" viewBox="0 0 72 64" fill="none" aria-hidden="true">
      <polygon points="4,32 20,14 36,32" fill="var(--orange)" opacity="0.65" />
      <rect x="6" y="32" width="28" height="22" rx="1" fill="var(--orange)" opacity="0.65" />
      <rect x="15" y="38" width="10" height="16" fill="white" opacity="0.45" />
      <polygon points="28,29 46,9 64,29" fill="var(--orange)" />
      <rect x="30" y="29" width="32" height="24" rx="1" fill="var(--orange)" />
      <rect x="41" y="35" width="11" height="18" fill="white" opacity="0.4" />
    </svg>
  )
}

export default function PolicyKPICards() {
  const { data, loading, error } = useGoogleSheet(SHEET_URLS.investmentStats)

  const cards = useMemo(() => {
    if (!data || data.length === 0) return []
    const vals = Object.values(data[0])
    // A2=vals[0], B2=vals[1], C2=vals[2], D2=vals[3], E2=vals[4], F2=vals[5]
    return [
      { label: 'Current STR Fund Balance',               value: vals[0] || '—', note: vals[1] || '' },
      { label: 'Total Units Supported by STR Investments', value: vals[4] || '—', note: vals[5] || '' },
      { label: 'Total STR Grant and Loan Investments',    value: vals[2] || '—', note: vals[3] || '' },
    ]
  }, [data])

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: "'Source Sans 3', sans-serif" }}>Loading investment stats…</p>
  if (error)   return <p style={{ color: '#c0392b', fontSize: 14 }}>Error loading stats: {error}</p>

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, width: '100%' }}>
      <div style={{ flexShrink: 0, padding: '0 8px' }}>
        <HousesIcon />
      </div>
      <div className="kpi-cards" style={{ display: 'flex', flex: 1, gap: 20 }}>
        {cards.map((card, i) => (
          <KPICard key={i} label={card.label} value={card.value} lastUpdated={card.note} />
        ))}
      </div>
    </div>
  )
}
