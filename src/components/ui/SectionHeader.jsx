export default function SectionHeader({ title, subtitle, color = 'var(--navy)' }) {
  return (
    <div style={{ marginBottom: subtitle ? 8 : 0 }}>
      <h3 style={{
        margin: '0 0 6px',
        fontSize: 26,
        fontWeight: 700,
        color,
        fontFamily: "'Source Sans 3', sans-serif",
      }}>
        {title}
      </h3>
      {subtitle && (
        <p style={{
          margin: 0,
          fontSize: 16,
          lineHeight: 1.5,
          color: 'var(--text-muted)',
          fontFamily: "'Source Sans 3', sans-serif",
        }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
