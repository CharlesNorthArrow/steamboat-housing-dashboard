import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import { PatternDefs, PATTERN_IDS, PATTERN_COLORS } from './PatternDefs'
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
  data, keys, ariaLabel, caption, percent = true, patternIndices,
}) {
  const getIdx = (i) => patternIndices ? patternIndices[i] : i

  const tickFormatter = percent ? (v) => `${Math.round(v * 100)}%` : undefined
  const tooltipFormatter = percent
    ? (v, name) => [`${(v * 100).toFixed(1)}%`, name]
    : undefined

  const legendPayload = keys.map((key, i) => ({
    value: key,
    type: 'square',
    color: PATTERN_COLORS[getIdx(i) % PATTERN_COLORS.length],
    id: key,
  }))

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
          <Tooltip content={(p) => <ChartTooltip {...p} formatter={tooltipFormatter} />} />
          <Legend
            wrapperStyle={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif" }}
            content={() => (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', justifyContent: 'center', paddingTop: 8, color: '#1a1a1a' }}>
                {legendPayload.map((entry) => (
                  <span key={entry.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 14, height: 14, background: entry.color, borderRadius: 2, flexShrink: 0 }} />
                    {entry.value}
                  </span>
                ))}
              </div>
            )}
          />
          {keys.map((key, i) => (
            <Bar key={key} dataKey={key} stackId="a" fill={PATTERN_IDS[getIdx(i) % PATTERN_IDS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartFigure>
  )
}
