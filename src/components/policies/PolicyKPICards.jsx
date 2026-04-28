import { useMemo } from 'react'
import KPICard from '../ui/KPICard'
import { useGoogleSheet } from '../../hooks/useGoogleSheet'
import { SHEET_URLS } from '../../utils/sheetUrls'

export default function PolicyKPICards() {
  const { data, loading, error } = useGoogleSheet(SHEET_URLS.investmentStats)

  const cards = useMemo(() => {
    if (!data || data.length === 0) return []
    // Expect rows with columns: Label, Value (and optionally Note)
    return data.slice(0, 3).map((row) => ({
      label: row.Label || row.label || row.Metric || row.metric || Object.values(row)[0] || '',
      value: row.Value || row.value || row.Amount || row.amount || Object.values(row)[1] || '—',
      note: row.Note || row.note || row.Source || '',
    }))
  }, [data])

  if (loading) {
    return <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Loading investment stats...</p>
  }
  if (error) {
    return <p style={{ color: '#f87171', fontSize: 14 }}>Error loading stats: {error}</p>
  }
  if (cards.length === 0) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 8 }}>
      {cards.map((card, i) => (
        <KPICard key={i} label={card.label} value={card.value} lastUpdated={card.note} />
      ))}
    </div>
  )
}
