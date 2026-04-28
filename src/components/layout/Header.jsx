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
  const imgSrc = TAB_IMAGES[activeTab]  || TAB_IMAGES['trail-forward']
  const imgAlt = TAB_IMAGE_LABELS[activeTab] || 'Steamboat Springs, Colorado'

  return (
    <header
      style={{
        backgroundColor: 'var(--white)',
        position: 'relative',
        overflow: 'visible',
      }}
      role="banner"
    >
      <div
        style={{
          padding: '20px 48px 20px 48px',
          paddingRight: 480,
          minHeight: 112,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div>
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
            fontFamily: "'Source Sans 3', sans-serif",
          }}>
            Affordable Housing Dashboard
          </h1>
        </div>
      </div>

      <img
        key={imgSrc}
        src={imgSrc}
        alt={imgAlt}
        style={{
          position: 'absolute',
          right: 48,
          top: 16,
          height: 248,
          width: 'auto',
          borderRadius: 10,
          border: '3px solid white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          zIndex: 10,
          display: 'block',
        }}
      />
    </header>
  )
}
