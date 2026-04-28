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

// Maps ACS income bracket columns to our 4 groups
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

// Groups ACS age columns into 6 categories
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

export default function TrailForward() {
  const { data: incomeData, loading: incomeLoading, error: incomeError } = useGoogleSheet(SHEET_URLS.income)
  const { data: ageData, loading: ageLoading, error: ageError } = useGoogleSheet(SHEET_URLS.age)
  const { data: empData, loading: empLoading, error: empError } = useGoogleSheet(SHEET_URLS.employment)

  // Income chart data
  const incomeChartData = useMemo(() => {
    if (!incomeData) return []
    return incomeData
      .filter((r) => PERIODS.includes(r.Years))
      .sort((a, b) => PERIODS.indexOf(a.Years) - PERIODS.indexOf(b.Years))
      .map((r) => ({ name: r.Years, ...groupIncome(r) }))
  }, [incomeData])

  // High-income line chart data
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

  // Age chart data
  const ageChartData = useMemo(() => {
    if (!ageData) return []
    return ageData
      .filter((r) => PERIODS.includes(r.Years))
      .sort((a, b) => PERIODS.indexOf(a.Years) - PERIODS.indexOf(b.Years))
      .map((r) => ({ name: r.Years, ...groupAge(r) }))
  }, [ageData])

  // Median age line data
  const medianAgeData = useMemo(() => {
    if (!ageData) return []
    return ageData
      .filter((r) => PERIODS.includes(r.Years))
      .sort((a, b) => PERIODS.indexOf(a.Years) - PERIODS.indexOf(b.Years))
      .map((r) => {
        const g = groupAge(r)
        return { name: r.Years, 'Median Age': g._medianAge }
      })
  }, [ageData])

  // Share 25-44 line data
  const share2544Data = useMemo(() => {
    if (!ageData) return []
    return ageData
      .filter((r) => PERIODS.includes(r.Years))
      .sort((a, b) => PERIODS.indexOf(a.Years) - PERIODS.indexOf(b.Years))
      .map((r) => {
        const g = groupAge(r)
        return { name: r.Years, 'Share of 25–44 Year Olds': +(g._share2544 * 100).toFixed(1) }
      })
  }, [ageData])

  // Employment chart data
  const empChartData = useMemo(() => {
    if (!empData) return []
    return empData.map((r) => ({
      name: r.Industry,
      'Max Affordable Rent': parseDollar(r['Max Rent Without Being Cost Burdened']),
    }))
  }, [empData])

  const incomeKeys = ['Low Income (<$50K)', 'Middle ($50K–$124K)', 'Upper Middle ($125K–$199K)', 'High Income (>$200K)']
  const ageKeys = ['0–14', '15–24', '25–44', '45–64', '65–74', '75 & over']

  const contentStyle = { maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }
  const sectionGap = { marginBottom: 56 }

  return (
    <div id="panel-trail-forward" role="tabpanel" aria-labelledby="tab-trail-forward" tabIndex={-1}>

      {/* Page header */}
      <div style={{ ...contentStyle, ...sectionGap }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 32, color: 'var(--navy)' }}>Our Trail Forward</h2>
          <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="var(--orange)">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        </div>
        <p style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 16 }}>
          A vibrant and healthy Steamboat Springs means having residents of all ages and incomes.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 760 }}>
          As we work together to create more affordable housing, we can measure our progress by
          tracking these two demographics — income and age. Over the past 15 years, we've seen the
          share of low- and middle-income residents and residents under 44 decrease rapidly.
        </p>
      </div>

      {/* Urgency to Act */}
      <div style={{ backgroundColor: 'var(--dark-bg)', ...sectionGap }}>
        <div style={{ ...contentStyle, paddingTop: 0, paddingBottom: 0 }}>
          <SectionHeader
            dark
            title="Urgency to Act"
            subtitle="The past 15 years show the ripple effects of the city's affordable housing crisis."
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, paddingBottom: 32 }}>
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

      <div style={contentStyle}>

        {/* Chart 1 — Income stacked bar */}
        <div style={sectionGap}>
          <h3 style={{ color: 'var(--navy)', marginBottom: 4, fontSize: 20 }}>
            Percentage of Households by Income Level
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
            2006–2024, Steamboat Springs city, ACS 5-year estimates
          </p>
          <LoadState loading={incomeLoading} error={incomeError} />
          {incomeChartData.length > 0 && (
            <AccessibleStackedBar
              data={incomeChartData}
              keys={incomeKeys}
              percent
              ariaLabel="Bar chart showing percentage of households by income level from 2006 to 2024. Key finding: low- and middle-income households fell from 86% to 57%, while high-income households grew from 6% to 25%."
              caption="Source: ACS 5-year estimates, Table B19001"
            />
          )}
        </div>

        {/* Chart 2 — Age stacked bar */}
        <div style={sectionGap}>
          <h3 style={{ color: 'var(--navy)', marginBottom: 4, fontSize: 20 }}>
            Percentage of Residents by Age Group
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
            2006–2024, Steamboat Springs city, ACS 5-year estimates
          </p>
          <LoadState loading={ageLoading} error={ageError} />
          {ageChartData.length > 0 && (
            <AccessibleStackedBar
              data={ageChartData.map((r) => {
                const { _medianAge, _share2544, ...rest } = r
                return rest
              })}
              keys={ageKeys}
              percent
              ariaLabel="Bar chart showing percentage of residents by age group from 2006 to 2024. Key finding: residents aged 25–44 declined while residents 65 and older grew significantly."
              caption="Source: ACS 5-year estimates, Table S0101"
            />
          )}
        </div>

        {/* Income Deeper Dive */}
        <div style={{ ...sectionGap, borderTop: '2px solid var(--border)', paddingTop: 40 }}>
          <h3 style={{ color: 'var(--navy)', marginBottom: 4, fontSize: 22 }}>Income Deeper Dive</h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 24 }}>
            As high-income households surge, low- and middle-income households are disappearing.
          </p>

          {/* Chart 3 — High income line */}
          <h4 style={{ color: 'var(--navy)', marginBottom: 4, fontSize: 18, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600 }}>
            Number of High-Income Households ($200K or More)
          </h4>
          <LoadState loading={incomeLoading} error={incomeError} />
          {highIncomeLineData.length > 0 && (
            <>
              <AccessibleLineChart
                data={highIncomeLineData}
                keys={['High-Income Households']}
                yDomain={[0, 2000]}
                yTickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v}
                ariaLabel="Line chart showing the number of high-income households earning over $200,000 from 2006 to 2024. Households grew from 298 to 1,446."
                caption="Source: ACS 5-year estimates, Table B19001"
              />
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, maxWidth: 680 }}>
                High-income households earning more than $200,000 a year grew modestly from 298 to
                549 between 2006 and 2020, then nearly tripled in just five years — reaching 1,446
                by 2019–2023.
              </p>
            </>
          )}
        </div>

        {/* Age Deeper Dive */}
        <div style={{ ...sectionGap, borderTop: '2px solid var(--border)', paddingTop: 40 }}>
          <h3 style={{ color: 'var(--navy)', marginBottom: 4, fontSize: 22 }}>Age Deeper Dive</h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 24 }}>
            Young adults and early-career families are leaving.
          </p>

          {/* Chart 5 — Median Age */}
          <h4 style={{ color: 'var(--navy)', marginBottom: 4, fontSize: 18, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600 }}>
            Median Age
          </h4>
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
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, maxWidth: 680 }}>
                Median age rose from 35 to 39 between 2006 and 2020, then accelerated to 44 by
                2020–2024.
              </p>
            </>
          )}

          {/* Chart 6 — Share 25-44 */}
          <h4 style={{ color: 'var(--navy)', marginBottom: 4, marginTop: 32, fontSize: 18, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600 }}>
            Share of 25 to 44 Year Olds
          </h4>
          {share2544Data.length > 0 && (
            <>
              <AccessibleLineChart
                data={share2544Data}
                keys={['Share of 25–44 Year Olds']}
                yTickFormatter={(v) => `${v}%`}
                yDomain={[24, 36]}
                ariaLabel="Line chart showing the share of residents aged 25 to 44 declining from about 32% in 2006-2010 to 27% in 2020-2024."
                caption="Source: ACS 5-year estimates, Table S0101"
              />
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, maxWidth: 680 }}>
                The share of residents aged 25–44 dropped sharply to 27% by 2020–2024.
              </p>
            </>
          )}
        </div>

        {/* Employment Challenges */}
        <div style={{ ...sectionGap, borderTop: '2px solid var(--border)', paddingTop: 40 }}>
          <h3 style={{ color: 'var(--navy)', marginBottom: 4, fontSize: 22 }}>Employment Challenges</h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 24 }}>
            Workers in the 5 most common industries cannot afford housing.
          </p>

          {/* Chart 7 — Max Rent vs Reference Lines */}
          <h4 style={{ color: 'var(--navy)', marginBottom: 4, fontSize: 18, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600 }}>
            Max Rent Without Being Housing Cost Burdened Compared to Average Rent
          </h4>
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
                ariaLabel="Bar chart showing maximum rent workers in five industries can afford without being housing-cost burdened, compared to the $1,909 ACS median rent and $4,985 Zillow average. All industries fall well below market rent."
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
  )
}
