import { useMemo } from 'react'
import { useGoogleSheet } from '../hooks/useGoogleSheet'
import { SHEET_URLS } from '../utils/sheetUrls'
import { parseDollar, parsePercent } from '../utils/formatters'
import AccessibleStackedBar from '../components/charts/AccessibleStackedBar'
import AccessibleBarChart from '../components/charts/AccessibleBarChart'
import AccessibleLineChart from '../components/charts/AccessibleLineChart'
import SectionHeader from '../components/ui/SectionHeader'

const PERIODS = ['2006-2010', '2011-2015', '2016-2020', '2020-2024']

function LoadState({ loading, error }) {
  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading data...</p>
  if (error) return <p style={{ color: '#c0392b', fontSize: 14 }}>Error loading data: {error}</p>
  return null
}

const sectionGap = { marginBottom: 56 }
const contentStyle = { maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }

export default function Affordability() {
  const { data: mktData, loading: mktLoading, error: mktError } = useGoogleSheet(SHEET_URLS.affordableVMarket)
  const { data: amiData, loading: amiLoading, error: amiError } = useGoogleSheet(SHEET_URLS.salesByAMI)
  const { data: salaryData, loading: salaryLoading, error: salaryError } = useGoogleSheet(SHEET_URLS.salaryToRentBuy)
  const { data: colData, loading: colLoading, error: colError } = useGoogleSheet(SHEET_URLS.costOfLiving)
  const { data: housingCostData, loading: hcLoading, error: hcError } = useGoogleSheet(SHEET_URLS.housingCosts)

  // Chart 9 — Affordable vs Market rent by unit size
  const affordableVMarketChart = useMemo(() => {
    if (!mktData) return []
    return mktData.map((r) => ({
      name: r['Unit size'],
      'Affordable Rent': parseDollar(r['Affordable rent']),
      'Market Rent': parseDollar(r['Market rent']),
      'Market Premium': parseDollar(r['Market premium']),
    }))
  }, [mktData])

  // Chart 11 — Sales by AMI paired horizontal bar
  const amiChart = useMemo(() => {
    if (!amiData) return []
    return amiData.map((r) => ({
      name: r['AMI Category'],
      'Household Share (%)': parsePercent(r['Households Share (%)']),
      'Sales Share (%)': parsePercent(r['Sales Share (%)']),
    }))
  }, [amiData])

  // Chart 10 — Salary to Rent/Buy
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

  // Chart 14 — 1 Earner Cost of Living
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

  // Chart 15 — 2 Earners Cost of Living
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
      <div style={{ ...contentStyle, ...sectionGap }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 32, color: 'var(--navy)' }}>Rising Costs</h2>
        <p style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 16 }}>
          Wages are not keeping up with Steamboat Springs' mounting costs of living.
        </p>
      </div>

      {/* Rising Rent */}
      <div style={{ backgroundColor: 'white', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', ...sectionGap }}>
        <div style={contentStyle}>
          <SectionHeader
            title="Rising Rent"
            subtitle="Affordable rents are disappearing, and renters are facing severe financial strain."
          />

          {/* Chart 8 — Housing Costs Renters (from CP04 if available, else note) */}
          <div style={{ marginBottom: 40 }}>
            <h4 style={{ color: 'var(--navy)', marginBottom: 4, fontSize: 17, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600 }}>
              Housing Costs — Renters
            </h4>
            <LoadState loading={hcLoading} error={hcError} />
            {!hcLoading && !hcError && (
              <p style={{ fontSize: 14, color: 'var(--text-muted)', fontStyle: 'normal', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 4, maxWidth: 640 }}>
                Renter housing cost distribution data (ACS B25070) is referenced in the data dictionary.
                The client-maintained spreadsheet sheet for this chart will be mapped when the tab
                "Housing Cost Burden: Renters" is populated with renter cost distribution by period.
                Contact the data team to confirm sheet configuration.
              </p>
            )}
          </div>

          {/* Chart 9 — Affordable vs Market */}
          <div style={{ marginBottom: 0 }}>
            <h4 style={{ color: 'var(--navy)', marginBottom: 4, fontSize: 17, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600 }}>
              Affordable vs. Market Rent by Unit Size
            </h4>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>2024, Steamboat Springs</p>
            <LoadState loading={mktLoading} error={mktError} />
            {affordableVMarketChart.length > 0 && (
              <AccessibleBarChart
                data={affordableVMarketChart}
                keys={['Affordable Rent', 'Market Rent', 'Market Premium']}
                yTickFormatter={fmt$}
                tooltipFormatter={(v, name) => [fmt$(v), name]}
                yDomain={[0, 4500]}
                ariaLabel="Grouped bar chart comparing affordable rent, market rent, and the market premium gap by unit size (1-bed, 2-bed, 3-bed) in 2024."
                caption="Source: YVHA Housing Study 2025; CoStar; Property websites; Zillow; YVHA; CHFA; Economic & Planning Systems (page 71)"
              />
            )}
          </div>
        </div>
      </div>

      {/* Rocketing Home Prices */}
      <div style={{ ...sectionGap }}>
        <div style={contentStyle}>
          <SectionHeader
            title="Rocketing Home Prices"
            subtitle="Steamboat Springs' for-sale housing market is heavily tilted toward high-income buyers."
          />

          {/* Chart 10 — Salary to Home Price */}
          <div style={{ marginBottom: 40 }}>
            <h4 style={{ color: 'var(--navy)', marginBottom: 4, fontSize: 17, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600 }}>
              Top Industry Salaries Compared to Median Home Price
            </h4>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>2024, Routt County</p>
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
                ariaLabel="Grouped bar chart showing 1-salary and 2-salary combined incomes for four industries compared to the $328,452 income required to buy a median-priced home in Routt County."
                caption="Source: YVHA Housing Demand Study 2025; Routt County Economic Development Partnership; MLS; Routt County Assessor"
              />
            )}
          </div>

          {/* Chart 11 — Sales by AMI */}
          <div style={{ marginBottom: 0 }}>
            <h4 style={{ color: 'var(--navy)', marginBottom: 4, fontSize: 17, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600 }}>
              Share of Households and Sales by AMI, Routt County
            </h4>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>2024</p>
            <LoadState loading={amiLoading} error={amiError} />
            {amiChart.length > 0 && (
              <AccessibleBarChart
                data={amiChart}
                keys={['Household Share (%)', 'Sales Share (%)']}
                layout="horizontal"
                xTickFormatter={(v) => `${v}%`}
                tooltipFormatter={(v, name) => [`${v}%`, name]}
                ariaLabel="Horizontal paired bar chart showing household share and sales share by AMI band in Routt County 2024. Lower AMI bands have many more households than their share of home sales reflects."
                caption="Source: YVHA Housing Demand Study 2025; MLS; Moffat County Assessor; CHFA Income Limits; Economic & Planning Systems (page 67)"
              />
            )}
          </div>
        </div>
      </div>

      {/* Housing Cost Burden */}
      <div style={{ backgroundColor: 'white', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', ...sectionGap }}>
        <div style={contentStyle}>
          <SectionHeader
            title="Housing Cost Burden"
            subtitle="New affordable housing can help to reduce cost burden, but sustained action is essential."
          />
          <p style={{ fontSize: 14, color: 'var(--text-muted)', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 4, maxWidth: 640 }}>
            Charts 12 and 13 (30%+ and 50%+ of income on housing for renters and owners) will display
            automatically once the "Housing Cost Burden: Renters" and "Housing Cost Burden: Owners"
            sheets in the Source A spreadsheet are populated with ACS B25070/B25091 data structured
            as: Years | 30%+ Renters | 50%+ Renters | 30%+ Owners | 50%+ Owners with Mortgage | 50%+ Owners no Mortgage.
          </p>
        </div>
      </div>

      {/* Mounting Basic Costs */}
      <div style={sectionGap}>
        <div style={contentStyle}>
          <SectionHeader
            title="Mounting Basic Costs"
            subtitle="In Routt County, the basic cost of living outpaces what many local workers earn."
          />

          {/* Chart 14 */}
          <div style={{ marginBottom: 40 }}>
            <h4 style={{ color: 'var(--navy)', marginBottom: 4, fontSize: 17, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600 }}>
              1 Earner Income vs. Basic Costs
            </h4>
            <LoadState loading={colLoading} error={colError} />
            {col1EarnerChart.length > 0 && (
              <AccessibleBarChart
                data={col1EarnerChart}
                keys={['Annual Salary']}
                yTickFormatter={fmt$}
                tooltipFormatter={(v, name) => [fmt$(v), name]}
                referenceLines={[
                  { value: 58332, label: '$58,332 — 1 Adult Costs', stroke: '#e07b2a', dashed: true },
                  { value: 107299, label: '$107,299 — 1 Adult + 1 Child Costs', stroke: '#c0392b' },
                ]}
                yDomain={[0, 130000]}
                ariaLabel="Bar chart comparing single-earner salaries for three industry workers to the cost of living for one adult ($58,332) and one adult with one child ($107,299) in Routt County."
                caption="Source: Routt County Economic Development Partnership Highest Ranked Industries report 2025; MIT Living Wage Calculator for Routt County 2025"
              />
            )}
          </div>

          {/* Chart 15 */}
          <div style={{ marginBottom: 0 }}>
            <h4 style={{ color: 'var(--navy)', marginBottom: 4, fontSize: 17, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600 }}>
              2 Earners Income vs. Basic Costs
            </h4>
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
                ariaLabel="Bar chart comparing combined two-earner salaries for three industry worker pairs to the cost of living for two adults ($79,780) and two adults with two children ($151,805) in Routt County."
                caption="Source: Routt County Economic Development Partnership Highest Ranked Industries report 2025; MIT Living Wage Calculator for Routt County 2025"
              />
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
