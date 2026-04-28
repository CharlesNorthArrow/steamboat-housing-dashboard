export default function SectionHeader({ title, subtitle, dark = false }) {
  return (
    <div
      style={{
        backgroundColor: dark ? 'var(--dark-bg)' : 'transparent',
        color: dark ? 'white' : 'var(--text-dark)',
        padding: dark ? '28px 32px' : '0',
        marginBottom: dark ? 0 : 16,
        borderRadius: dark ? '6px 6px 0 0' : 0,
      }}
    >
      <h3
        style={{
          margin: '0 0 6px',
          fontSize: 22,
          fontWeight: 700,
          color: dark ? 'white' : 'var(--navy)',
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          style={{
            margin: 0,
            fontSize: 15,
            lineHeight: 1.5,
            color: dark ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
