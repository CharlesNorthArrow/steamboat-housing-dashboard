const SOURCE_A = '1ey3NC264FNto7_xKQs07A3bVP4x6RDqoy6QTAYpEWp4'
const SOURCE_B = '1rrB0vHm6gTLivEtrZaYiiNj_l0rcL_IG2Lgi9Xdl9nc'

function sheetUrl(id, sheetName) {
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`
}

export const SHEET_URLS = {
  // Source A — Trail Forward + Affordability data
  age:                    sheetUrl(SOURCE_A, 'Age'),
  income:                 sheetUrl(SOURCE_A, 'Income'),
  employment:             sheetUrl(SOURCE_A, 'Employment'),
  housingCosts:           sheetUrl(SOURCE_A, 'Housing Costs'),
  affordableVMarket:      sheetUrl(SOURCE_A, 'Affordable v Market'),
  salesByAMI:             sheetUrl(SOURCE_A, 'Sales by AMI'),
  salaryToRentBuy:        sheetUrl(SOURCE_A, 'Salary to Rent/Buy'),
  costOfLiving:           sheetUrl(SOURCE_A, 'Cost of Living'),

  // Source B — Pipeline + Policies data
  policyOptions:          sheetUrl(SOURCE_B, 'Affordable Housing Policy Options'),
  housingPipeline:        sheetUrl(SOURCE_B, 'Housing Pipeline (planning approval or more'),
  investmentStats:        sheetUrl(SOURCE_B, 'Investment Stats'),
  lastUpdated:            sheetUrl(SOURCE_B, 'Last Updated'),
}
