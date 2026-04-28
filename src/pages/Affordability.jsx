import { useMemo } from 'react'
import { useGoogleSheet } from '../hooks/useGoogleSheet'
import { SHEET_URLS } from '../utils/sheetUrls'
import { parseDollar, parsePercent } from '../utils/formatters'
import AccessibleBarChart from '../components/charts/AccessibleBarChart'
import AccessibleStackedBar from '../components/charts/AccessibleStackedBar'
import AccessibleLineChart from '../components/charts/AccessibleLineChart'
import SectionHeader from '../components/ui/SectionHeader'
import ReadAloudButton from '../components/ui/ReadAloudButton'

function LoadState({ loading, error }) {
  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading data...</p>
  if (error) return <p style={{ color: '#c0392b', fontSize: 14 }}>Error loading data: {error}</p>
  return null
}

const chartTitle = { color: 'var(--navy)', fontSize: 18, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600, margin: '0 0 4px' }
const chartSubtitle = { fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px' }
const accomp = { fontSize: 17, color: 'var(--text-dark)', lineHeight: 1.6, margin: '0 0 20px' }
const bannerBodyWhite = { margin: '12px 0 0', fontSize: 16, color: 'white', lineHeight: 1.75, fontFamily: "'Source Sans 3', sans-serif" }
const bannerBodyDark = { margin: '0', fontSize: 16, color: 'var(--text-dark)', lineHeight: 1.75, fontFamily: "'Source Sans 3', sans-serif" }
const placeholder = { fontSize: 14, color: 'var(--text-muted)', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 4 }

export default function Affordability() {
  const { data: mktData,         loading: mktLoading,    error: mktError    } = useGoogleSheet(SHEET_URLS.affordableVMarket)
  const { data: amiData,         loading: amiLoading,    error: amiError    } = useGoogleSheet(SHEET_URLS.salesByAMI)
  const { data: salaryData,      loading: salaryLoading, error: salaryError } = useGoogleSheet(SHEET_URLS.salaryToRentBuy)
  const { data: colData,         loading: colLoading,    error: colError    } = useGoogleSheet(SHEET_URLS.costOfLiving)
  const { data: housingCostData, loading: hcLoading,     error: hcError     } = useGoogleSheet(SHEET_URLS.housingCosts)
  const { data: renterBurdenData, loading: rbLoading,   error: rbError     } = useGoogleSheet(SHEET_URLS.renterCostBurden)
  const { data: ownerBurdenData,  loading: obLoading,   error: obError     } = useGoogleSheet(SHEET_URLS.ownerCostBurden)

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
    const getAmiFloor = (name) => {
      const s = (name || '').toLowerCase()
      if (s.includes('less') || s.startsWith('<')) return 0
      const m = s.match(/\d+/)
      return m ? parseInt(m[0]) : 999
    }
    return amiData
      .map((r) => ({
        name: r['AMI Category'],
        'Household Share (%)': parsePercent(r['Households Share (%)']),
        'Sales Share (%)': parsePercent(r['Sales Share (%)']),
      }))
      .filter(d => d.name && !/^\d+$/.test(String(d.name).trim()))
      .sort((a, b) => getAmiFloor(b.name) - getAmiFloor(a.name))
  }, [amiData])

  const housingCostRenterChart = useMemo(() => {
    if (!housingCostData || housingCostData.length === 0) return { data: [], keys: [] }

    const BUCKETS = [
      { label: '<$1,000',       cols: ['Rent_Less than $500', 'Rent_$500 to $999'] },
      { label: '$1,000–$1,499', cols: ['Rent_$1,000 to $1,499'] },
      { label: '$1,500–$1,999', cols: ['Rent_$1,500 to $1,999'] },
      { label: '$2,000–$2,499', cols: ['Rent_$2,000 to $2,499'] },
      { label: '$2,500+',       cols: ['Rent_$2,500 to $2,999', 'Rent_$3,000 or more'] },
    ]

    const data = housingCostData
      .filter(row => row['Years'] && String(row['Years']).trim() !== '')
      .map(row => {
        const entry = { name: String(row['Years']).trim() }
        BUCKETS.forEach(({ label, cols }) => {
          const total = cols.reduce((sum, col) => sum + (parsePercent(row[col]) || 0), 0)
          entry[label] = total / 100
        })
        return entry
      })
      .sort((a, b) => parseInt(a.name) - parseInt(b.name))

    return { data, keys: BUCKETS.map(b => b.label) }
  }, [housingCostData])

  const salaryChart = useMemo(() => {
    if (!salaryData) return []
    const twoSalaryRow = salaryData.find(r => r.Topic === '2 Salaries from Sector')
    if (!twoSalaryRow) return []
    const SKIP = new Set([
      'Topic',
      'Year',
      'Income Required to Buy a Median Prices Home',
      'Income Required to Buy a Median Priced Home',
    ])
    return Object.entries(twoSalaryRow)
      .filter(([k]) => !SKIP.has(k.trim()) && k.trim() !== '')
      .map(([k, v]) => ({
        name: k.trim(),
        '2 Salaries (Combined)': parseDollar(v) || 0,
      }))
      .filter(d => d['2 Salaries (Combined)'] > 0)
  }, [salaryData])

  const incomeToByRef = useMemo(() => {
    if (!salaryData) return null
    const row = salaryData.find((r) => r.Topic === '2 Salaries from Sector')
    return parseDollar(row?.['Income Required to Buy a Median Prices Home'] || '328452')
  }, [salaryData])

  const burden30Chart = useMemo(() => {
    if (!renterBurdenData || !ownerBurdenData) return []

    const renterByYear = {}
    renterBurdenData
      .filter(row => String(row['Years'] || '').trim())
      .forEach(row => {
        const year = String(row['Years']).trim()
        const total = parseFloat(row['Estimate!!Total:']) || 0
        const over30 = ['30.0 to 34.9 percent', '35.0 to 39.9 percent', '40.0 to 49.9 percent', '50.0 percent or more']
          .reduce((s, k) => s + (parseFloat(row[k]) || 0), 0)
        if (total > 0) renterByYear[year] = parseFloat(((over30 / total) * 100).toFixed(1))
      })

    const withMortgageByYear = {}
    const noMortgageByYear = {}
    ownerBurdenData
      .filter(row => String(row['Years'] || '').trim())
      .forEach(row => {
        const year = String(row['Years']).trim()
        const mTotal = parseFloat(row['mortgage:']) || 0
        const m30 = ['mortgage:!!30.0 to 34.9 percent', 'mortgage:!!35.0 to 39.9 percent', 'mortgage:!!40.0 to 49.9 percent', 'mortgage:!!50.0 percent or more']
          .reduce((s, k) => s + (parseFloat(row[k]) || 0), 0)
        if (mTotal > 0) withMortgageByYear[year] = parseFloat(((m30 / mTotal) * 100).toFixed(1))
        const nmTotal = parseFloat(row['Nomortgage:']) || 0
        const nm30 = ['Nomortgage:!!30.0 to 34.9 percent', 'Nomortgage:!!35.0 to 39.9 percent', 'Nomortgage:!!40.0 to 49.9 percent', 'Nomortgage:!!50.0 percent or more']
          .reduce((s, k) => s + (parseFloat(row[k]) || 0), 0)
        if (nmTotal > 0) noMortgageByYear[year] = parseFloat(((nm30 / nmTotal) * 100).toFixed(1))
      })

    const years = [...new Set([...Object.keys(renterByYear), ...Object.keys(withMortgageByYear), ...Object.keys(noMortgageByYear)])]
      .sort((a, b) => parseInt(a) - parseInt(b))
    return years.map(year => ({
      name: year,
      'Renters': renterByYear[year] ?? null,
      'Owners w/ Mortgage': withMortgageByYear[year] ?? null,
      'Owners w/o Mortgage': noMortgageByYear[year] ?? null,
    }))
  }, [renterBurdenData, ownerBurdenData])

  const burden50Chart = useMemo(() => {
    if (!renterBurdenData || !ownerBurdenData) return []

    const renterByYear = {}
    renterBurdenData
      .filter(row => String(row['Years'] || '').trim())
      .forEach(row => {
        const year = String(row['Years']).trim()
        const total = parseFloat(row['Estimate!!Total:']) || 0
        const over50 = parseFloat(row['50.0 percent or more']) || 0
        if (total > 0) renterByYear[year] = parseFloat(((over50 / total) * 100).toFixed(1))
      })

    const withMortgageByYear = {}
    const noMortgageByYear = {}
    ownerBurdenData
      .filter(row => String(row['Years'] || '').trim())
      .forEach(row => {
        const year = String(row['Years']).trim()
        const mTotal = parseFloat(row['mortgage:']) || 0
        const m50 = parseFloat(row['mortgage:!!50.0 percent or more']) || 0
        if (mTotal > 0) withMortgageByYear[year] = parseFloat(((m50 / mTotal) * 100).toFixed(1))
        const nmTotal = parseFloat(row['Nomortgage:']) || 0
        const nm50 = parseFloat(row['Nomortgage:!!50.0 percent or more']) || 0
        if (nmTotal > 0) noMortgageByYear[year] = parseFloat(((nm50 / nmTotal) * 100).toFixed(1))
      })

    const years = [...new Set([...Object.keys(renterByYear), ...Object.keys(withMortgageByYear), ...Object.keys(noMortgageByYear)])]
      .sort((a, b) => parseInt(a) - parseInt(b))
    return years.map(year => ({
      name: year,
      'Renters': renterByYear[year] ?? null,
      'Owners w/ Mortgage': withMortgageByYear[year] ?? null,
      'Owners w/o Mortgage': noMortgageByYear[year] ?? null,
    }))
  }, [renterBurdenData, ownerBurdenData])

  const col1EarnerChart = useMemo(() => {
    if (!colData) return []
    const row = colData.find((r) => r.Earners === '1 Earner')
    if (!row) return []
    return [
      { name: 'Educational Services', 'Annual Salary': parseDollar(row['Educational Services Professional']) },
      { name: 'Accommodation & Food', 'Annual Salary': parseDollar(row['Accomodation and Food Service Worker']) },
      { name: 'Health Care',          'Annual Salary': parseDollar(row['Health Care and Social Assistance Professional']) },
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
      { name: 'Health Care',          'Combined Salaries': (parseDollar(baseRow['Health Care and Social Assistance Professional']) || 0) * 2 },
    ]
  }, [colData])

  const fmt$ = (v) => v != null ? `$${Number(v).toLocaleString()}` : '—'

  const SCRIPTS = {
    intro: [
      { text: "Rising Costs.", readId: "af-intro-title" },
      { text: "Wages are not keeping up with Steamboat Springs' mounting costs of living.", readId: "af-intro-sub" },
      { text: "Steamboat Springs has become dramatically more expensive for both renters and homebuyers, creating a barrier to new residents moving into the city and to current residents who want to stay.", readId: "af-intro-p1" },
      { text: "Without bold action, the essential workforce — such as teachers, healthcare workers, and service staff — will continue to be priced out, weakening the community for everyone.", readId: "af-intro-p2" },
    ],

    risingRent: [
      { text: "Rising Rent. Affordable rents are disappearing, and renters are facing severe financial strain.", readId: "af-rent-header" },
      { text: "Chart one: Housing Costs for Renters. Renters paying under $1,500 a month fell from 64% to 20% of all renter households, while those paying $1,500 or more surged from 36% to 80%, and renters paying over $2,500 jumped from 7% to 28%." },
      { text: "Chart two: Affordable versus Market Rent by Unit Size. Affordable rents range from $1,100 to $1,900 depending on unit size, while market rents range from $2,400 to $4,000 — a gap of $1,300 to $2,100 per month that renters must cover to secure housing." },
    ],

    homePrices: [
      { text: "Rocketing Home Prices. Steamboat Springs' for-sale housing market is heavily tilted toward high-income buyers.", readId: "af-home-header" },
      { text: "Chart three: Top Industry Salaries Compared to Median Home Price. Combined salaries from two workers in the same sector range from $67,320 for Educational Services to $142,924 for Health Care, yet all fall far short of the $328,451 income needed to buy a median-priced home, a gap of $185,527 to $261,131." },
      { text: "Chart four: Share of Households and Sales by Area Median Income in Routt County. Households earning over 200% of AMI make up 26% of all households but account for 71% of home sales, while households earning below 80% of AMI make up 44% of all households but account for just 2% of sales." },
    ],

    burden: [
      { text: "Housing Cost Burden. New affordable housing can help to reduce cost burden, but sustained action is essential.", readId: "af-burden-header" },
      { text: "Chart five: Paying 30% or More of Income on Housing. Renters are most cost-burdened, with 49% spending 30% or more of income on housing in 2020 to 2024, up from 37% in 2006 to 2010. Owners with a mortgage improved slightly from 45% to 37%, while owners without a mortgage rose from 10% to 18%." },
      { text: "Chart six: Paying 50% or More of Income on Housing. Nearly 30% of renters spend 50% or more of their income on housing in 2020 to 2024, the highest of any group. Owners with a mortgage held steady around 16 to 20%, while owners without a mortgage surged from 2% to a peak of 17% in 2016 to 2020 before falling back to 9%." },
    ],

    basicCosts: [
      { text: "Mounting Basic Costs. In Routt County, the basic cost of living outpaces what many local workers earn.", readId: "af-basic-header" },
      { text: "Chart seven: 1 Earner Income versus Basic Costs. Single earner salaries range from $33,660 for Educational Services to $71,462 for Health Care. Only Health Care clears the basic cost threshold for a single adult at $58,332, and none come close to the $107,299 needed for a single parent." },
      { text: "Chart eight: 2 Earners Income versus Basic Costs. Combined salaries for two earners range from $67,320 for Educational Services to $142,924 for Health Care. Only Health Care clears the $79,780 threshold for two adults with no children, and none reach the $151,805 needed for a family with two children." },
    ],
  }

  return (
    <div id="panel-affordability" role="tabpanel" aria-labelledby="tab-affordability" tabIndex={-1}>

      {/* ── Rising Costs — intro banner (light-bg, orange title) ── */}
      <div className="banner-pad" style={{ backgroundColor: 'var(--light-bg)' }}>
        <h2 data-read-id="af-intro-title" style={{ margin: '0 0 10px', fontSize: 40, fontWeight: 700, color: 'var(--orange)', fontFamily: "'Source Sans 3', sans-serif" }}>
          Rising Costs
        </h2>
        <p data-read-id="af-intro-sub" style={{ margin: '0 0 16px', fontSize: 17, color: 'var(--text-muted)', fontFamily: "'Source Sans 3', sans-serif" }}>
          Wages are not keeping up with Steamboat Springs' mounting costs of living.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p data-read-id="af-intro-p1" style={bannerBodyDark}>
            Steamboat Springs has become dramatically more expensive for both renters and homebuyers,
            creating a barrier to new residents moving into the city and to current residents who want to stay.
          </p>
          <p data-read-id="af-intro-p2" style={bannerBodyDark}>
            Without bold action, the essential workforce — such as teachers, healthcare workers, and
            service staff — will continue to be priced out, weakening the community for everyone.
          </p>
        </div>
        <div style={{ marginTop: 20 }}>
          <ReadAloudButton segments={SCRIPTS.intro} dark={false} />
        </div>
      </div>

      {/* ── Rising Rent — section banner (navy) ── */}
      <div className="banner-pad" style={{ backgroundColor: 'var(--navy)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div data-read-id="af-rent-header">
            <SectionHeader dark
              title="Rising Rent"
              subtitle="Affordable rents are disappearing, and renters are facing severe financial strain."
            />
          </div>
          <ReadAloudButton segments={SCRIPTS.risingRent} />
        </div>
      </div>

      {/* ── Charts 1 + 2 ── */}
      <div className="section-pad" style={{ backgroundColor: 'white' }}>
        <div className="chart-grid">

          {/* Chart 1 — Housing Costs, Renters */}
          <div>
            <h3 style={chartTitle}>Housing Costs — Renters</h3>
            <p style={chartSubtitle}>2006–2024, Steamboat Springs, ACS 5-year estimates</p>
            <p style={accomp}>
              Renters paying under $1,500 a month fell from 64% to 20% of all renter households,
              while those paying $1,500 or more surged from 36% to 80% — and renters paying over
              $2,500 jumped from 7% to 28%.
            </p>
            <LoadState loading={hcLoading} error={hcError} />
            {housingCostRenterChart.data.length > 0 && (
              <AccessibleStackedBar
                data={housingCostRenterChart.data}
                keys={housingCostRenterChart.keys}
                ariaLabel="Stacked bar chart showing the distribution of renter housing costs by cost bracket from 2006 to 2024 in Steamboat Springs."
                caption="Source: ACS 5-Year Estimates, CP04 Comparative Housing Characteristics"
              />
            )}
          </div>

          {/* Chart 2 — Affordable vs. Market Rent */}
          <div>
            <h3 style={chartTitle}>Affordable vs. Market Rent by Unit Size</h3>
            <p style={chartSubtitle}>2024, Steamboat Springs</p>
            <p style={accomp}>
              Affordable rents range from $1,100 to $1,900 depending on unit size, while market
              rents range from $2,400 to $4,000 — a gap of $1,300 to $2,100 per month that renters
              must cover to secure housing.
            </p>
            <LoadState loading={mktLoading} error={mktError} />
            {affordableVMarketChart.length > 0 && (
              <AccessibleBarChart
                data={affordableVMarketChart}
                keys={['Affordable Rent', 'Market Rent', 'Market Premium']}
                yTickFormatter={fmt$}
                tooltipFormatter={(v, name) => [fmt$(v), name]}
                yDomain={[0, 4500]}
                ariaLabel="Grouped bar chart comparing affordable rent, market rent, and the market premium gap by unit size in 2024."
                caption="Sources: YVHA Housing Demand Study, 2025, Page 71 — CoStar; Property websites; Zillow; YVHA; CHFA; Economic and Planning Systems"
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Rocketing Home Prices — section banner (navy) ── */}
      <div className="banner-pad" style={{ backgroundColor: 'var(--navy)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div data-read-id="af-home-header">
            <SectionHeader dark
              title="Rocketing Home Prices"
              subtitle="Steamboat Springs' for-sale housing market is heavily tilted toward high-income buyers."
            />
          </div>
          <ReadAloudButton segments={SCRIPTS.homePrices} />
        </div>
      </div>

      {/* ── Charts 3 + 4 ── */}
      <div className="section-pad" style={{ backgroundColor: 'white' }}>
        <div className="chart-grid">

          {/* Chart 3 — Salary vs. Home Price */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={chartTitle}>Top Industry Salaries Compared to Median Home Price</h3>
            <p style={chartSubtitle}>2024, Routt County</p>
            <p style={accomp}>
              Combined salaries from two workers in the same sector range from $67,320 (Educational
              Services) to $142,924 (Health Care), yet all fall far short of the $328,451 income
              needed to buy a median-priced home — a gap of $185,527 to $261,131.
            </p>
            <LoadState loading={salaryLoading} error={salaryError} />
            <div style={{ flex: 1 }} />
            {salaryChart.length > 0 && (
              <AccessibleBarChart
                data={salaryChart}
                keys={['2 Salaries (Combined)']}
                yTickFormatter={fmt$}
                tooltipFormatter={(v, name) => [fmt$(v), name]}
                referenceLines={incomeToByRef ? [
                  { value: incomeToByRef, label: `${fmt$(incomeToByRef)} — Income Required to Buy Median Home`, stroke: '#c0392b' },
                ] : []}
                yDomain={[0, 380000]}
                chartHeight={492}
                colorEachBar
                ariaLabel="Bar chart showing combined two-salary incomes across all industry sectors compared to the income required to buy a median-priced home in Routt County."
                caption={`Sources: Select Salaries from Routt County Economic Development Partnership’s “Highest Ranked Industries” report; Income data from YVHA Housing Demand Study, 2025, Page 60 — MLS; Routt County Assessor; Economic and Planning Systems`}
              />
            )}
          </div>

          {/* Chart 4 — Sales by AMI */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={chartTitle}>Share of Households and Sales by AMI, Routt County</h3>
            <p style={chartSubtitle}>2024, Routt County</p>
            <p style={accomp}>
              Households earning over 200% AMI make up 26% of all households but account for 71%
              of home sales, while households earning below 80% AMI make up 44% of all households
              but account for just 2% of sales.
            </p>
            <LoadState loading={amiLoading} error={amiError} />
            <div style={{ flex: 1 }} />
            {amiChart.length > 0 && (
              <AccessibleBarChart
                data={amiChart}
                keys={['Household Share (%)', 'Sales Share (%)']}
                layout="horizontal"
                xTickFormatter={(v) => `${v}%`}
                yTickFormatter={(v) => `${v}%`}
                tooltipFormatter={(v, name) => [`${v}%`, name]}
                yDomain={[0, 80]}
                chartHeight={492}
                ariaLabel="Horizontal paired bar chart showing household share and sales share by AMI band in Routt County 2024."
                caption="Source: YVHA Housing Demand Study, 2025, Page 67 — MLS; Moffat County Assessor; CHFA Income Limits; Economic and Planning Systems"
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Housing Cost Burden — section banner (navy) ── */}
      <div className="banner-pad" style={{ backgroundColor: 'var(--navy)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div data-read-id="af-burden-header">
            <SectionHeader dark
              title="Housing Cost Burden"
              subtitle="New affordable housing can help to reduce cost burden, but sustained action is essential."
            />
          </div>
          <ReadAloudButton segments={SCRIPTS.burden} />
        </div>
      </div>

      {/* ── Charts 5 + 6 ── */}
      <div className="section-pad" style={{ backgroundColor: 'white' }}>
        <div className="chart-grid">

          {/* Chart 5 — 30%+ burden */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={chartTitle}>Paying 30% or More of Income on Housing</h3>
            <p style={chartSubtitle}>2006–2024, Steamboat Springs, ACS 5-year estimates</p>
            <p style={accomp}>
              Renters are most cost-burdened, with 49% spending 30% or more of income on housing
              in 2020–2024, up from 37% in 2006–2010. Owners with a mortgage have improved slightly
              from 45% to 37%, while owners without a mortgage rose from 10% to 18%.
            </p>
            <LoadState loading={rbLoading || obLoading} error={rbError || obError} />
            <div style={{ flex: 1 }} />
            {burden30Chart.length > 0 && (
              <AccessibleLineChart
                data={burden30Chart}
                keys={['Renters', 'Owners w/ Mortgage', 'Owners w/o Mortgage']}
                yTickFormatter={(v) => `${v}%`}
                tooltipFormatter={(v, name) => [`${v}%`, name]}
                yDomain={[0, 60]}
                chartHeight={280}
                ariaLabel="Line chart showing the share of renters, owners with a mortgage, and owners without a mortgage paying 30% or more of income on housing from 2006 to 2024."
                caption="Sources: ACS Data — B25070: Gross Rent as a Percentage of Household Income in the Past 12 Months; B25091: Mortgage Status by Selected Monthly Owner Costs as a Percentage of Household Income in the Past 12 Months"
              />
            )}
          </div>

          {/* Chart 6 — 50%+ burden */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={chartTitle}>Paying 50% or More of Income on Housing</h3>
            <p style={chartSubtitle}>2006–2024, Steamboat Springs, ACS 5-year estimates</p>
            <p style={accomp}>
              Nearly 30% of renters spend 50% or more of their income on housing in 2020–2024 —
              the highest of any group. Owners with a mortgage held steady around 16–20%, while
              owners without a mortgage surged from 2% to a peak of 17% in 2016–2020 before
              falling back to 9%.
            </p>
            <LoadState loading={rbLoading || obLoading} error={rbError || obError} />
            <div style={{ flex: 1 }} />
            {burden50Chart.length > 0 && (
              <AccessibleLineChart
                data={burden50Chart}
                keys={['Renters', 'Owners w/ Mortgage', 'Owners w/o Mortgage']}
                yTickFormatter={(v) => `${v}%`}
                tooltipFormatter={(v, name) => [`${v}%`, name]}
                yDomain={[0, 60]}
                chartHeight={280}
                ariaLabel="Line chart showing the share of renters, owners with a mortgage, and owners without a mortgage paying 50% or more of income on housing from 2006 to 2024."
                caption="Sources: ACS Data — B25070: Gross Rent as a Percentage of Household Income in the Past 12 Months; B25091: Mortgage Status by Selected Monthly Owner Costs as a Percentage of Household Income in the Past 12 Months"
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Mounting Basic Costs — section banner (navy) ── */}
      <div className="banner-pad" style={{ backgroundColor: 'var(--navy)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div data-read-id="af-basic-header">
            <SectionHeader dark
              title="Mounting Basic Costs"
              subtitle="In Routt County, the basic cost of living outpaces what many local workers earn."
            />
          </div>
          <ReadAloudButton segments={SCRIPTS.basicCosts} />
        </div>
      </div>

      {/* ── Charts 7 + 8 ── */}
      <div className="section-pad" style={{ backgroundColor: 'white', paddingBottom: 64 }}>
        <div className="chart-grid">

          {/* Chart 7 — 1 Earner */}
          <div>
            <h3 style={chartTitle}>1 Earner Income vs. Basic Costs</h3>
            <p style={chartSubtitle}>Routt County</p>
            <p style={accomp}>
              Single earner salaries range from $33,660 (Educational Services) to $71,462 (Health
              Care). Only the Health Care salary clears the basic cost threshold for a single adult
              ($58,332), and none come close to the $107,299 needed for a single parent.
            </p>
            <LoadState loading={colLoading} error={colError} />
            {col1EarnerChart.length > 0 && (
              <AccessibleBarChart
                data={col1EarnerChart}
                keys={['Annual Salary']}
                yTickFormatter={fmt$}
                tooltipFormatter={(v, name) => [fmt$(v), name]}
                referenceLines={[
                  { value: 58332,  label: 'Living costs: 1 adult ($58,332)',              stroke: '#e07b2a', dashed: true },
                  { value: 107299, label: 'Living costs: 1 adult + 1 child ($107,299)',   stroke: '#c0392b' },
                ]}
                yDomain={[0, 130000]}
                colorEachBar
                ariaLabel="Bar chart comparing single-earner salaries for three industries to basic cost-of-living thresholds in Routt County."
                caption={`Sources: Select Salaries from Routt County Economic Development Partnership's "Highest Ranked Industries" report; 2025 Cost of Living from MIT Living Wage Calculator for Routt County, 2025`}
              />
            )}
          </div>

          {/* Chart 8 — 2 Earners */}
          <div>
            <h3 style={chartTitle}>2 Earners Income vs. Basic Costs</h3>
            <p style={chartSubtitle}>Routt County</p>
            <p style={accomp}>
              Combined salaries for two earners range from $67,320 (Educational Services) to
              $142,924 (Health Care). Only Health Care clears the $79,780 threshold for two adults
              with no children, and none reach the $151,805 needed for a family with two children.
            </p>
            <LoadState loading={colLoading} error={colError} />
            {col2EarnerChart.length > 0 && (
              <AccessibleBarChart
                data={col2EarnerChart}
                keys={['Combined Salaries']}
                yTickFormatter={fmt$}
                tooltipFormatter={(v, name) => [fmt$(v), name]}
                referenceLines={[
                  { value: 79780,  label: 'Living costs: 2 adults ($79,780)',                  stroke: '#e07b2a', dashed: true },
                  { value: 151805, label: 'Living costs: 2 adults + 2 children ($151,805)',    stroke: '#c0392b' },
                ]}
                yDomain={[0, 180000]}
                colorEachBar
                ariaLabel="Bar chart comparing combined two-earner salaries for three industries to basic cost-of-living thresholds in Routt County."
                caption={`Sources: Select Salaries from Routt County Economic Development Partnership's "Highest Ranked Industries" report; 2025 Cost of Living from MIT Living Wage Calculator for Routt County, 2025`}
              />
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
