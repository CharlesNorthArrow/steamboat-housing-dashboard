import { useState, useRef } from 'react'

export default function PolicySelector({ policies, selectedId, onSelect }) {
  const [statusFilter, setStatusFilter] = useState('')
  const listRef = useRef(null)

  const statuses = [...new Set((policies || []).map((p) => p.status).filter(Boolean))]

  const filtered = (policies || []).filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false
    return true
  })

  function handleKeyDown(e, id, idx) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      listRef.current?.querySelector(`[data-idx="${idx + 1}"]`)?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      listRef.current?.querySelector(`[data-idx="${idx - 1}"]`)?.focus()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(id)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--navy)', fontFamily: "'Source Sans 3', sans-serif" }}>
          Policy Selector
        </h3>
      </div>

      {/* Status filter */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <label htmlFor="policy-status-filter" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block', fontFamily: "'Source Sans 3', sans-serif" }}>
          Filter by Policy Status
        </label>
        <select
          id="policy-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            width: '100%',
            fontSize: 14,
            padding: '7px 10px',
            border: '1px solid var(--border)',
            borderRadius: 4,
            fontFamily: "'Source Sans 3', sans-serif",
            color: 'var(--text-dark)',
            backgroundColor: '#f5f5f5',
          }}
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* List */}
      <div
        ref={listRef}
        role="listbox"
        aria-label="Policy tools"
        style={{ flex: 1, overflowY: 'auto' }}
      >
        {filtered.length === 0 ? (
          <p style={{ padding: 16, fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: "'Source Sans 3', sans-serif" }}>
            No policies match your filter.
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
                  padding: '11px 16px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#eef2f8' : 'white',
                  borderLeft: isSelected ? '3px solid var(--navy)' : '3px solid transparent',
                  outline: 'none',
                }}
                onFocus={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f5f7fa' }}
                onBlur={(e)  => { if (!isSelected) e.currentTarget.style.backgroundColor = 'white' }}
              >
                <div style={{ fontSize: 14, fontWeight: isSelected ? 700 : 500, color: 'var(--navy)', fontFamily: "'Source Sans 3', sans-serif", lineHeight: 1.3 }}>
                  {policy.name}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Reset filter */}
      {statusFilter && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <button
            onClick={() => setStatusFilter('')}
            style={{
              backgroundColor: 'var(--orange)',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '8px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Source Sans 3', sans-serif",
            }}
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  )
}
