# Steamboat Springs Affordable Housing Dashboard

A production-grade, fully VPAT-compliant React + Vite dashboard for the City of Steamboat Springs' Affordable Housing program. Replaces a Google Data Studio dashboard. No backend — all data from two public Google Sheets.

## Data Sources

- **Source A** — Trail Forward + Affordability data  
  Sheet ID: `1ey3NC264FNto7_xKQs07A3bVP4x6RDqoy6QTAYpEWp4`
- **Source B** — Pipeline + Policies data  
  Sheet ID: `1rrB0vHm6gTLivEtrZaYiiNj_l0rcL_IG2Lgi9Xdl9nc`

All sheets fetched via: `https://docs.google.com/spreadsheets/d/{id}/gviz/tq?tqx=out:csv&sheet={SheetName}`  
No GIDs required — sheet names are used directly.

## Stack

- React 19 + Vite 8
- Tailwind CSS v4 (via @tailwindcss/vite plugin)
- Recharts — all charts (AccessibleBarChart, AccessibleStackedBar, AccessibleLineChart)
- React Leaflet + Leaflet — Pipeline map
- papaparse — CSV parsing in useGoogleSheet hook

## Brand

- **Colors:** Navy `#1B3A5C`, Orange `#E07B2A`, Gold `#F5A623`
- **Fonts:** Source Serif 4 (headings), Source Sans 3 (body) — loaded from Google Fonts in index.html
- **Font minimum:** 14px everywhere

## Key Patterns

- `src/hooks/useGoogleSheet.js` — fetch + parse + 3-retry hook
- `src/utils/sheetUrls.js` — all sheet URL constants
- `src/utils/formatters.js` — parseDollar, parsePercent, format helpers
- `src/components/charts/PatternDefs.jsx` — SVG pattern fills for colorblind-safe bars
- `src/components/charts/ChartFigure.jsx` — `<figure>` wrapper with sr-only data table slot
- All chart components include sr-only `<table>` for VPAT compliance
- Focus rings: `outline: 3px solid var(--navy); outline-offset: 2px` (via :focus-visible in index.css)

## VPAT Requirements (non-negotiable)

- Every chart has an `ariaLabel` and a screen-reader-only data table
- Map has `aria-label` and a skip link to the table
- Tab navigation uses `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`
- Filter changes announce results via `aria-live="polite"` region
- All `<select>` and `<input>` elements have associated `<label>` elements
- `prefers-reduced-motion` suppresses all transitions/animations

## Tabs

1. **Trail Forward** — Demographics: income (Chart 1), age (Chart 2), high-income trends (Chart 3), median age (Chart 5), 25-44 share (Chart 6), employment (Chart 7)
2. **Affordability** — Rising Rent (Charts 8–9), Rocketing Home Prices (Charts 10–11), Housing Cost Burden (Charts 12–13 placeholder), Mounting Basic Costs (Charts 14–15)
3. **Pipeline** — Dark stats header, React Leaflet map, filterable + paginated table
4. **Policies** — KPI cards from Investment Stats, policy explorer with left selector + right detail panel

## Data Notes

- Charts 8, 12, 13 show placeholder text — the corresponding sheets in Source A contain the data dictionary, not burden data. Client must populate "Housing Cost Burden: Renters" and "Housing Cost Burden: Owners" sheets with ACS B25070/B25091 data.
- Pipeline map requires Latitude/Longitude columns in the "Housing Pipeline" sheet to display markers. Currently shows empty-state message if coordinates are absent.
- Investment Stats sheet (Source B) expects rows with Label/Value columns for the 3 KPI cards.

## Deployment

- Deploy to Vercel
- No environment variables required — all data is public Google Sheets
