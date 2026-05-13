import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
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
          <th scope="col">Period</th>
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

export default function AccessibleStackedBar({
  data, keys, ariaLabel, caption, percent = true, patternIndices, legendBelow = false,
}) {
  const getIdx = (i) => patternIndices ? patternIndices[i] : i

  const tickFormatter = percent ? (v) => `${Math.round(v * 100)}%` : undefined
  const tooltipFormatter = percent
    ? (v, name) => [`${(v * 100).toFixed(1)}%`, name]
    : undefined

  const legendPayload = keys.map((key, i) => ({
    value: key,
    id: key,
    patIdx: getIdx(i),
  }))

  const renderLegendItems = (items) => items.map((entry) => (
    <span key={entry.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width="18" height="18" aria-hidden="true" style={{ flexShrink: 0 }}>
        <rect width="18" height="18" fill={PATTERN_IDS[entry.patIdx % PATTERN_IDS.length]} />
      </svg>
      {entry.value}
    </span>
  ))

  return (
    <ChartFigure
      ariaLabel={ariaLabel}
      caption={caption}
      srTable={<SRTable data={data} keys={keys} label={ariaLabel} />}
    >
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} stackOffset={percent ? 'expand' : 'none'} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <svg>
            <PatternDefs />
          </svg>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif", fill: '#1a1a1a' }} />
          <YAxis
            tickFormatter={tickFormatter}
            tick={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif", fill: '#1a1a1a' }}
            domain={percent ? [0, 1] : undefined}
          />
          <Tooltip content={(p) => <ChartTooltip {...p} formatter={tooltipFormatter} reversePayload />} />
          {!legendBelow && (
            <Legend
              wrapperStyle={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif" }}
              content={() => (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 20px', justifyContent: 'center', paddingTop: 10, color: '#1a1a1a', lineHeight: 1.4 }}>
                  {renderLegendItems(legendPayload)}
                </div>
              )}
            />
          )}
          {keys.map((key, i) => (
            <Bar key={key} dataKey={key} stackId="a" fill={PATTERN_IDS[getIdx(i) % PATTERN_IDS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      {legendBelow && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 20px', justifyContent: 'center', paddingTop: 13, fontSize: 14, fontFamily: "'Source Sans 3', sans-serif", color: '#1a1a1a', lineHeight: 1.4 }}>
          {renderLegendItems(legendPayload)}
        </div>
      )}
    </ChartFigure>
  )
}
