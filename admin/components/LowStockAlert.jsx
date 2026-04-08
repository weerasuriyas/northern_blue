const LOW_STOCK_THRESHOLD = 4

export default function LowStockAlert({ inventory }) {
  const lowStock = inventory?.filter(i => i.available <= LOW_STOCK_THRESHOLD) ?? []

  if (lowStock.length === 0) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <h3 className="font-semibold text-amber-800 text-sm mb-3">
        Low Stock ({lowStock.length} variant{lowStock.length !== 1 ? 's' : ''})
      </h3>
      <ul className="space-y-1.5">
        {lowStock.map(item => (
          <li key={item.id} className="flex justify-between text-sm">
            <span className="text-amber-700">{item.productTitle} — {item.variantTitle}</span>
            <span className={`font-semibold ${item.available === 0 ? 'text-red-600' : 'text-amber-600'}`}>
              {item.available === 0 ? 'Out of stock' : `${item.available} left`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
