const STATUS_STYLES = {
  'Adopted':                      { bg: '#2e8b57', text: '#fff' },
  'Implemented':                  { bg: '#2e8b57', text: '#fff' },
  'Complete':                     { bg: '#2e8b57', text: '#fff' },
  'Under Development':            { bg: 'var(--navy)', text: '#fff' },
  'In Progress':                  { bg: 'var(--navy)', text: '#fff' },
  'Under Review':                 { bg: 'var(--orange)', text: '#fff' },
  'Proposed':                     { bg: '#7a4f9e', text: '#fff' },
  'On Deck to be Considered':     { bg: 'var(--gold)', text: '#1a1a1a' },
  'Not Started':                  { bg: '#888', text: '#fff' },
}

function normalize(s) {
  if (!s) return 'Not Started'
  const t = s.trim()
  if (STATUS_STYLES[t]) return t
  const lower = t.toLowerCase()
  if (lower.includes('on deck') || lower.includes('deck')) return 'On Deck to be Considered'
  if (lower.includes('under development') || lower.includes('development')) return 'Under Development'
  if (lower.includes('complete')) return 'Complete'
  if (lower.includes('adopt') || lower.includes('implement')) return 'Adopted'
  if (lower.includes('progress') || lower.includes('active')) return 'In Progress'
  if (lower.includes('review')) return 'Under Review'
  if (lower.includes('propos')) return 'Proposed'
  return t
}

export default function StatusBadge({ status }) {
  const key = normalize(status)
  const style = STATUS_STYLES[key] || { bg: '#888', text: '#fff' }
  return (
    <span style={{
      display: 'inline-block',
      backgroundColor: style.bg,
      color: style.text,
      borderRadius: 4,
      padding: '3px 10px',
      fontSize: 13,
      fontWeight: 600,
      fontFamily: "'Source Sans 3', sans-serif",
    }}>
      {key}
    </span>
  )
}
