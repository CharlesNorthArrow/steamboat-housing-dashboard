import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell, LabelList,
} from 'recharts'
import { PatternDefs, PATTERN_IDS } from './PatternDefs'
import ChartFigure from './ChartFigure'
import ChartTooltip from './ChartTooltip'

function SRTable({ data, keys, label }) {
  return (
    <table>
      <caption>{label}</caption>
      <thead>
        <tr>
          <th scope="col">Category</th>
          {keys.map((k) => <th scope="col" key={k}>{k}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.name}>
            <th scope="row">{row.name}</th>
            {keys.map((k) => <td key={k}>{row[k] != null ? row[k] : '—'}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// Render the reference-line amount as a small label hugging the y-axis,
// guaranteed to sit ABOVE the line (Recharts' string positions can land below
// in some configurations).
function AboveLineRefLabel({ viewBox, text, color }) {
  if (!viewBox) return null
  return (
    <text
      x={viewBox.x + 4}
      y={viewBox.y - 6}
      textAnchor="start"
      fontSize={12}
      fontFamily="'Source Sans 3', sans-serif"
      fill={color}
      fontWeight={600}
    >
      {text}
    </text>
  )
}

// Legend row underneath the chart describing each reference line — colored
// line swatch (dashed or solid, matching the actual ReferenceLine) + description.
function ReferenceLineLegend({ items }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '6px 24px',
      padding: '12px 10px 0',
      justifyContent: 'center',
      fontSize: 13, fontFamily: "'Source Sans 3', sans-serif",
      color: '#1a1a1a', lineHeight: 1.4,
    }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <svg width="22" height="10" aria-hidden="true" style={{ flexShrink: 0 }}>
            <line
              x1="0" y1="5" x2="22" y2="5"
              stroke={item.stroke} strokeWidth="2"
              strokeDasharray={item.dashed ? '5 3' : undefined}
            />
          </svg>
          {item.description}
        </span>
      ))}
    </div>
  )
}

