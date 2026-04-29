import { TABS } from './TabNav'

export default function Footer({ activeTab, onTabChange }) {
  return (
    <footer
      style={{
        backgroundColor: 'var(--dark-bg)',
        color: 'white',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          fontSize: 13,
        }}
      >
        <a
          href="https://docs.google.com/spreadsheets/d/1nn4IIdTEniLSEnd30zwSVMjoVd88Fd5gKjltxlSb0tk/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}
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
                    fontSize: 13,
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

        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
          Built by{' '}
          <a
            href="https://www.north-arrow.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'underline' }}
          >
            North Arrow
          </a>
          {' '}for the City of Steamboat Springs
        </span>
      </div>
    </footer>
  )
}
