import { PATTERNS, PATTERN_COLORS } from './PatternDefs'

// Converts url(#pat-solid) → the solid fill color for that pattern.
// Leaves regular hex/rgb colors untouched.
function resolveColor(raw, index = 0) {
  if (!raw || raw === 'none') return PATTERNS[index % PATTERNS.length].fill
  if (raw.startsWith('url(#')) {
    const id = raw.slice(5, -1)
    return PATTERNS.find((p) => p.id === id)?.fill ?? PATTERNS[index % PATTERNS.length].fill
  }
  return raw
}

// Drop-in replacement for the Recharts default tooltip.
//
// formatter: (value, name) => [displayValue, displayName]
//
// colorEachBarData: pass the chart's data array when colorEachBar=true.
// Recharts sets entry.fill to the Bar's fill prop for ALL bars (it doesn't
// reflect the per-bar Cell fill), so we look up the correct pattern color
// by finding the bar's position in the data array by name.
export default function ChartTooltip({ active, payload, label, formatter, colorEachBarData }) {
  if (!active || !payload?.length) return null

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: 6,
      padding: '10px 14px',
      fontFamily: "'Source Sans 3', sans-serif",
      fontSize: 14,
      boxShadow: '0 3px 10px rgba(0,0,0,0.13)',
      maxWidth: 320,
      lineHeight: 1.5,
    }}>
      {label != null && label !== '' && (
        <div style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 6 }}>
          {label}
        </div>
      )}
      {payload.map((entry, i) => {
        let color
        if (colorEachBarData) {
          // colorEachBar mode: look up bar index by name to get the correct Cell color
          const barIndex = colorEachBarData.findIndex(d => d.name === entry.payload?.name)
          color = PATTERN_COLORS[(barIndex >= 0 ? barIndex : i) % PATTERN_COLORS.length]
        } else {
          // Standard bars: entry.color = pattern URL → resolveColor maps to hex
          // Lines: entry.color = stroke hex (reliable); entry.fill is 'none' for lines
          //        so we must not use entry.fill first or it short-circuits the chain
          color = resolveColor(entry.color || entry.stroke, i)
        }

        const result = formatter ? formatter(entry.value, entry.name, entry, i, payload) : null
        const displayValue = result ? result[0] : entry.value
        const displayName  = result ? result[1] : entry.name
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: i > 0 ? 4 : 0 }}>
            <span style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              backgroundColor: color,
              borderRadius: 2,
              flexShrink: 0,
            }} />
            <span style={{ color: '#555', flex: 1 }}>{displayName}</span>
            <span style={{ fontWeight: 700, color }}>{displayValue}</span>
          </div>
        )
      })}
    </div>
  )
}
