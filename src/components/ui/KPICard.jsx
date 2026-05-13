export default function KPICard({ label, value, lastUpdated }) {
  return (
    <article
      style={{
        flex: '1 1 200px',
        textAlign: 'center',
        padding: '28px 24px',
        border: '1px solid var(--border)',
        borderRadius: 8,
        backgroundColor: 'white',
      }}
      aria-label={`${label}: ${value}`}
    >
      <h3 style={{
        margin: '0 0 10px',
        fontSize: 23,
        fontWeight: 300,
        color: 'var(--navy)',
        fontFamily: "'Source Sans 3', sans-serif",
        lineHeight: 1.35,
      }}>
        {label}
      </h3>
      <p style={{
        margin: '0 0 8px',
        fontSize: 29,
        fontWeight: 700,
        color: 'var(--orange)',
        fontFamily: "'Source Sans 3', sans-serif",
        lineHeight: 1.1,
      }}>
        {value}
      </p>
      {lastUpdated && (
        <p style={{ margin: 0, fontSize: 13, fontWeight: 300, color: '#000', fontFamily: "'Source Sans 3', sans-serif" }}>
          {lastUpdated}
        </p>
      )}
    </article>
  )
}