// Wrap long category labels onto multiple lines so 2–3 word industry names
// fit under a bar without overlapping their neighbours.
function WrapTick({ x, y, payload, maxCharsPerLine }) {
  const text = String(payload?.value ?? '')
  const words = text.split(/\s+/)
  const lines = []
  let current = ''
  for (const w of words) {
    if (!current) { current = w; continue }
    if ((current + ' ' + w).length <= maxCharsPerLine) current += ' ' + w
    else { lines.push(current); current = w }
  }
  if (current) lines.push(current)
  return (
    <g transform={`translate(${x},${y + 4})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={i * 14}
          dy="0.85em"
          textAnchor="middle"
          fontSize={12}
          fontFamily="'Source Sans 3', sans-serif"
          fill="#1a1a1a"
        >
          {line}
        </text>
      ))}
    </g>
  )
}

// Custom HTML legend rendered below the chart — used when colorEachBar=true so each
// bar gets its own pattern swatch rather than a single series entry.
function PatternLegend({ items }) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '5px 25px',
      padding: '13px 10px 0',
      justifyContent: 'center',
      fontSize: 14,
      fontFamily: "'Source Sans 3', sans-serif",
      lineHeight: 1.4,
      color: '#1a1a1a',
    }}>
      {items.map((item, i) => {
        const fillIdx = item.patIdx != null ? item.patIdx : i
        return (
          <span key={item.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" aria-hidden="true" style={{ flexShrink: 0 }}>
              <rect width="18" height="18" fill={PATTERN_IDS[fillIdx % PATTERN_IDS.length]} />
            </svg>
            {item.value}
          </span>
        )
      })}
    </div>
  )
}

export default function AccessibleBarChart({
  data, keys, ariaLabel, caption, yTickFormatter, referenceLines = [],
  yDomain, tooltipFormatter, layout = 'vertical', xTickFormatter, chartHeight,
  colorEachBar = false, patternIndices, legendBelow = false,
}) {
  const isHorizontal = layout === 'horizontal'
  const getIdx = (i) => patternIndices ? patternIndices[i] : i
  const resolvedHeight = chartHeight ?? (isHorizontal ? Math.max(240, data.length * 48 + 60) : 320)

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 800)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 800px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // When legendBelow=true (multi-series), the legend is rendered below instead of inside Recharts.
  // When colorEachBar=true, each bar is named directly by the wrapped XAxis tick — no legend.
  // When false (default), Recharts auto-generates the legend from the Bar components.
  const belowLegendItems = (!colorEachBar && legendBelow)
    ? keys.map((key, i) => ({ value: key, id: key, patIdx: getIdx(i) }))
    : null

  // Allocate enough room under the chart for 2 lines of wrapped category labels.
  const wrapChars = data.length <= 3 ? 18 : 14
  const bottomMargin = colorEachBar && !isHorizontal ? 42 : 8
  const refLegendItems = referenceLines.filter(r => r.description)

  return (
    <ChartFigure
      ariaLabel={ariaLabel}
      caption={caption}
      srTable={<SRTable data={data} keys={keys} label={ariaLabel} />}
    >
      <ResponsiveContainer width="100%" height={resolvedHeight}>
        <BarChart
          data={data}
          layout={isHorizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 8, right: 48, left: 8, bottom: bottomMargin }}
        >
          <svg><PatternDefs /></svg>
          <CartesianGrid strokeDasharray="3 3" horizontal={!isHorizontal} vertical={isHorizontal} />
          {isHorizontal ? (
            <>
              <XAxis type="number" tickFormatter={xTickFormatter} tick={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif", fill: '#1a1a1a' }} domain={yDomain} />
              <YAxis type="category" dataKey="name" width={isMobile ? 110 : 175} tick={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif", fill: '#1a1a1a' }} />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
                interval={0}
                tick={colorEachBar
                  ? <WrapTick maxCharsPerLine={wrapChars} />
                  : { fontSize: 13, fontFamily: "'Source Sans 3', sans-serif", fill: '#1a1a1a' }}
              />
              <YAxis tickFormatter={yTickFormatter} tick={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif", fill: '#1a1a1a' }} domain={yDomain} />
            </>
          )}
          <Tooltip content={(p) => <ChartTooltip {...p} formatter={tooltipFormatter} colorEachBarData={colorEachBar ? data : undefined} />} />
          {!colorEachBar && !legendBelow && (
            <Legend
              wrapperStyle={{ paddingTop: 10 }}
              content={() => (
                <PatternLegend
                  items={keys.map((key, i) => ({ value: key, id: key, patIdx: getIdx(i) }))}
                />
              )}
            />
          )}
          {referenceLines.map((rl) => (
            <ReferenceLine
              key={rl.label}
              {...(isHorizontal ? { x: rl.value } : { y: rl.value })}
              stroke={rl.stroke || '#1b3a5c'}
              strokeDasharray={rl.dashed ? '6 3' : undefined}
              label={rl.description
                ? <AboveLineRefLabel text={rl.label} color={rl.stroke || '#1b3a5c'} />
                : {
                    value: rl.label,
                    position: rl.labelPosition || 'insideTopLeft',
                    fontSize: 12,
                    fill: rl.stroke || '#1b3a5c',
                    fontWeight: 600,
                  }}
            />
          ))}
          {keys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={PATTERN_IDS[getIdx(i) % PATTERN_IDS.length]}>
              {colorEachBar && data.map((_, j) => (
                <Cell key={j} fill={PATTERN_IDS[getIdx(j) % PATTERN_IDS.length]} />
              ))}
              <LabelList dataKey={key} position={isHorizontal ? 'right' : 'top'} formatter={yTickFormatter} style={{ fontSize: 12, fontFamily: "'Source Sans 3', sans-serif" }} />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>

      {belowLegendItems && (
        <PatternLegend items={belowLegendItems} />
      )}
      {refLegendItems.length > 0 && (
        <ReferenceLineLegend items={refLegendItems} />
      )}
    </ChartFigure>
  )
}
