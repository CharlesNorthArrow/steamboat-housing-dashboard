// SVG pattern fills so bar charts don't rely on color alone (VPAT requirement)
export const PATTERNS = [
  { id: 'pat-solid',      fill: '#1b3a5c' },
  { id: 'pat-hatch',      fill: '#e07b2a' },
  { id: 'pat-cross',      fill: '#f5a623' },
  { id: 'pat-dot',        fill: '#4a7c9e' },
  { id: 'pat-diag-rev',   fill: '#7ab8d4' },
  { id: 'pat-dash',       fill: '#2e8b57' },
  { id: 'pat-wave',       fill: '#8b4513' },
  { id: 'pat-grid',       fill: '#6a0572' },
  { id: 'pat-zigzag',     fill: '#b8860b' },
]

export function PatternDefs() {
  return (
    <defs>
      {/* Solid */}
      <pattern id="pat-solid" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#1b3a5c" />
      </pattern>

      {/* Forward diagonal hatch */}
      <pattern id="pat-hatch" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#e07b2a" />
        <path d="M0 8L8 0" stroke="white" strokeWidth="1.5" opacity="0.5" />
      </pattern>

      {/* Cross hatch */}
      <pattern id="pat-cross" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#f5a623" />
        <path d="M0 4H8M4 0V8" stroke="white" strokeWidth="1.5" opacity="0.5" />
      </pattern>

      {/* Dots */}
      <pattern id="pat-dot" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#4a7c9e" />
        <circle cx="4" cy="4" r="1.5" fill="white" opacity="0.6" />
      </pattern>

      {/* Reverse diagonal */}
      <pattern id="pat-diag-rev" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#7ab8d4" />
        <path d="M8 8L0 0" stroke="white" strokeWidth="1.5" opacity="0.5" />
      </pattern>

      {/* Horizontal dash */}
      <pattern id="pat-dash" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#2e8b57" />
        <path d="M1 4H7" stroke="white" strokeWidth="1.5" opacity="0.6" />
      </pattern>

      {/* Vertical lines */}
      <pattern id="pat-wave" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#8b4513" />
        <path d="M4 0V8" stroke="white" strokeWidth="1.5" opacity="0.5" />
      </pattern>

      {/* Grid */}
      <pattern id="pat-grid" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#6a0572" />
        <path d="M0 0H8V8H0Z" stroke="white" strokeWidth="0.5" fill="none" opacity="0.5" />
      </pattern>

      {/* Zigzag */}
      <pattern id="pat-zigzag" width="12" height="8" patternUnits="userSpaceOnUse">
        <rect width="12" height="8" fill="#b8860b" />
        <path d="M0 4L3 1L6 4L9 1L12 4" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
      </pattern>
    </defs>
  )
}

export const PATTERN_IDS = PATTERNS.map((p) => `url(#${p.id})`)
export const PATTERN_COLORS = PATTERNS.map((p) => p.fill)
