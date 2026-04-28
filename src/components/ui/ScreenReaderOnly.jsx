export default function ScreenReaderOnly({ children, as: Tag = 'span' }) {
  return <Tag className="sr-only">{children}</Tag>
}
