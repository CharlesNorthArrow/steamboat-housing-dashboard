export default function KPICard({ label, value, lastUpdated }) {
  return (
    <article
      style={{
        backgroundColor: 'var(--navy)',
        color: 'white',
        borderRadius: 8,
        padding: '28px 24px',
        flex: '1 1 280px',
        minWidth: 0,
      }}
      aria-label={`${label}: ${value}`}
    >
      <h3
        style={{
          margin: '0 0 12px',
          fontSize: 15,
          fontWeight: 600,
          fontFamily: "'Source Sans 3', sans-serif",
          color: 'rgba(255,255,255,0.85)',
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </h3>
      <p
        style={{
          margin: '0 0 8px',
          fontSize: 36,
          fontWeight: 700,
          fontFamily: "'Source Sans 3', sans-serif",
          color: 'var(--gold)',
          lineHeight: 1.1,
        }}
      >
        {value}
      </p>
      {lastUpdated && (
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{lastUpdated}</p>
      )}
    </article>
  )
}
