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
  const imgRef = useRef(null)
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

  // Measure image width so the button group can be positioned flush to its left edge
  useEffect(() => {
    const el = headerRef.current
    const img = imgRef.current
    if (!el || !img) return
    const measure = () => el.style.setProperty('--header-img-w', img.offsetWidth + 'px')
    if (img.complete) measure()
    else img.addEventListener('load', measure)
    window.addEventListener('resize', measure)
    return () => {
      img.removeEventListener('load', measure)
      window.removeEventListener('resize', measure)
    }
  }, [imgSrc])

  return (
    <header ref={headerRef} className="site-header" role="banner">
      <div className="header-inner">
        <div className="header-text">
          <p className="header-sub">City of Steamboat Springs</p>
          <h1 className="header-title">Affordable Housing Dashboard</h1>
        </div>
        <div className="header-img-group">
          <img ref={imgRef} key={imgSrc} src={imgSrc} alt={imgAlt} className="header-image" />
        </div>
        <div className="header-page-actions">
          <PageActions onExportAll={onExportAll} />
        </div>
      </div>
    </header>
  )
}
