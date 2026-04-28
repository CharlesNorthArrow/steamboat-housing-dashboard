const STATUS_STYLES = {
  'Adopted': { bg: '#2e8b57', label: 'Adopted' },
  'In Progress': { bg: '#1b3a5c', label: 'In Progress' },
  'Under Review': { bg: '#e07b2a', label: 'Under Review' },
  'Proposed': { bg: '#7a4f9e', label: 'Proposed' },
  'Not Started': { bg: '#888', label: 'Not Started' },
  'Implemented': { bg: '#2e8b57', label: 'Implemented' },
}

function normalize(s) {
  if (!s) return 'Not Started'
  const t = s.trim()
  if (STATUS_STYLES[t]) return t
  const lower = t.toLowerCase()
  if (lower.includes('adopt') || lower.includes('implement')) return 'Adopted'
  if (lower.includes('progress') || lower.includes('active')) return 'In Progress'
  if (lower.includes('review')) return 'Under Review'
  if (lower.includes('propos')) return 'Proposed'
  return t
}

export default function StatusBadge({ status }) {
  const key = normalize(status)
  const style = STATUS_STYLES[key] || { bg: '#888', label: status || 'Unknown' }
  return (
    <span style={{
      display: 'inline-block',
      backgroundColor: style.bg,
      color: '#fff',
      borderRadius: 4,
      padding: '3px 10px',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.03em',
      fontFamily: "'Source Sans 3', sans-serif",
    }}>
      {style.label}
    </span>
  )
}
