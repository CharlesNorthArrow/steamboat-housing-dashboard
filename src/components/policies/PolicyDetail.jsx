import { useEffect, useRef } from 'react'
import StatusBadge from './StatusBadge'

const fieldLabel = {
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--text-muted)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  marginBottom: 4,
  display: 'block',
  fontFamily: "'Source Sans 3', sans-serif",
}

const fieldValue = {
  fontSize: 14,
  color: 'var(--text-dark)',
  lineHeight: 1.6,
  fontFamily: "'Source Sans 3', sans-serif",
  margin: 0,
}

function Field({ label, value }) {
  if (!value || value === '—') return null
  return (
    <div style={{ marginBottom: 20 }}>
      <span style={fieldLabel}>{label}</span>
      <p style={fieldValue}>{value}</p>
    </div>
  )
}

export default function PolicyDetail({ policy }) {
  const headingRef = useRef(null)

  useEffect(() => {
    if (policy && headingRef.current) {
      headingRef.current.focus({ preventScroll: true })
    }
  }, [policy?.id])

  if (!policy) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontFamily: "'Source Sans 3', sans-serif" }}>
        <p style={{ fontSize: 15 }}>Select a policy from the list to view details.</p>
      </div>
    )
  }

  return (
    <div
      role="region"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Policy detail"
      style={{ padding: '28px 28px 40px' }}
    >
      <h3
        ref={headingRef}
        tabIndex={-1}
        style={{
          margin: '0 0 10px',
          fontSize: 22,
          color: 'var(--navy)',
          fontFamily: "'Source Sans 3', sans-serif",
          lineHeight: 1.3,
          outline: 'none',
        }}
      >
        {policy.name}
      </h3>

      <div style={{ marginBottom: 20 }}>
        <StatusBadge status={policy.status} />
      </div>

      <Field label="Description" value={policy.description} />
      <Field label="Detailed Status" value={policy.detailedStatus} />
      <Field label="Implementation Challenges" value={policy.challenges} />
      <Field label="Lead Organization" value={policy.lead} />
      <Field label="Timeline" value={policy.timeline} />

      {policy.moreInfo && (
        <div style={{ marginTop: 8 }}>
          <span style={fieldLabel}>More Information</span>
          <p style={fieldValue}>
            {policy.moreInfoUrl ? (
              <a
                href={policy.moreInfoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--navy)' }}
              >
                {policy.moreInfo}
              </a>
            ) : (
              policy.moreInfo
            )}
          </p>
        </div>
      )}
    </div>
  )
}
