import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell, LabelList,
} from 'recharts'
import { PatternDefs, PATTERN_IDS, PATTERN_COLORS } from './PatternDefs'
import ChartFigure from './ChartFigure'

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

export default function AccessibleBarChart({
  data, keys, ariaLabel, caption, yTickFormatter, referenceLines = [],
  yDomain, tooltipFormatter, layout = 'vertical', xTickFormatter,
}) {
  const isHorizontal = layout === 'horizontal'

  return (
    <ChartFigure
      ariaLabel={ariaLabel}
      caption={caption}
      srTable={<SRTable data={data} keys={keys} label={ariaLabel} />}
    >
      <ResponsiveContainer width="100%" height={isHorizontal ? Math.max(240, data.length * 48 + 60) : 320}>
        <BarChart
          data={data}
          layout={isHorizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 8, right: 48, left: isHorizontal ? 180 : 8, bottom: 8 }}
        >
          <svg><PatternDefs /></svg>
          <CartesianGrid strokeDasharray="3 3" horizontal={!isHorizontal} vertical={isHorizontal} />
          {isHorizontal ? (
            <>
              <XAxis type="number" tickFormatter={xTickFormatter} tick={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif" }} domain={yDomain} />
              <YAxis type="category" dataKey="name" width={175} tick={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif" }} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" tick={{ fontSize: 13, fontFamily: "'Source Sans 3', sans-serif" }} />
              <YAxis tickFormatter={yTickFormatter} tick={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif" }} domain={yDomain} />
            </>
          )}
          <Tooltip formatter={tooltipFormatter} />
          <Legend wrapperStyle={{ fontSize: 14, fontFamily: "'Source Sans 3', sans-serif", paddingTop: 8 }} />
          {referenceLines.map((rl) => (
            <ReferenceLine
              key={rl.label}
              {...(isHorizontal ? { x: rl.value } : { y: rl.value })}
              stroke={rl.stroke || '#1b3a5c'}
              strokeDasharray={rl.dashed ? '6 3' : undefined}
              label={{ value: rl.label, position: isHorizontal ? 'insideTopLeft' : 'insideTopRight', fontSize: 12, fill: rl.stroke || '#1b3a5c' }}
            />
          ))}
          {keys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={PATTERN_IDS[i % PATTERN_IDS.length]}>
              <LabelList dataKey={key} position={isHorizontal ? 'right' : 'top'} formatter={yTickFormatter} style={{ fontSize: 12, fontFamily: "'Source Sans 3', sans-serif" }} />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartFigure>
  )
}
