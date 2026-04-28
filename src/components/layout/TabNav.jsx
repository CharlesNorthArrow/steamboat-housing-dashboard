import { useRef } from 'react'
import { useGoogleSheet } from '../../hooks/useGoogleSheet'
import { SHEET_URLS } from '../../utils/sheetUrls'

const TABS = [
  { id: 'trail-forward', label: 'Trail Forward',  description: 'Community demographics and trends' },
  { id: 'affordability', label: 'Affordability',  description: 'Rising costs and the affordability gap' },
  { id: 'pipeline',      label: 'Pipeline',        description: 'Developments under way and planned' },
  { id: 'policies',      label: 'Policies',        description: 'Programs and policy options' },
]

function SidebarFooter() {
  const { data } = useGoogleSheet(SHEET_URLS.lastUpdated)
  const lu = data?.[0]

  return (
    <div className="sidebar-footer-section">
      {lu && (
        <p>Data and narrative last updated {lu.Month} {lu.Year}</p>
      )}
      <p>
        For questions or assistance accessing this dashboard, email the{' '}
        <a href="mailto:kmccarthy@steamboatsprings.net">Housing Innovation Specialist</a>
        {' '}or call{' '}
        <a href="tel:9708717063">970-871-7063</a>.
      </p>
    </div>
  )
}

export default function TabNav({ activeTab, onTabChange }) {
  const tabRefs = useRef([])

  function handleKeyDown(e, index) {
    let next = index
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (index + 1) % TABS.length
    else if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  next = (index - 1 + TABS.length) % TABS.length
    else return
    e.preventDefault()
    onTabChange(TABS[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <nav
      className="sidebar-nav"
      aria-label="Dashboard sections"
      role="tablist"
      aria-orientation="vertical"
    >
      <div className="sidebar-brand">
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          City of Steamboat Springs
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 600, color: 'white', fontFamily: "'Source Sans 3', sans-serif" }}>
          Affordable Housing Dashboard
        </p>
      </div>

      <div className="sidebar-tabs">
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            ref={(el) => (tabRefs.current[i] = el)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="sidebar-tab-btn"
          >
            <span className="sidebar-tab-label">{tab.label}</span>
            <span className="sidebar-tab-description">{tab.description}</span>
          </button>
        ))}
      </div>

      {/* Disclaimer — yellow pill so it pops against the dark sidebar */}
      <div className="sidebar-disclaimer" role="note">
        <svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, marginTop: 1 }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8"  x2="12"    y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>
          All public data is from the latest available year and will be updated regularly.
        </span>
      </div>

      {/* Last updated + contact — always visible at bottom */}
      <SidebarFooter />
    </nav>
  )
}

export { TABS }
