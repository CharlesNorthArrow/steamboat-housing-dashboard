export default function ChartFigure({ ariaLabel, caption, children, srTable }) {
  return (
    <figure style={{ margin: 0 }}>
      <div
        role="img"
        aria-label={ariaLabel}
        style={{ width: '100%' }}
      >
        {children}
      </div>
      {srTable && (
        <div className="sr-only">
          {srTable}
        </div>
      )}
      {caption && (
        <figcaption
          style={{
            fontSize: 14,
            color: 'var(--text-muted)',
            marginTop: 8,
            lineHeight: 1.5,
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
