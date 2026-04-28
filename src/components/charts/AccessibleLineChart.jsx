import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import ChartFigure from './ChartFigure'

const LINE_STYLES = [
  { stroke: '#1b3a5c', strokeDasharray: '0' },
  { stroke: '#e07b2a', strokeDasharray: '8 4' },
  { stroke: '#2e8b57', strokeDasharray: '4 4' },
  { stroke: '#8b4513', strokeDasharray: '12 4 4 4' },
]

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

export default function AccessibleLineChart({
  data, keys, ariaLabel, caption, yTickFormatter, referenceLines = [],
  yDomain, tooltipFormatter, chartHeight = 300,
}) {
  return (
    <ChartFigure
      ariaLabel={ariaLabel}
      caption={caption}
      srTable={<SRTable data={data} keys={keys} label={ariaLabel} />}
    >
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart data={data} margin={{ top: 8, right: 32, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif", fill: '#1a1a1a' }} />
          <YAxis
            tickFormatter={yTickFormatter}
            tick={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif", fill: '#1a1a1a' }}
            domain={yDomain}
          />
          <Tooltip formatter={tooltipFormatter} />
          <Legend
            wrapperStyle={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif", paddingTop: 8, color: '#1a1a1a' }}
          />
          {referenceLines.map((rl) => (
            <ReferenceLine
              key={rl.label}
              y={rl.value}
              stroke={rl.stroke || '#e07b2a'}
              strokeDasharray={rl.dashed ? '6 3' : undefined}
              label={{ value: rl.label, position: 'insideTopRight', fontSize: 12, fill: rl.stroke || '#e07b2a' }}
            />
          ))}
          {keys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={LINE_STYLES[i % LINE_STYLES.length].stroke}
              strokeDasharray={LINE_STYLES[i % LINE_STYLES.length].strokeDasharray}
              strokeWidth={2}
              dot={{ r: 5, fill: LINE_STYLES[i % LINE_STYLES.length].stroke }}
              activeDot={{ r: 7 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartFigure>
  )
}
