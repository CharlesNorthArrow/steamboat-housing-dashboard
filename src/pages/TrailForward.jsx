import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { useGoogleSheet } from '../hooks/useGoogleSheet'
import { SHEET_URLS } from '../utils/sheetUrls'
import { parseDollar } from '../utils/formatters'
import AccessibleStackedBar from '../components/charts/AccessibleStackedBar'
import AccessibleLineChart from '../components/charts/AccessibleLineChart'
import AccessibleBarChart from '../components/charts/AccessibleBarChart'
import ChartFigure from '../components/charts/ChartFigure'
import SectionHeader from '../components/ui/SectionHeader'

const PERIODS = ['2006-2010', '2011-2015', '2016-2020', '2020-2024']

function groupIncome(row) {
  const col = (name) => parseFloat(row[name] || 0)
  const total = parseFloat(row['Estimate!!Total:'] || 1)
  const low = col('Estimate!!Total:!!Less than $10,000') + col('Estimate!!Total:!!$10,000 to $14,999') +
    col('Estimate!!Total:!!$15,000 to $19,999') + col('Estimate!!Total:!!$20,000 to $24,999') +
    col('Estimate!!Total:!!$25,000 to $29,999') + col('Estimate!!Total:!!$30,000 to $34,999') +
    col('Estimate!!Total:!!$35,000 to $39,999') + col('Estimate!!Total:!!$40,000 to $44,999') +
    col('Estimate!!Total:!!$45,000 to $49,999')
  const middle = col('Estimate!!Total:!!$50,000 to $59,999') + col('Estimate!!Total:!!$60,000 to $74,999') +
    col('Estimate!!Total:!!$75,000 to $99,999') + col('Estimate!!Total:!!$100,000 to $124,999')
  const upperMiddle = col('Estimate!!Total:!!$125,000 to $149,999') + col('Estimate!!Total:!!$150,000 to $199,999')
  const high = col('Estimate!!Total:!!$200,000 or more')
  return {
    'Low Income (<$50K)': low / total,
    'Middle ($50K–$124K)': middle / total,
    'Upper Middle ($125K–$199K)': upperMiddle / total,
    'High Income (>$200K)': high / total,
    _highCount: high,
    _total: total,
  }
}

function groupAge(row) {
  const col = (name) => parseFloat(row[name] || 0)
  const total = parseFloat(row['Estimate!!Total!!Total population'] || 1)
  return {
    '0–14': (col('Under 5 years') + col('5 to 9 years') + col('10 to 14 years')) / total,
    '15–24': (col('15 to 19 years') + col('20 to 24 years')) / total,
    '25–44': (col('25 to 29 years') + col('30 to 34 years') + col('35 to 39 years') + col('40 to 44 years')) / total,
    '45–64': (col('45 to 49 years') + col('50 to 54 years') + col('55 to 59 years') + col('60 to 64 years')) / total,
    '65–74': (col('65 to 69 years') + col('70 to 74 years')) / total,
    '75 & over': (col('75 to 79 years') + col('80 to 84 years') + col('85 years and over')) / total,
    _medianAge: parseFloat(row['Estimate!!Total!!Total population!!SUMMARY INDICATORS!!Median age (years)'] || 0),
    _share2544: (col('25 to 29 years') + col('30 to 34 years') + col('35 to 39 years') + col('40 to 44 years')) / total,
  }
}

function LoadState({ loading, error }) {
  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading data...</p>
  if (error) return <p style={{ color: '#c0392b', fontSize: 14 }}>Error loading data: {error}</p>
  return null
}

const pad = { padding: '48px 48px' }
const sectionGap = { marginBottom: 0 }
const chartTitle = { color: 'var(--navy)', marginBottom: 4, fontSize: 18, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600, margin: '0 0 4px' }
const chartSubtitle = { fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }
const accompText = { fontSize: 14, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.65 }

