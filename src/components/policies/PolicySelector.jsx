import { useState, useRef, useEffect } from 'react'
import StatusBadge from './StatusBadge'

export default function PolicySelector({ policies, selectedId, onSelect }) {
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const listRef = useRef(null)

  const statuses = [...new Set((policies || []).map((p) => p.status).filter(Boolean))]

  const filtered = (policies || []).filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  function handleKeyDown(e, id, idx) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = listRef.current?.querySelector(`[data-idx="${idx + 1}"]`)
      next?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = listRef.current?.querySelector(`[data-idx="${idx - 1}"]`)
      prev?.focus()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(id)
    }
  }

  const labelStyle = { fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block', fontFamily: "'Source Sans 3', sans-serif" }
  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    fontSize: 14,
    padding: '7px 10px',
    border: '1px solid var(--border)',
    borderRadius: 4,
    fontFamily: "'Source Sans 3', sans-serif",
    color: 'var(--text-dark)',
    backgroundColor: 'white',
    marginBottom: 12,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Filters */}
      <div style={{ padding: '16px 16px 0', borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="policy-search" style={labelStyle}>Search policies</label>
          <input
            id="policy-search"
            type="search"
            placeholder="Search by name or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
            aria-label="Search policies by name or keyword"
          />
        </div>
        <div style={{ marginBottom: 0 }}>
          <label htmlFor="policy-status-filter" style={labelStyle}>Filter by status</label>
          <select
            id="policy-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...inputStyle, marginBottom: 0 }}
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {(statusFilter || search) && (
          <button
            onClick={() => { setStatusFilter(''); setSearch('') }}
            style={{
              marginTop: 10,
              fontSize: 13,
              color: 'var(--navy)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
              fontFamily: "'Source Sans 3', sans-serif",
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Count */}
      <p style={{ margin: '8px 16px 4px', fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Source Sans 3', sans-serif" }}>
        {filtered.length} of {(policies || []).length} policies
      </p>

      {/* Policy list */}
      <div
        ref={listRef}
        role="listbox"
        aria-label="Policy options"
        style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid var(--border)' }}
      >
        {filtered.length === 0 ? (
          <p style={{ padding: 16, fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No policies match your search.
          </p>
        ) : (
          filtered.map((policy, idx) => {
            const isSelected = policy.id === selectedId
            return (
              <div
                key={policy.id}
                role="option"
                aria-selected={isSelected}
                data-idx={idx}
                tabIndex={0}
                onClick={() => onSelect(policy.id)}
                onKeyDown={(e) => handleKeyDown(e, policy.id, idx)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#eef2f8' : 'white',
                  borderLeft: isSelected ? '3px solid var(--navy)' : '3px solid transparent',
                  outline: 'none',
                }}
                onFocus={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f5f7fa' }}
                onBlur={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'white' }}
              >
                <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, color: 'var(--navy)', fontFamily: "'Source Sans 3', sans-serif", marginBottom: 4, lineHeight: 1.3 }}>
                  {policy.name}
                </div>
                <StatusBadge status={policy.status} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
