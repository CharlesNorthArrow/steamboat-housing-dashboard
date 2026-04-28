import { useMemo } from 'react'
import { useGoogleSheet } from '../hooks/useGoogleSheet'
import { SHEET_URLS } from '../utils/sheetUrls'
import { parsePercent, parseDollar } from '../utils/formatters'
import AccessibleStackedBar from '../components/charts/AccessibleStackedBar'
import AccessibleLineChart from '../components/charts/AccessibleLineChart'
import AccessibleBarChart from '../components/charts/AccessibleBarChart'
import SectionHeader from '../components/ui/SectionHeader'
import CalloutBox from '../components/ui/CalloutBox'

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
const sectionGap = { marginBottom: 64 }
const chartTitle = { color: 'var(--navy)', marginBottom: 4, fontSize: 18, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600 }
const chartSubtitle = { fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }

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
      .map((r) => {
        const g = groupIncome(r)
        return { name: r.Years, 'High-Income Households': Math.round(g._highCount) }
      })
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

      {/* Page header */}
      <div style={{ ...pad, paddingBottom: 40, ...sectionGap, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 40, color: 'var(--navy)' }}>Our Trail Forward</h2>
          <svg aria-hidden="true" focusable="false" width="28" height="28" viewBox="0 0 24 24" fill="var(--orange)">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        </div>
        <p style={{ fontSize: 20, color: 'var(--text-muted)', marginBottom: 16, maxWidth: 700 }}>
          A vibrant and healthy Steamboat Springs means having residents of all ages and incomes.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.75, maxWidth: 760, margin: 0 }}>
          As we work together to create more affordable housing, we can measure our progress by
          tracking these two demographics — income and age. Over the past 15 years, we've seen the
          share of low- and middle-income residents and residents under 44 decrease rapidly.
        </p>
      </div>

      {/* Urgency to Act */}
      <div style={{ backgroundColor: 'var(--dark-bg)', ...sectionGap }}>
        <div style={pad}>
          <SectionHeader
            dark
            title="Urgency to Act"
            subtitle="The past 15 years show the ripple effects of the city's affordable housing crisis."
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 24 }}>
            <CalloutBox>
              Low- and middle-income households fell from 86% to 57% of all households, while
              high-income households (&gt;$200K) quadrupled from 6% to 25%.
            </CalloutBox>
            <CalloutBox>
              Residents aged 25–44 fell from 32% to 27% of the population, while residents 65 and
              older nearly tripled from 7% to 18% — signaling rapid community aging.
            </CalloutBox>
          </div>
        </div>
      </div>

      {/* Charts 1 + 2 — Demographics overview, side by side */}
      <div style={pad}>
        <h3 style={{ margin: '0 0 8px', fontSize: 28, color: 'var(--navy)' }}>Who Lives Here</h3>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32, maxWidth: 680 }}>
          Income and age distributions have shifted sharply over the past 15 years.
        </p>

        <div className="chart-grid">
          {/* Chart 1 — Income */}
          <div>
            <h4 style={chartTitle}>Households by Income Level</h4>
            <p style={chartSubtitle}>2006–2024, Steamboat Springs city, ACS 5-year estimates</p>
            <LoadState loading={incomeLoading} error={incomeError} />
            {incomeChartData.length > 0 && (
              <AccessibleStackedBar
                data={incomeChartData}
                keys={incomeKeys}
                percent
                ariaLabel="Bar chart showing percentage of households by income level from 2006 to 2024. Low- and middle-income households fell from 86% to 57%, while high-income households grew from 6% to 25%."
                caption="Source: ACS 5-year estimates, Table B19001"
              />
            )}
          </div>

          {/* Chart 2 — Age */}
          <div>
            <h4 style={chartTitle}>Residents by Age Group</h4>
            <p style={chartSubtitle}>2006–2024, Steamboat Springs city, ACS 5-year estimates</p>
            <LoadState loading={ageLoading} error={ageError} />
            {ageChartData.length > 0 && (
              <AccessibleStackedBar
                data={ageChartData.map(({ _medianAge, _share2544, ...rest }) => rest)}
                keys={ageKeys}
                percent
                ariaLabel="Bar chart showing percentage of residents by age group from 2006 to 2024. Residents aged 25–44 declined while residents 65 and older grew significantly."
                caption="Source: ACS 5-year estimates, Table S0101"
              />
            )}
          </div>
        </div>
      </div>

      {/* Income deeper dive — Chart 3, full width */}
      <div style={{ backgroundColor: 'white', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', ...sectionGap }}>
        <div style={pad}>
          <SectionHeader
            title="Income Deeper Dive"
            subtitle="As high-income households surge, low- and middle-income households are disappearing."
          />
          <div style={{ marginTop: 24 }}>
            <h4 style={chartTitle}>Number of High-Income Households ($200K or More)</h4>
            <LoadState loading={incomeLoading} error={incomeError} />
            {highIncomeLineData.length > 0 && (
              <>
                <AccessibleLineChart
                  data={highIncomeLineData}
                  keys={['High-Income Households']}
                  yDomain={[0, 2000]}
                  yTickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v}
                  ariaLabel="Line chart showing high-income households earning over $200,000 grew from 298 in 2006-2010 to 1,446 in 2020-2024."
                  caption="Source: ACS 5-year estimates, Table B19001"
                />
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, maxWidth: 720 }}>
                  High-income households earning more than $200,000 a year grew modestly from 298 to
                  549 between 2006 and 2020, then nearly tripled in just five years — reaching 1,446
                  by 2019–2023.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Age deeper dive — Charts 5 + 6, side by side */}
      <div style={pad}>
        <SectionHeader
          title="Age Deeper Dive"
          subtitle="Young adults and early-career families are leaving."
        />

        <div className="chart-grid" style={{ marginTop: 24 }}>
          {/* Chart 5 — Median Age */}
          <div>
            <h4 style={chartTitle}>Median Age</h4>
            <LoadState loading={ageLoading} error={ageError} />
            {medianAgeData.length > 0 && (
              <>
                <AccessibleLineChart
                  data={medianAgeData}
                  keys={['Median Age']}
                  yDomain={[34, 46]}
                  ariaLabel="Line chart showing median age in Steamboat Springs rising from 35 in 2006-2010 to 44 in 2020-2024."
                  caption="Source: ACS 5-year estimates, Table S0101"
                />
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
                  Median age rose from 35 to 39 between 2006 and 2020, then accelerated to 44 by 2020–2024.
                </p>
              </>
            )}
          </div>

          {/* Chart 6 — Share 25–44 */}
          <div>
            <h4 style={chartTitle}>Share of 25 to 44 Year Olds</h4>
            {share2544Data.length > 0 && (
              <>
                <AccessibleLineChart
                  data={share2544Data}
                  keys={['Share of 25–44 Year Olds']}
                  yTickFormatter={(v) => `${v}%`}
                  yDomain={[24, 36]}
                  ariaLabel="Line chart showing residents aged 25 to 44 declining from about 32% in 2006-2010 to 27% in 2020-2024."
                  caption="Source: ACS 5-year estimates, Table S0101"
                />
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
                  The share of residents aged 25–44 dropped sharply to 27% by 2020–2024.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Employment — Chart 7, full width */}
      <div style={{ backgroundColor: 'white', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', paddingBottom: 56 }}>
        <div style={pad}>
          <SectionHeader
            title="Employment Challenges"
            subtitle="Workers in the 5 most common industries cannot afford housing."
          />
          <div style={{ marginTop: 24 }}>
            <h4 style={chartTitle}>Max Rent Without Being Housing Cost Burdened Compared to Average Rent</h4>
            <LoadState loading={empLoading} error={empError} />
            {empChartData.length > 0 && (
              <>
                <AccessibleBarChart
                  data={empChartData}
                  keys={['Max Affordable Rent']}
                  yTickFormatter={(v) => `$${(v / 1000).toFixed(1)}K`}
                  tooltipFormatter={(v) => [`$${v.toLocaleString()}`, 'Max Affordable Rent']}
                  referenceLines={[
                    { value: 1909, label: '$1,909 ACS median rent (2019–23)', stroke: '#1b3a5c', dashed: true },
                    { value: 4985, label: '$4,985 Zillow avg (2025)', stroke: '#c0392b' },
                  ]}
                  yDomain={[0, 5500]}
                  ariaLabel="Bar chart showing maximum rent workers in five industries can afford without being housing-cost burdened, compared to the $1,909 ACS median and $4,985 Zillow average."
                  caption="Source: YVHA Housing Demand Study 2025; JobsEQ; ACS 5-year estimates; Zillow. Max rent calculated as 30% of median industry wage."
                />
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
                  Max rent is calculated based on the maximum someone in the given profession can
                  spend without being housing-cost burdened.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
