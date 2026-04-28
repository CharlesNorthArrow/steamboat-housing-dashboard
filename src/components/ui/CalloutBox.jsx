export default function CalloutBox({ children }) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 6,
        padding: '20px 24px',
        flex: '1 1 300px',
        minWidth: 0,
        fontSize: 15,
        lineHeight: 1.6,
        color: 'rgba(255,255,255,0.9)',
      }}
    >
      {children}
    </div>
  )
}
