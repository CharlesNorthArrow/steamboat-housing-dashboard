import { useState, useEffect, useRef } from 'react'
import { normalizeStatus, STATUS_CONFIG } from './PipelineStats'

const PAGE_SIZE = 10

const COLUMNS = [
  { key: 'Status', label: 'Status', isRowHeader: false },
  { key: 'Development Name', label: 'Housing Development Name', isRowHeader: true },
  { key: 'Rental or Ownership', label: 'Rental or Ownership', isRowHeader: false },
  { key: 'Unit Mix', label: 'Unit Mix', isRowHeader: false },
  { key: 'Affordability', label: 'Affordability', isRowHeader: false },
  { key: 'Address', label: 'Address', isRowHeader: false },
  { key: 'Context', label: 'Context', isRowHeader: false },
  { key: 'Unit Count', label: 'Unit Count', isRowHeader: false },
]

function StatusBadge({ statusRaw }) {
  const normalized = normalizeStatus(statusRaw)
  const cfg = STATUS_CONFIG[normalized]
  return (
    <span style={{
      display: 'inline-block',
      backgroundColor: cfg?.color || '#666',
      color: '#fff',
      borderRadius: 3,
      padding: '2px 8px',
      fontSize: 11,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {cfg?.label || statusRaw || '—'}
    </span>
  )
}

const cellStyle = {
  padding: '10px 12px',
  borderBottom: '1px solid var(--border)',
  fontSize: 13,
  verticalAlign: 'top',
  fontFamily: "'Source Sans 3', sans-serif",
}

const thStyle = {
  ...cellStyle,
  fontWeight: 700,
  backgroundColor: '#f5f7fa',
  color: 'var(--text-dark)',
  whiteSpace: 'nowrap',
  position: 'sticky',
  top: 0,
  zIndex: 1,
}

export default function PipelineTable({ data, statusFilter, ownerFilter, announceRef }) {
  const [page, setPage] = useState(1)
  const tableRef = useRef(null)

  const filtered = (data || []).filter((row) => {
    const normalized = normalizeStatus(row.Status)
    if (statusFilter && normalized !== statusFilter) return false
    const owner = (row['Rental or Ownership'] || '').trim()
    if (ownerFilter && owner !== ownerFilter) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [statusFilter, ownerFilter])

  useEffect(() => {
    if (!announceRef?.current) return
    announceRef.current.textContent = ''
    const msg = filtered.length === (data || []).length
      ? `Showing all ${filtered.length} developments`
      : `${filtered.length} development${filtered.length !== 1 ? 's' : ''} match your filters`
    requestAnimationFrame(() => {
      if (announceRef.current) announceRef.current.textContent = msg
    })
  }, [filtered.length, data, announceRef])

  function goToPage(p) {
    setPage(p)
    if (tableRef.current) {
      tableRef.current.focus({ preventScroll: false })
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const btnBase = {
    padding: '6px 14px',
    borderRadius: 4,
    border: '1px solid var(--border)',
    backgroundColor: 'white',
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: 13,
    cursor: 'pointer',
    color: 'var(--text-dark)',
  }

  const btnActive = {
    ...btnBase,
    backgroundColor: 'var(--navy)',
    color: 'white',
    borderColor: 'var(--navy)',
    fontWeight: 700,
  }

  return (
    <section aria-label="Housing pipeline developments table" id="pipeline-table" tabIndex={-1} ref={tableRef} style={{ outline: 'none' }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
        Showing {slice.length} of {filtered.length} development{filtered.length !== 1 ? 's' : ''}
        {filtered.length !== (data || []).length ? ` (filtered from ${(data || []).length} total)` : ''}
        {totalPages > 1 ? `, page ${safePage} of ${totalPages}` : ''}
      </p>

      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 4 }}>
        <table
          style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}
          aria-label="Affordable housing pipeline developments"
          aria-rowcount={filtered.length}
        >
          <caption className="sr-only">
            Affordable housing pipeline developments in Steamboat Springs
            {statusFilter ? `, filtered by status: ${STATUS_CONFIG[statusFilter]?.label || statusFilter}` : ''}
            {ownerFilter ? `, filtered by type: ${ownerFilter}` : ''}
          </caption>
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={{ ...thStyle, textAlign: col.key === 'Unit Count' ? 'right' : 'left' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} style={{ ...cellStyle, textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No developments match the current filters.
                </td>
              </tr>
            ) : (
              slice.map((row, i) => (
                <tr
                  key={i}
                  aria-rowindex={(safePage - 1) * PAGE_SIZE + i + 2}
                  style={{ backgroundColor: i % 2 === 1 ? '#fafafa' : 'white' }}
                >
                  {COLUMNS.map((col) => {
                    const val = row[col.key] || row[col.label] || '—'
                    if (col.isRowHeader) {
                      return (
                        <th key={col.key} scope="row" style={{ ...cellStyle, fontWeight: 600, color: 'var(--navy)' }}>
                          {val}
                        </th>
                      )
                    }
                    if (col.key === 'Status') {
                      return (
                        <td key={col.key} style={cellStyle}>
                          <StatusBadge statusRaw={row.Status} />
                        </td>
                      )
                    }
                    return (
                      <td
                        key={col.key}
                        style={{ ...cellStyle, textAlign: col.key === 'Unit Count' ? 'right' : 'left' }}
                      >
                        {val}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav aria-label="Table pagination" style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            style={btnBase}
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage <= 1}
            aria-label="Previous page"
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '…' ? (
                <span key={`ellipsis-${i}`} style={{ padding: '6px 4px', fontSize: 13 }} aria-hidden="true">…</span>
              ) : (
                <button
                  key={p}
                  style={p === safePage ? btnActive : btnBase}
                  onClick={() => goToPage(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === safePage ? 'page' : undefined}
                >
                  {p}
                </button>
              )
            )}

          <button
            style={btnBase}
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage >= totalPages}
            aria-label="Next page"
          >
            Next →
          </button>
        </nav>
      )}
    </section>
  )
}
