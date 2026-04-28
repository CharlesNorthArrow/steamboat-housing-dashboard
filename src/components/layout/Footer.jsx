import { useGoogleSheet } from '../../hooks/useGoogleSheet'
import { SHEET_URLS } from '../../utils/sheetUrls'
import { TABS } from './TabNav'

export default function Footer({ activeTab, onTabChange }) {
  const { data } = useGoogleSheet(SHEET_URLS.lastUpdated)
  const lastUpdated = data?.[0]

  return (
    <footer
      style={{
        backgroundColor: 'var(--dark-bg)',
        color: 'white',
        marginTop: 'auto',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 8px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            fontSize: 14,
          }}
        >
          <a
            href="https://docs.google.com/spreadsheets/d/1ey3NC264FNto7_xKQs07A3bVP4x6RDqoy6QTAYpEWp4/edit"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'underline' }}
          >
            Data Dictionary
          </a>

          <nav aria-label="Footer tab navigation">
            <ul style={{ display: 'flex', gap: 16, margin: 0, padding: 0, listStyle: 'none' }}>
              {TABS.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => onTabChange(tab.id)}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.7)',
                      fontSize: 14,
                      fontFamily: "'Source Sans 3', sans-serif",
                      fontWeight: activeTab === tab.id ? 600 : 400,
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            Made by North Arrow for the City of Steamboat Springs
          </span>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.15)',
            marginTop: 16,
            paddingTop: 12,
            paddingBottom: 16,
            fontSize: 14,
            color: 'rgba(255,255,255,0.7)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'space-between',
          }}
        >
          {lastUpdated && (
            <span>
              Data and narrative last updated in {lastUpdated.Month} {lastUpdated.Year}
            </span>
          )}

          <span>
            For questions or assistance accessing the affordable housing dashboard, please email the{' '}
            <a
              href="mailto:kmccarthy@steamboatsprings.net"
              style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'underline' }}
            >
              city's Housing Innovation Specialist
            </a>
            , or call{' '}
            <a
              href="tel:9708717063"
              style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'underline' }}
            >
              970-871-7063
            </a>
            .
          </span>
        </div>
      </div>
    </footer>
  )
}
