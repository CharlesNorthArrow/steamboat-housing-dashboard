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

// Custom HTML legend rendered below the chart — used when colorEachBar=true so each
// bar gets its own pattern swatch rather than a single series entry.
function PatternLegend({ items }) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px 20px',
      padding: '10px 8px 0',
      justifyContent: 'center',
      fontSize: 14,
      fontFamily: "'Source Sans 3', sans-serif",
      lineHeight: 1.4,
    }}>
      {items.map((item, i) => (
        <span key={item.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" aria-hidden="true" style={{ flexShrink: 0 }}>
            <rect width="14" height="14" fill={PATTERN_IDS[i % PATTERN_IDS.length]} />
          </svg>
          {item.value}
        </span>
      ))}
    </div>
  )
}

export default function AccessibleBarChart({
  data, keys, ariaLabel, caption, yTickFormatter, referenceLines = [],
  yDomain, tooltipFormatter, layout = 'vertical', xTickFormatter, chartHeight,
  colorEachBar = false,
}) {
  const isHorizontal = layout === 'horizontal'
  const resolvedHeight = chartHeight ?? (isHorizontal ? Math.max(240, data.length * 48 + 60) : 320)

  // When colorEachBar=true, legend is rendered as a custom HTML block below the chart.
  // When false, Recharts auto-generates the legend from the Bar components.
  const colorBarLegendItems = colorEachBar
    ? data.map((d, i) => ({
        value: d.name,
        id: String(i),
      }))
    : null

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
          margin={{ top: 8, right: 48, left: 8, bottom: 8 }}
        >
          <svg><PatternDefs /></svg>
          <CartesianGrid strokeDasharray="3 3" horizontal={!isHorizontal} vertical={isHorizontal} />
          {isHorizontal ? (
            <>
              <XAxis type="number" tickFormatter={xTickFormatter} tick={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif", fill: '#1a1a1a' }} domain={yDomain} />
              <YAxis type="category" dataKey="name" width={175} tick={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif", fill: '#1a1a1a' }} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" tick={{ fontSize: 13, fontFamily: "'Source Sans 3', sans-serif", fill: '#1a1a1a' }} />
              <YAxis tickFormatter={yTickFormatter} tick={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif", fill: '#1a1a1a' }} domain={yDomain} />
            </>
          )}
          <Tooltip content={(p) => <ChartTooltip {...p} formatter={tooltipFormatter} />} />
          {!colorEachBar && (
            <Legend
              wrapperStyle={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif", paddingTop: 8 }}
            />
          )}
          {referenceLines.map((rl) => (
            <ReferenceLine
              key={rl.label}
              {...(isHorizontal ? { x: rl.value } : { y: rl.value })}
              stroke={rl.stroke || '#1b3a5c'}
              strokeDasharray={rl.dashed ? '6 3' : undefined}
              label={{ value: rl.label, position: 'insideTopLeft', fontSize: 12, fill: rl.stroke || '#1b3a5c' }}
            />
          ))}
          {keys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={PATTERN_IDS[i % PATTERN_IDS.length]}>
              {colorEachBar && data.map((_, j) => (
                <Cell key={j} fill={PATTERN_IDS[j % PATTERN_IDS.length]} />
              ))}
              <LabelList dataKey={key} position={isHorizontal ? 'right' : 'top'} formatter={yTickFormatter} style={{ fontSize: 12, fontFamily: "'Source Sans 3', sans-serif" }} />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>

      {colorEachBar && colorBarLegendItems && (
        <PatternLegend items={colorBarLegendItems} />
      )}
    </ChartFigure>
  )
}
