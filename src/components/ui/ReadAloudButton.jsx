import { useTextToSpeech } from '../../hooks/useTextToSpeech'

// SVG icons kept inline to avoid an icon-library dependency
function IconSpeaker() {
  return (
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}

function IconPause() {
  return (
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}

function IconPlay() {
  return (
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24"
      fill="currentColor" stroke="none">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function IconStop() {
  return (
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  )
}

function makeStyles(dark) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: "'Source Sans 3', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    ...(dark ? {
      border: '1px solid rgba(255,255,255,0.45)',
      background: 'rgba(255,255,255,0.1)',
      color: 'white',
    } : {
      border: '1px solid rgba(34,82,134,0.4)',
      background: 'rgba(34,82,134,0.08)',
      color: 'var(--navy)',
    }),
  }
  return { btn: base, icon: { ...base, padding: '6px 10px' } }
}

export default function ReadAloudButton({ segments, dark = true }) {
  const { status, speak, pause, resume, stop, isSupported } = useTextToSpeech()
  const { btn, icon } = makeStyles(dark)

  if (!isSupported) return null

  if (status === 'idle') {
    return (
      <button style={btn} onClick={() => speak(segments)} aria-label="Read this section aloud">
        <IconSpeaker />
        Read aloud
      </button>
    )
  }

  return (
    <div style={{ display: 'inline-flex', gap: 6 }} role="group" aria-label="Read aloud controls">
      {status === 'playing' ? (
        <button style={icon} onClick={pause} aria-label="Pause reading">
          <IconPause />
          Pause
        </button>
      ) : (
        <button style={icon} onClick={resume} aria-label="Resume reading">
          <IconPlay />
          Resume
        </button>
      )}
      <button style={icon} onClick={stop} aria-label="Stop reading">
        <IconStop />
        Stop
      </button>
    </div>
  )
}
