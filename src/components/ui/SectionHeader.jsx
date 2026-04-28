export default function SectionHeader({ title, subtitle, dark = false, color }) {
  const titleColor = color || (dark ? 'white' : 'var(--navy)')
  const subtitleColor = dark ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)'

  return (
    <div style={{ marginBottom: subtitle ? 8 : 0 }}>
      <h3 style={{
        margin: '0 0 6px',
        fontSize: 26,
        fontWeight: 700,
        color: titleColor,
        fontFamily: "'Source Sans 3', sans-serif",
      }}>
        {title}
      </h3>
      {subtitle && (
        <p style={{
          margin: 0,
          fontSize: 16,
          lineHeight: 1.5,
          color: subtitleColor,
          fontFamily: "'Source Sans 3', sans-serif",
        }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
