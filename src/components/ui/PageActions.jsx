import { useState, useRef, useEffect } from 'react'

function IconShare() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

function IconChevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

function ShareButton() {
  const [label, setLabel] = useState('Share')

  function handleClick() {
    const url = window.location.href
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setLabel('Copied!')
        setTimeout(() => setLabel('Share'), 2200)
      })
    } else {
      prompt('Copy this link:', url)
    }
  }

  return (
    <button className="action-btn" onClick={handleClick} aria-label="Copy link to this page">
      <IconShare />
      {label}
    </button>
  )
}

function ExportButton({ onExportAll }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  function handleExportTab() {
    setOpen(false)
    window.print()
  }

  function handleExportAll() {
    setOpen(false)
    onExportAll()
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        className="action-btn"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Export as PDF"
      >
        <IconDownload />
        Export
        <IconChevron />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: 'calc(100% + 4px)',
          background: 'white',
          border: '1px solid #d8d5cc',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          minWidth: 160,
          zIndex: 200,
          overflow: 'hidden',
        }}>
          <button className="action-dropdown-item" onClick={handleExportTab}>
            Current tab
          </button>
          <div style={{ height: 1, background: '#d8d5cc' }} />
          <button className="action-dropdown-item" onClick={handleExportAll}>
            Full report
          </button>
        </div>
      )}
    </div>
  )
}

export default function PageActions({ onExportAll }) {
  return (
    <div className="page-actions">
      <ShareButton />
      <ExportButton onExportAll={onExportAll} />
    </div>
  )
}
