const TAB_IMAGES = {
  'trail-forward': '/header-trail-forward.jpg',
  'affordability':  '/header-affordability.jpg',
  'pipeline':       '/header-pipeline.jpg',
  'policies':       '/header-policies.jpg',
}

const TAB_IMAGE_LABELS = {
  'trail-forward': 'Community scene in Steamboat Springs',
  'affordability':  'Steamboat Springs housing and community',
  'pipeline':       'Housing developments in Steamboat Springs',
  'policies':       'City policy and planning in Steamboat Springs',
}

export default function Header({ activeTab }) {
  const imgSrc   = TAB_IMAGES[activeTab]  || TAB_IMAGES['trail-forward']
  const imgAlt   = TAB_IMAGE_LABELS[activeTab] || 'Steamboat Springs, Colorado'

  return (
    <header
      style={{ backgroundColor: 'var(--white)', borderBottom: '2px solid var(--border)' }}
      role="banner"
    >
      <div
        style={{
          padding: '16px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 32,
          minHeight: 100,
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <p style={{
            margin: '0 0 6px',
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.04em',
            fontFamily: "'Source Sans 3', sans-serif",
          }}>
            City of Steamboat Springs
          </p>
          <h1 style={{
            margin: 0,
            fontSize: 44,
            fontWeight: 700,
            color: 'var(--navy)',
            lineHeight: 1.15,
            fontFamily: "'Source Serif 4', serif",
          }}>
            Affordable Housing Dashboard
          </h1>
        </div>

        <img
          key={imgSrc}
          src={imgSrc}
          alt={imgAlt}
          style={{
            height: 110,
            width: 'auto',
            maxWidth: '45%',
            borderRadius: 6,
            border: '1px solid var(--border)',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
    </header>
  )
}
