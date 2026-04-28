export default function PipelineFilters({ statusFilter, setStatusFilter, ownerFilter, setOwnerFilter, announceRef }) {
  const labelStyle = { fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, display: 'block' }
  const selectStyle = {
    fontSize: 14,
    padding: '6px 10px',
    border: '1px solid var(--border)',
    borderRadius: 4,
    backgroundColor: 'white',
    color: 'var(--text-dark)',
    minWidth: 180,
    fontFamily: "'Source Sans 3', sans-serif",
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12, alignItems: 'flex-end' }}>
      <div>
        <label htmlFor="filter-status" style={labelStyle}>Filter by Status</label>
        <select
          id="filter-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Statuses</option>
          <option value="Constructed and open">Constructed and Open</option>
          <option value="Under construction">Under Construction</option>
          <option value="Planned">Planned</option>
          <option value="In discussion">In Discussion</option>
        </select>
      </div>
      <div>
        <label htmlFor="filter-owner" style={labelStyle}>Filter by Rental or Ownership</label>
        <select
          id="filter-owner"
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Types</option>
          <option value="Rental">Rental</option>
          <option value="Ownership">Ownership</option>
          <option value="Mixed">Mixed</option>
        </select>
      </div>
      <div ref={announceRef} aria-live="polite" aria-atomic="true" className="sr-only" />
    </div>
  )
}
