export default function DataBanner() {
  return (
    <div
      role="note"
      aria-label="Data currency notice"
      style={{
        backgroundColor: '#FFF9C4',
        borderBottom: '1px solid #E6D84A',
        padding: '10px 24px',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 14,
          color: 'var(--text-dark)',
        }}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#b8860b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>
          All the public data used in this dashboard is from the latest available year and will be
          updated regularly.
        </span>
      </div>
    </div>
  )
}
