import { useRef, useEffect } from 'react'

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
  const headerRef = useRef(null)
  const imgSrc = TAB_IMAGES[activeTab]  || TAB_IMAGES['trail-forward']
  const imgAlt = TAB_IMAGE_LABELS[activeTab] || 'Steamboat Springs, Colorado'

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const update = () => {
      const progress = Math.min(window.scrollY / 100, 1)
      el.style.setProperty('--scroll-p', progress)
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <header
      ref={headerRef}
      style={{
        backgroundColor: 'var(--white)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
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
            fontSize: 'calc(24px - var(--scroll-p, 0) * 8px)',
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.04em',
            fontFamily: "'Source Sans 3', sans-serif",
          }}>
            City of Steamboat Springs
          </p>
          <h1 style={{
            margin: 0,
            fontSize: 'calc(44px - var(--scroll-p, 0) * 14px)',
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
          height: 211,
          width: 'auto',
          borderRadius: 10,
          border: '3px solid white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          zIndex: 10,
          display: 'block',
          transform: 'scale(calc(1 - var(--scroll-p, 0) * 0.3))',
          transformOrigin: 'top right',
        }}
      />
    </header>
  )
}
