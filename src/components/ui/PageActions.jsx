import { useState } from 'react'

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

export default function PageActions() {
  return (
    <div className="page-actions">
      <ShareButton />
    </div>
  )
}
