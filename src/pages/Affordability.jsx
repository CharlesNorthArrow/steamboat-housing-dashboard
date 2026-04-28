import { useMemo } from 'react'
import { useGoogleSheet } from '../hooks/useGoogleSheet'
import { SHEET_URLS } from '../utils/sheetUrls'
import { parseDollar, parsePercent } from '../utils/formatters'
import AccessibleBarChart from '../components/charts/AccessibleBarChart'
import SectionHeader from '../components/ui/SectionHeader'

function LoadState({ loading, error }) {
  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading data...</p>
  if (error) return <p style={{ color: '#c0392b', fontSize: 14 }}>Error loading data: {error}</p>
  return null
}

const chartTitle = { color: 'var(--navy)', fontSize: 18, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600, margin: '0 0 4px' }
const chartSubtitle = { fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px' }
const bannerBody = { margin: '12px 0 0', fontSize: 16, color: 'var(--text-dark)', lineHeight: 1.75, fontFamily: "'Source Sans 3', sans-serif" }

export default function Affordability() {
  const { data: mktData, loading: mktLoading, error: mktError } = useGoogleSheet(SHEET_URLS.affordableVMarket)
  const { data: amiData, loading: amiLoading, error: amiError } = useGoogleSheet(SHEET_URLS.salesByAMI)
  const { data: salaryData, loading: salaryLoading, error: salaryError } = useGoogleSheet(SHEET_URLS.salaryToRentBuy)
  const { data: colData, loading: colLoading, error: colError } = useGoogleSheet(SHEET_URLS.costOfLiving)
  const { data: housingCostData, loading: hcLoading, error: hcError } = useGoogleSheet(SHEET_URLS.housingCosts)

  const affordableVMarketChart = useMemo(() => {
    if (!mktData) return []
    return mktData.map((r) => ({
      name: r['Unit size'],
      'Affordable Rent': parseDollar(r['Affordable rent']),
      'Market Rent': parseDollar(r['Market rent']),
      'Market Premium': parseDollar(r['Market premium']),
    }))
  }, [mktData])

  const amiChart = useMemo(() => {
    if (!amiData) return []
    return amiData.map((r) => ({
      name: r['AMI Category'],
      'Household Share (%)': parsePercent(r['Households Share (%)']),
      'Sales Share (%)': parsePercent(r['Sales Share (%)']),
    }))
  }, [amiData])

  const salaryChart = useMemo(() => {
    if (!salaryData) return []
    const industries = [
      'Educational Services',
      'Health Care and Social Assistance ',
      'Accommodation and Food Services ',
      'Arts, Entertainment, and Recreation ',
    ]
    const labels = ['Educational Services', 'Health Care', 'Accommodation & Food', 'Arts & Recreation']
    return industries.map((ind, i) => {
      const row = salaryData.find((r) => r.Topic === '2 Salaries from Sector')
      return {
        name: labels[i],
        '2 Salaries (Combined)': parseDollar(row?.[ind] || '0'),
        '1 Salary (Est.)': parseDollar(row?.[ind] || '0') / 2,
      }
    })
  }, [salaryData])

  const incomeToByRef = useMemo(() => {
    if (!salaryData) return null
    const row = salaryData.find((r) => r.Topic === '2 Salaries from Sector')
    return parseDollar(row?.['Income Required to Buy a Median Prices Home'] || '328452')
  }, [salaryData])

  const col1EarnerChart = useMemo(() => {
    if (!colData) return []
    const row = colData.find((r) => r.Earners === '1 Earner')
    if (!row) return []
    return [
      { name: 'Educational Services', 'Annual Salary': parseDollar(row['Educational Services Professional']) },
      { name: 'Accommodation & Food', 'Annual Salary': parseDollar(row['Accomodation and Food Service Worker']) },
      { name: 'Health Care', 'Annual Salary': parseDollar(row['Health Care and Social Assistance Professional']) },
    ]
  }, [colData])

  const col2EarnerChart = useMemo(() => {
    if (!colData) return []
    const row2 = colData.find((r) => r.Earners === '2 Adults _both working')
    const row1 = colData.find((r) => r.Earners === '1 Earner')
    const baseRow = row2 || row1
    if (!baseRow) return []
    return [
      { name: 'Educational Services', 'Combined Salaries': (parseDollar(baseRow['Educational Services Professional']) || 0) * 2 },
      { name: 'Accommodation & Food', 'Combined Salaries': (parseDollar(baseRow['Accomodation and Food Service Worker']) || 0) * 2 },
      { name: 'Health Care', 'Combined Salaries': (parseDollar(baseRow['Health Care and Social Assistance Professional']) || 0) * 2 },
    ]
  }, [colData])

  const fmt$ = (v) => v != null ? `$${Number(v).toLocaleString()}` : '—'

  return (
    <div id="panel-affordability" role="tabpanel" aria-labelledby="tab-affordability" tabIndex={-1}>

      {/* ── Rising Rent banner ── */}
      <div className="banner-pad" style={{ backgroundColor: 'var(--light-bg)' }}>
        <SectionHeader title="Rising Rent" />
        <p style={bannerBody}>
          Affordable rents are disappearing as market-rate housing costs climb far beyond what
          local workers can afford — leaving renters facing severe financial strain.
        </p>
      </div>

      {/* ── Rising Rent charts ── */}
      <div className="section-pad" style={{ backgroundColor: 'white' }}>

        {/* Chart 8 placeholder */}
        <div style={{ marginBottom: 48 }}>
          <h3 style={chartTitle}>Housing Costs — Renters</h3>
          <LoadState loading={hcLoading} error={hcError} />
          {!hcLoading && !hcError && (
            <p style={{ fontSize: 14, color: 'var(--text-muted)', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 4, maxWidth: 640 }}>
              Renter housing cost distribution data (ACS B25070) will appear here once the
              "Housing Cost Burden: Renters" sheet in Source A is populated.
            </p>
          )}
        </div>

        {/* Chart 9 — full width */}
        <div>
          <h3 style={chartTitle}>Affordable vs. Market Rent by Unit Size</h3>
          <p style={chartSubtitle}>2024, Steamboat Springs</p>
          <LoadState loading={mktLoading} error={mktError} />
          {affordableVMarketChart.length > 0 && (
            <AccessibleBarChart
              data={affordableVMarketChart}
              keys={['Affordable Rent', 'Market Rent', 'Market Premium']}
              yTickFormatter={fmt$}
              tooltipFormatter={(v, name) => [fmt$(v), name]}
              yDomain={[0, 4500]}
              ariaLabel="Grouped bar chart comparing affordable rent, market rent, and the market premium gap by unit size in 2024."
              caption="Source: YVHA Housing Study 2025; CoStar; Property websites; Zillow; YVHA; CHFA; Economic & Planning Systems (page 71)"
            />
          )}
        </div>
      </div>

      {/* ── Rocketing Home Prices banner ── */}
      <div className="banner-pad" style={{ backgroundColor: 'var(--navy)' }}>
        <SectionHeader dark title="Rocketing Home Prices" />
        <p style={{ margin: '12px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontFamily: "'Source Sans 3', sans-serif" }}>
          Steamboat Springs' for-sale housing market is heavily tilted toward high-income buyers,
          leaving local workers priced out even with two incomes.
        </p>
      </div>

      {/* ── Rocketing Home Prices charts ── */}
      <div className="section-pad" style={{ backgroundColor: 'white' }}>
        <div className="chart-grid">

          {/* Chart 10 */}
          <div>
            <h3 style={chartTitle}>Top Industry Salaries vs. Median Home Price</h3>
            <p style={chartSubtitle}>2024, Routt County</p>
            <LoadState loading={salaryLoading} error={salaryError} />
            {salaryChart.length > 0 && (
              <AccessibleBarChart
                data={salaryChart}
                keys={['1 Salary (Est.)', '2 Salaries (Combined)']}
                yTickFormatter={fmt$}
                tooltipFormatter={(v, name) => [fmt$(v), name]}
                referenceLines={incomeToByRef ? [
                  { value: incomeToByRef, label: `${fmt$(incomeToByRef)} — Income Required to Buy Median Home`, stroke: '#c0392b' },
                ] : []}
                yDomain={[0, 380000]}
                ariaLabel="Grouped bar chart showing 1-salary and 2-salary incomes for four industries compared to the income required to buy a median-priced home in Routt County."
                caption="Source: YVHA Housing Demand Study 2025; Routt County Economic Development Partnership; MLS; Routt County Assessor"
              />
            )}
          </div>

          {/* Chart 11 */}
          <div>
            <h3 style={chartTitle}>Share of Households and Sales by AMI</h3>
            <p style={chartSubtitle}>2024, Routt County</p>
            <LoadState loading={amiLoading} error={amiError} />
            {amiChart.length > 0 && (
              <AccessibleBarChart
                data={amiChart}
                keys={['Household Share (%)', 'Sales Share (%)']}
                layout="horizontal"
                xTickFormatter={(v) => `${v}%`}
                tooltipFormatter={(v, name) => [`${v}%`, name]}
                ariaLabel="Horizontal paired bar chart showing household share and sales share by AMI band in Routt County 2024."
                caption="Source: YVHA Housing Demand Study 2025; MLS; Moffat County Assessor; CHFA Income Limits; Economic & Planning Systems (page 67)"
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Housing Cost Burden banner ── */}
      <div className="banner-pad" style={{ backgroundColor: 'var(--navy)' }}>
        <SectionHeader dark title="Housing Cost Burden" />
        <p style={{ margin: '12px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontFamily: "'Source Sans 3', sans-serif" }}>
          New affordable housing can help reduce cost burden for renters and owners alike,
          but sustained action is essential to make meaningful progress.
        </p>
      </div>

      {/* ── Housing Cost Burden placeholder ── */}
      <div className="section-pad" style={{ backgroundColor: 'white' }}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 4, maxWidth: 640 }}>
          Charts 12 and 13 will display automatically once the "Housing Cost Burden: Renters" and
          "Housing Cost Burden: Owners" sheets in Source A are populated with ACS B25070/B25091
          data structured as: Years | 30%+ Renters | 50%+ Renters | 30%+ Owners | 50%+ Owners
          with Mortgage | 50%+ Owners no Mortgage.
        </p>
      </div>

      {/* ── Mounting Basic Costs banner ── */}
      <div className="banner-pad" style={{ backgroundColor: 'var(--navy)' }}>
        <SectionHeader dark title="Mounting Basic Costs" />
        <p style={{ margin: '12px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontFamily: "'Source Sans 3', sans-serif" }}>
          In Routt County, the basic cost of living outpaces what many local workers earn —
          even in households with two incomes.
        </p>
      </div>

      {/* ── Mounting Basic Costs charts ── */}
      <div className="section-pad" style={{ backgroundColor: 'white', paddingBottom: 64 }}>
        <div className="chart-grid">

          {/* Chart 14 */}
          <div>
            <h3 style={chartTitle}>1 Earner Income vs. Basic Costs</h3>
            <p style={chartSubtitle}>Routt County</p>
            <LoadState loading={colLoading} error={colError} />
            {col1EarnerChart.length > 0 && (
              <AccessibleBarChart
                data={col1EarnerChart}
                keys={['Annual Salary']}
                yTickFormatter={fmt$}
                tooltipFormatter={(v, name) => [fmt$(v), name]}
                referenceLines={[
                  { value: 58332, label: '$58,332 — 1 Adult Costs', stroke: '#e07b2a', dashed: true },
                  { value: 107299, label: '$107,299 — 1 Adult + 1 Child', stroke: '#c0392b' },
                ]}
                yDomain={[0, 130000]}
                ariaLabel="Bar chart comparing single-earner salaries for three industry workers to the cost of living for one adult and one adult with one child in Routt County."
                caption="Source: Routt County Economic Development Partnership 2025; MIT Living Wage Calculator for Routt County 2025"
              />
            )}
          </div>

          {/* Chart 15 */}
          <div>
            <h3 style={chartTitle}>2 Earners Income vs. Basic Costs</h3>
            <p style={chartSubtitle}>Routt County</p>
            {col2EarnerChart.length > 0 && (
              <AccessibleBarChart
                data={col2EarnerChart}
                keys={['Combined Salaries']}
                yTickFormatter={fmt$}
                tooltipFormatter={(v, name) => [fmt$(v), name]}
                referenceLines={[
                  { value: 79780, label: '$79,780 — 2 Adults Costs', stroke: '#e07b2a', dashed: true },
                  { value: 151805, label: '$151,805 — 2 Adults + 2 Children', stroke: '#c0392b' },
                ]}
                yDomain={[0, 180000]}
                ariaLabel="Bar chart comparing combined two-earner salaries for three industry worker pairs to the cost of living for two adults and two adults with two children in Routt County."
                caption="Source: Routt County Economic Development Partnership 2025; MIT Living Wage Calculator for Routt County 2025"
              />
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
