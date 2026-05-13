import { useEffect, useRef, useMemo } from 'react'
import StatusBadge from './StatusBadge'
import ReadAloudButton from '../ui/ReadAloudButton'

function TimelineNode({ heading, content, readId }) {
  if (!content || content.trim() === '' || content === '—') return null
  return (
    <div style={{ position: 'relative', paddingLeft: 36, marginBottom: 28 }}>
      <div style={{
        position: 'absolute',
        left: 2,
        top: 3,
        width: 16,
        height: 16,
        borderRadius: '50%',
        backgroundColor: 'var(--orange)',
        zIndex: 1,
      }} aria-hidden="true" />
      <h4 style={{
        margin: '0 0 6px',
        fontSize: 18,
        fontWeight: 700,
        color: 'var(--orange)',
        fontFamily: "'Source Sans 3', sans-serif",
      }}>
        {heading}
      </h4>
      <p
        data-read-id={readId}
        style={{
          margin: 0,
          fontSize: 17,
          color: 'var(--text-dark)',
          lineHeight: 1.65,
          fontFamily: "'Source Sans 3', sans-serif",
        }}
      >
        {content}
      </p>
    </div>
  )
}

export default function PolicyDetail({ policy }) {
  const headingRef = useRef(null)

  useEffect(() => {
    if (policy && headingRef.current) headingRef.current.focus({ preventScroll: true })
  }, [policy?.id])

  const segments = useMemo(() => {
    if (!policy) return []
    const segs = [{ text: policy.name, readId: 'pol-name' }]
    if (policy.status) segs.push({ text: `Status: ${policy.status}.`, readId: 'pol-status' })
    if (policy.description?.trim()) segs.push({ text: `Description. ${policy.description}`, readId: 'pol-description' })
    if (policy.detailedStatus?.trim()) segs.push({ text: `Detailed Status. ${policy.detailedStatus}`, readId: 'pol-detailed' })
    if (policy.challenges?.trim()) segs.push({ text: `Implementation Challenges. ${policy.challenges}`, readId: 'pol-challenges' })
    return segs
  }, [policy])

  if (!policy) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontFamily: "'Source Sans 3', sans-serif" }}>
        <p style={{ fontSize: 17 }}>Select a policy from the list to view details.</p>
      </div>
    )
  }

  const hasTimeline = policy.description || policy.detailedStatus || policy.challenges

  return (
    <div
      role="region"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Policy detail"
      style={{ padding: '28px 32px 48px' }}
    >
      {/* Header: selected policy + status + read aloud */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: 'var(--orange)', fontFamily: "'Source Sans 3', sans-serif", marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Selected Policy
          </span>
          <h3
            ref={headingRef}
            tabIndex={-1}
            data-read-id="pol-name"
            style={{ margin: 0, fontSize: 23, fontWeight: 700, color: 'var(--navy)', fontFamily: "'Source Sans 3', sans-serif", lineHeight: 1.3, outline: 'none' }}
          >
            {policy.name}
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
          {policy.status && (
            <>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', fontFamily: "'Source Sans 3', sans-serif" }}>
                Status
              </span>
              <span data-read-id="pol-status">
                <StatusBadge status={policy.status} />
              </span>
            </>
          )}
          {/* key resets speech when policy changes */}
          <div key={policy.id}>
            <ReadAloudButton segments={segments} dark={false} />
          </div>
        </div>
      </div>

      {/* Vertical timeline */}
      {hasTimeline && (
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: 9,
            top: 4,
            bottom: 4,
            width: 2,
            backgroundColor: 'var(--orange)',
            opacity: 0.35,
          }} aria-hidden="true" />
          <TimelineNode heading="Description"               content={policy.description}   readId="pol-description" />
          <TimelineNode heading="Detailed Status"           content={policy.detailedStatus} readId="pol-detailed" />
          <TimelineNode heading="Implementation Challenges" content={policy.challenges}     readId="pol-challenges" />
        </div>
      )}
    </div>
  )
}
