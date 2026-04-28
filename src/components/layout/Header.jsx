const TAB_IMAGES = {
  'trail-forward': '/header-trail-forward.jpg',
  'affordability': '/header-affordability.jpg',
  'pipeline':      '/header-pipeline.jpg',
  'policies':      '/header-policies.jpg',
}

const TAB_IMAGE_LABELS = {
  'trail-forward': 'Community scene in Steamboat Springs',
  'affordability': 'Steamboat Springs housing and community',
  'pipeline':      'Housing developments in Steamboat Springs',
  'policies':      'City policy and planning in Steamboat Springs',
}

export default function Header({ activeTab }) {
  const imgSrc = TAB_IMAGES[activeTab] || TAB_IMAGES['trail-forward']
  const imgAlt = TAB_IMAGE_LABELS[activeTab] || 'Steamboat Springs, Colorado'

  return (
    <header
      style={{ backgroundColor: 'var(--white)', borderBottom: '2px solid var(--border)' }}
      role="banner"
    >
      <div
        style={{
          padding: '0 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 120,
          gap: 32,
        }}
      >
        <div>
          <p
            style={{
              margin: '0 0 6px',
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.04em',
              fontFamily: "'Source Sans 3', sans-serif",
            }}
          >
            City of Steamboat Springs
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: 44,
              fontWeight: 700,
              color: 'var(--navy)',
              lineHeight: 1.15,
              fontFamily: "'Source Serif 4', serif",
            }}
          >
            Affordable Housing Dashboard
          </h1>
        </div>

        <div
          role="img"
          aria-label={imgAlt}
          style={{
            width: 320,
            height: 90,
            borderRadius: 6,
            overflow: 'hidden',
            flexShrink: 0,
            backgroundImage: `url(${imgSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid var(--border)',
            transition: 'background-image 0.3s ease',
          }}
        />
      </div>
    </header>
  )
}