export default function TrailForward() {
  const { data: incomeData, loading: incomeLoading, error: incomeError } = useGoogleSheet(SHEET_URLS.income)
  const { data: ageData, loading: ageLoading, error: ageError } = useGoogleSheet(SHEET_URLS.age)
  const { data: empData, loading: empLoading, error: empError } = useGoogleSheet(SHEET_URLS.employment)

  const incomeChartData = useMemo(() => {
    if (!incomeData) return []
    return incomeData
      .filter((r) => PERIODS.includes(r.Years))
      .sort((a, b) => PERIODS.indexOf(a.Years) - PERIODS.indexOf(b.Years))
      .map((r) => ({ name: r.Years, ...groupIncome(r) }))
  }, [incomeData])

  const highIncomeLineData = useMemo(() => {
    if (!incomeData) return []
    return incomeData
      .filter((r) => PERIODS.includes(r.Years))
      .sort((a, b) => PERIODS.indexOf(a.Years) - PERIODS.indexOf(b.Years))
      .map((r) => ({ name: r.Years, 'High-Income Households': Math.round(groupIncome(r)._highCount) }))
  }, [incomeData])

  // Chart 4 — Net population shift by income level (start vs end period)
  const netShiftData = useMemo(() => {
    if (!incomeData) return []
    const start = incomeData.find((r) => r.Years === '2006-2010')
    const end = incomeData.find((r) => r.Years === '2020-2024')
    if (!start || !end) return []
    const s = groupIncome(start)
    const e = groupIncome(end)
    const keys = [
      ['Low Income (<$50K)', 'Low Income\n(<$50K)'],
      ['Middle ($50K–$124K)', 'Middle\n($50K–$124K)'],
      ['Upper Middle ($125K–$199K)', 'Upper Middle\n($125K–$199K)'],
      ['High Income (>$200K)', 'High Income\n(>$200K)'],
    ]
    return keys.map(([k, label]) => ({
      name: label,
      'Change (pp)': +((e[k] - s[k]) * 100).toFixed(1),
    }))
  }, [incomeData])

  const ageChartData = useMemo(() => {
    if (!ageData) return []
    return ageData
      .filter((r) => PERIODS.includes(r.Years))
      .sort((a, b) => PERIODS.indexOf(a.Years) - PERIODS.indexOf(b.Years))
      .map((r) => ({ name: r.Years, ...groupAge(r) }))
  }, [ageData])

  const medianAgeData = useMemo(() => {
    if (!ageData) return []
    return ageData
      .filter((r) => PERIODS.includes(r.Years))
      .sort((a, b) => PERIODS.indexOf(a.Years) - PERIODS.indexOf(b.Years))
      .map((r) => ({ name: r.Years, 'Median Age': groupAge(r)._medianAge }))
  }, [ageData])

  const share2544Data = useMemo(() => {
    if (!ageData) return []
    return ageData
      .filter((r) => PERIODS.includes(r.Years))
      .sort((a, b) => PERIODS.indexOf(a.Years) - PERIODS.indexOf(b.Years))
      .map((r) => ({ name: r.Years, 'Share of 25–44 Year Olds': +(groupAge(r)._share2544 * 100).toFixed(1) }))
  }, [ageData])

  const empChartData = useMemo(() => {
    if (!empData) return []
    return empData.map((r) => ({
      name: r.Industry,
      'Max Affordable Rent': parseDollar(r['Max Rent Without Being Cost Burdened']),
    }))
  }, [empData])

  const incomeKeys = ['Low Income (<$50K)', 'Middle ($50K–$124K)', 'Upper Middle ($125K–$199K)', 'High Income (>$200K)']
  const ageKeys = ['0–14', '15–24', '25–44', '45–64', '65–74', '75 & over']

  return (
    <div id="panel-trail-forward" role="tabpanel" aria-labelledby="tab-trail-forward" tabIndex={-1}>

      {/* ── Urgency to Act — dark intro ── */}
      <div style={{ backgroundColor: 'var(--dark-bg)', paddingBottom: 48 }}>
        <div style={pad}>
          <h2 style={{ margin: '0 0 10px', fontSize: 40, color: 'white', fontFamily: "'Source Serif 4', serif" }}>
            Urgency to Act
          </h2>
          <p style={{ margin: '0 0 6px', fontSize: 18, color: 'rgba(255,255,255,0.75)', fontFamily: "'Source Sans 3', sans-serif" }}>
            The past 15 years show the ripple effects of the city's affordable housing crisis.
          </p>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 760 }}>
            <p style={{ margin: 0, fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontFamily: "'Source Sans 3', sans-serif" }}>
              Employers are struggling to hire talent, and modest-income residents and young people are moving out. As a result, the very character of our community is rapidly changing.
            </p>
            <p style={{ margin: 0, fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontFamily: "'Source Sans 3', sans-serif" }}>
              We want those who contribute to Steamboat Springs to be able to live here. Now, more than ever, we need to take action.
            </p>
          </div>
        </div>
      </div>

      {/* ── Our Trail Forward — intro banner ── */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid var(--border)', paddingBottom: 48 }}>
        <div style={pad}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 40, color: 'var(--navy)', fontFamily: "'Source Serif 4', serif" }}>
              Our Trail Forward
            </h2>
            <svg aria-hidden="true" focusable="false" width="28" height="28" viewBox="0 0 24 24" fill="var(--orange)">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </div>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 12, maxWidth: 760, margin: '0 0 12px' }}>
            A vibrant and healthy Steamboat Springs means having residents of all ages and incomes.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.75, maxWidth: 760, margin: 0, color: 'var(--text-dark)' }}>
            As we work together to create more affordable housing, we can measure our progress by
            tracking these two demographics — income and age. Over the past 15 years, we've seen the
            share of low- and middle-income residents and residents under 44 decrease rapidly.
          </p>
        </div>
      </div>

      {/* ── Charts 1 + 2 ── */}
      <div style={{ ...pad, paddingBottom: 56 }}>
        <div className="chart-grid">
          {/* Chart 1 — Income */}
          <div>
            <h3 style={chartTitle}>Percentage of Households by Income Level</h3>
            <p style={chartSubtitle}>2006–2024, Steamboat Springs city, ACS 5-year estimates</p>
            <LoadState loading={incomeLoading} error={incomeError} />
            {incomeChartData.length > 0 && (
              <AccessibleStackedBar
                data={incomeChartData}
                keys={incomeKeys}
                percent
                ariaLabel="Stacked bar chart showing percentage of households by income level from 2006 to 2024."
                caption="Source: ACS 5-year estimates, Table B19001"
              />
            )}
            <p style={accompText}>
              Low- and middle-income households fell from 86% to 57% of all households, while
              high-income households (&gt;$200K) quadrupled from 6% to 25%.
            </p>
          </div>

          {/* Chart 2 — Age */}
          <div>
            <h3 style={chartTitle}>Percentage of Residents by Age Group</h3>
            <p style={chartSubtitle}>2006–2024, Steamboat Springs city, ACS 5-year estimates</p>
            <LoadState loading={ageLoading} error={ageError} />
            {ageChartData.length > 0 && (
              <AccessibleStackedBar
                data={ageChartData.map(({ _medianAge, _share2544, ...rest }) => rest)}
                keys={ageKeys}
                percent
                ariaLabel="Stacked bar chart showing percentage of residents by age group from 2006 to 2024."
                caption="Source: ACS 5-year estimates, Table S0101"
              />
            )}
            <p style={accompText}>
              Residents aged 25–44 fell from 32% to 27% of the population, while residents 65 and
              older nearly tripled from 7% to 18% — signaling rapid community aging.
            </p>
          </div>
        </div>
      </div>

      {/* ── Income Deeper Dive banner ── */}
      <div style={{ backgroundColor: 'white', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={pad}>
          <SectionHeader
            title="Income Deeper Dive"
            subtitle="As high-income households surge, low- and middle-income households are disappearing."
          />
          <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.75, maxWidth: 760, color: 'var(--text-dark)' }}>
            Steamboat Springs is seeing clear, sustained growth at the top of the income ladder.
            Keeping the city livable for middle- and lower-income households will likely hinge on
            housing affordability initiatives, diverse job opportunities, and policies that help
            long-time residents stay rooted as the resort economy booms.
          </p>
        </div>
      </div>

      {/* ── Charts 3 + 4 ── */}
      <div style={{ ...pad, paddingBottom: 56 }}>
        <div className="chart-grid">
          {/* Chart 3 — High-income line */}
          <div>
            <h3 style={chartTitle}>Number of High-Income Households ($200K or More)</h3>
            <LoadState loading={incomeLoading} error={incomeError} />
            {highIncomeLineData.length > 0 && (
              <AccessibleLineChart
                data={highIncomeLineData}
                keys={['High-Income Households']}
                yDomain={[0, 2000]}
                yTickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v}
                ariaLabel="Line chart showing high-income households earning over $200,000 grew from 298 in 2006-2010 to 1,446 in 2020-2024."
                caption="Source: ACS 5-year estimates, Table B19001"
              />
            )}
            <p style={accompText}>
              High-income households earning more than $200,000 a year grew modestly from 298 to 549
              between 2006 and 2020, then nearly tripled in just five years — reaching 1,446 by
              2019–2023.
            </p>
          </div>

          {/* Chart 4 — Net population shift */}
          <div>
            <h3 style={chartTitle}>Net Population Shift by Income Level (2010 vs. 2023)</h3>
            <LoadState loading={incomeLoading} error={incomeError} />
            {netShiftData.length > 0 && (
              <ChartFigure
                ariaLabel="Bar chart showing net percentage-point shift by income level between 2006-2010 and 2020-2024. Low income fell 12 points, middle fell 14 points, upper middle grew 10 points, high income grew 18 points."
                caption="Source: ACS 5-year estimates, Table B19001"
                srTable={
                  <table>
                    <caption>Net Population Shift by Income Level</caption>
                    <thead>
                      <tr>
                        <th scope="col">Income Group</th>
                        <th scope="col">Change (percentage points)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {netShiftData.map((r) => (
                        <tr key={r.name}>
                          <th scope="row">{r.name}</th>
                          <td>{r['Change (pp)'] > 0 ? '+' : ''}{r['Change (pp)']}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                }
              >
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={netShiftData} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "'Source Sans 3', sans-serif" }} />
                    <YAxis
                      tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}pp`}
                      tick={{ fontSize: 13, fontFamily: "'Source Sans 3', sans-serif" }}
                    />
                    <Tooltip
                      formatter={(v) => [`${v > 0 ? '+' : ''}${v} percentage points`, 'Change']}
                      contentStyle={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13 }}
                    />
                    <ReferenceLine y={0} stroke="rgba(0,0,0,0.25)" />
                    <Bar dataKey="Change (pp)" radius={[3, 3, 0, 0]}>
                      {netShiftData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry['Change (pp)'] >= 0 ? '#e07b2a' : '#225286'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartFigure>
            )}
            <p style={accompText}>
              Between 2010 and 2023, low- and middle-income households shrank by 12 and 14 percentage
              points respectively, while upper-middle and high-income households grew by 10 and 18
              points.
            </p>
          </div>
        </div>
      </div>

      {/* ── Age Deeper Dive banner ── */}
      <div style={{ backgroundColor: 'white', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={pad}>
          <SectionHeader
            title="Age Deeper Dive"
            subtitle="Young adults and early-career families are leaving."
          />
          <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.75, maxWidth: 760, color: 'var(--text-dark)' }}>
            Steamboat Springs is rapidly aging. Since the 2006–2010 American Community Survey, the
            city's median age has climbed more than seven years — to roughly 43 — while the share of
            residents 65 and older has more than doubled.
          </p>
        </div>
      </div>

      {/* ── Charts 5 + 6 ── */}
      <div style={{ ...pad, paddingBottom: 56 }}>
        <div className="chart-grid">
          {/* Chart 5 — Median Age */}
          <div>
            <h3 style={chartTitle}>Median Age</h3>
            <LoadState loading={ageLoading} error={ageError} />
            {medianAgeData.length > 0 && (
              <AccessibleLineChart
                data={medianAgeData}
                keys={['Median Age']}
                yDomain={[34, 46]}
                ariaLabel="Line chart showing median age in Steamboat Springs rising from 35 in 2006-2010 to 44 in 2020-2024."
                caption="Source: ACS 5-year estimates, Table S0101"
              />
            )}
            <p style={accompText}>
              Median age rose steadily from 35 to 39 between 2006 and 2020, then accelerated sharply
              to 44 by 2020–2024 — nearly a 9-year increase in less than two decades.
            </p>
          </div>

          {/* Chart 6 — Share 25–44 */}
          <div>
            <h3 style={chartTitle}>Share of 25 to 44 Year Olds</h3>
            {share2544Data.length > 0 && (
              <AccessibleLineChart
                data={share2544Data}
                keys={['Share of 25–44 Year Olds']}
                yTickFormatter={(v) => `${v}%`}
                yDomain={[24, 36]}
                ariaLabel="Line chart showing residents aged 25 to 44 declining from about 32% in 2006-2010 to 27% in 2020-2024."
                caption="Source: ACS 5-year estimates, Table S0101"
              />
            )}
            <p style={accompText}>
              The share of 25 to 44 year olds held relatively steady around 32–33% from 2006 to
              2020, then dropped sharply to 27% by 2020–2024.
            </p>
          </div>
        </div>
      </div>

      {/* ── Employment Challenges banner ── */}
      <div style={{ backgroundColor: 'white', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={pad}>
          <SectionHeader
            title="Employment Challenges"
            subtitle="Workers in the 5 most common industries can't afford housing."
          />
          <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.75, maxWidth: 760, color: 'var(--text-dark)' }}>
            The top 5 industries in Routt County, shown in this graph, collectively account for
            nearly half of all jobs. Given their modest wages relative to average rent in Steamboat
            Springs, most are likely to be housing-cost burdened — meaning they spend more than 30%
            of their income on housing.
          </p>
        </div>
      </div>

      {/* ── Chart 7 — full width ── */}
      <div style={{ ...pad, paddingBottom: 64 }}>
        <h3 style={chartTitle}>Max Rent Without Being Housing Cost Burdened Compared to Average Rent</h3>
        <LoadState loading={empLoading} error={empError} />
        {empChartData.length > 0 && (
          <AccessibleBarChart
            data={empChartData}
            keys={['Max Affordable Rent']}
            yTickFormatter={(v) => `$${(v / 1000).toFixed(1)}K`}
            tooltipFormatter={(v) => [`$${v.toLocaleString()}`, 'Max Affordable Rent']}
            referenceLines={[
              { value: 1909, label: '$1,909 ACS median rent (2019–23)', stroke: '#225286', dashed: true },
              { value: 4985, label: '$4,985 Zillow avg (2025)', stroke: '#c0392b' },
            ]}
            yDomain={[0, 5500]}
            ariaLabel="Bar chart showing maximum rent workers in five industries can afford without being housing-cost burdened, compared to the $1,909 ACS median and $4,985 Zillow average. All fall well below market rent."
            caption="Source: YVHA Housing Demand Study 2025; JobsEQ; ACS 5-year estimates; Zillow. Max rent calculated as 30% of median industry wage."
          />
        )}
        <p style={{ ...accompText, maxWidth: 760 }}>
          "Max rent" is calculated based on the maximum someone in the given profession can spend
          without being housing-cost burdened. The maximum rent workers in these five industries can
          afford ranges from $2,018 (Business and Financial Operations) down to $1,053 (Food
          Preparation) — all falling well below the average market rent of $4,985 (Zillow) and below
          or near the ACS median of $1,909.
        </p>
      </div>

    </div>
  )
}
