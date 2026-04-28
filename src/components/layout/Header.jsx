export default function Header() {
  return (
    <header
      style={{ backgroundColor: 'var(--white)', borderBottom: '2px solid var(--border)' }}
      role="banner"
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 80,
          gap: 24,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
            }}
          >
            City of Steamboat Springs
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--navy)',
              lineHeight: 1.2,
            }}
          >
            Affordable Housing Dashboard
          </h1>
        </div>

        {/* Header image placeholder — drop your aerial photo here as /public/steamboat-aerial.jpg */}
        <div
          role="img"
          aria-label="Aerial view of Steamboat Springs, Colorado"
          style={{
            width: 200,
            height: 64,
            borderRadius: 6,
            overflow: 'hidden',
            flexShrink: 0,
            background: 'var(--light-bg)',
            backgroundImage: 'url(/steamboat-aerial.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid var(--border)',
          }}
        />
      </div>
    </header>
  )
}
