const STYLES = {
  fulfilled:   'bg-green-50 text-green-700 border-green-200',
  unfulfilled: 'bg-amber-50 text-amber-700 border-amber-200',
  pending:     'bg-blue-50 text-blue-700 border-blue-200',
  cancelled:   'bg-red-50 text-red-600 border-red-200',
  paid:        'bg-green-50 text-green-700 border-green-200',
  refunded:    'bg-red-50 text-red-600 border-red-200',
  active:      'bg-green-50 text-green-700 border-green-200',
  draft:       'bg-gray-100 text-gray-600 border-gray-200',
}

export default function StatusBadge({ status }) {
  const style = STYLES[status?.toLowerCase()] ?? 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${style}`}>
      {status}
    </span>
  )
}
