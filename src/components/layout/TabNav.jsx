import { useRef } from 'react'
import { useGoogleSheet } from '../../hooks/useGoogleSheet'
import { SHEET_URLS } from '../../utils/sheetUrls'
import PageActions from '../ui/PageActions'

const TABS = [
  { id: 'trail-forward', label: 'Trail Forward',  description: 'Community demographics and trends' },
  { id: 'affordability', label: 'Affordability',  description: 'Rising costs and the affordability gap' },
  { id: 'pipeline',      label: 'Pipeline',        description: 'Developments under way and planned', wip: true },
  { id: 'policies',      label: 'Policies',        description: 'Programs and policy options',        wip: true },
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

export default function TabNav({ activeTab, onTabChange, onExportAll }) {
  const tabRefs = useRef([])

  function handleKeyDown(e, index) {
    let next = index
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      do { next = (next + 1) % TABS.length } while (TABS[next].wip && next !== index)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      do { next = (next - 1 + TABS.length) % TABS.length } while (TABS[next].wip && next !== index)
    } else return
    e.preventDefault()
    if (!TABS[next].wip) {
      onTabChange(TABS[next].id)
      tabRefs.current[next]?.focus()
    }
  }

  return (
    <nav
      className="sidebar-nav"
      aria-label="Dashboard sections"
      role="tablist"
      aria-orientation="vertical"
    >
      <div className="sidebar-tabs">
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            ref={(el) => (tabRefs.current[i] = el)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            aria-disabled={tab.wip ? 'true' : undefined}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={tab.wip ? undefined : () => onTabChange(tab.id)}
            onKeyDown={tab.wip ? undefined : (e) => handleKeyDown(e, i)}
            className={`sidebar-tab-btn${tab.wip ? ' sidebar-tab-btn--wip' : ''}`}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="sidebar-tab-label">{tab.label}</span>
              {tab.wip && (
                <span className="wip-pill" aria-label="Work in progress">WIP</span>
              )}
            </span>
            <span className="sidebar-tab-description">{tab.description}</span>
          </button>
        ))}
      </div>

      {/* Disclaimer + last updated grouped at the bottom with a clear divider */}
      <div className="sidebar-bottom">
        <PageActions onExportAll={onExportAll} />
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
        <SidebarFooter />
      </div>
    </nav>
  )
}

export { TABS }
