import { useRef, useEffect } from 'react'
import PageActions from '../ui/PageActions'

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

export default function Header({ activeTab, onExportAll }) {
  const headerRef = useRef(null)
  const imgSrc = TAB_IMAGES[activeTab] || TAB_IMAGES['trail-forward']
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
    <header ref={headerRef} className="site-header" role="banner">
      <div className="header-inner">
        <div className="header-text">
          <p className="header-sub">City of Steamboat Springs</p>
          <h1 className="header-title">Affordable Housing Dashboard</h1>
        </div>
        <div className="header-img-group">
          <div className="header-page-actions">
            <PageActions onExportAll={onExportAll} />
          </div>
          <img key={imgSrc} src={imgSrc} alt={imgAlt} className="header-image" />
        </div>
      </div>
    </header>
  )
}
