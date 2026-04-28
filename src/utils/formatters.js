export function formatCurrency(value) {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[$,]/g, '')) : value
  if (isNaN(num)) return value
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num)
}

export function formatPercent(value, decimals = 1) {
  const num = typeof value === 'string' ? parseFloat(value.replace('%', '')) : value
  if (isNaN(num)) return value
  return `${num.toFixed(decimals)}%`
}

export function formatNumber(value) {
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value
  if (isNaN(num)) return value
  return new Intl.NumberFormat('en-US').format(num)
}

export function parseDollar(str) {
  if (!str) return null
  return parseFloat(String(str).replace(/[$,]/g, ''))
}

export function parsePercent(str) {
  if (!str) return null
  return parseFloat(String(str).replace('%', ''))
}
