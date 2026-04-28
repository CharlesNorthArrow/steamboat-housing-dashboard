import { useEffect, useRef } from 'react'

const TABS = [
  { id: 'trail-forward', label: 'Trail Forward' },
  { id: 'affordability', label: 'Affordability' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'policies', label: 'Policies' },
]

export default function TabNav({ activeTab, onTabChange }) {
  const tabRefs = useRef([])

  function handleKeyDown(e, index) {
    let next = index
    if (e.key === 'ArrowRight') next = (index + 1) % TABS.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length
    else return

    e.preventDefault()
    onTabChange(TABS[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <nav
      aria-label="Dashboard sections"
      style={{
        backgroundColor: 'var(--navy)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}
        role="tablist"
        aria-label="Dashboard tabs"
      >
        <div style={{ display: 'flex', gap: 4, padding: '6px 0' }}>
          {TABS.map((tab, i) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                ref={(el) => (tabRefs.current[i] = el)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                style={{
                  padding: '8px 20px',
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "'Source Sans 3', sans-serif",
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 4,
                  background: isActive ? 'var(--orange)' : 'transparent',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.8)',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export { TABS }
