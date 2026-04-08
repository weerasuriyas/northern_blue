const SIZE_DATA = [
  { size: '1X', bust: '42–44"', waist: '34–36"', hip: '44–46"', dress: '18–20' },
  { size: '2X', bust: '46–48"', waist: '38–40"', hip: '48–50"', dress: '20–22' },
  { size: '3X', bust: '50–52"', waist: '42–44"', hip: '52–54"', dress: '22–24' },
  { size: '4X', bust: '54–56"', waist: '46–48"', hip: '56–58"', dress: '24–26' },
]

export default function SizeGuideTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-nb-sky/40">
      <table className="w-full text-sm">
        <thead className="bg-nb-sky/20">
          <tr>
            {['Size', 'Bust', 'Waist', 'Hip', 'Dress Size'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-nb-navy text-xs uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SIZE_DATA.map((row, i) => (
            <tr key={row.size} className={i % 2 === 0 ? 'bg-white' : 'bg-nb-bg'}>
              <td className="px-4 py-3 font-semibold text-nb-blue">{row.size}</td>
              <td className="px-4 py-3 text-nb-navy/70">{row.bust}</td>
              <td className="px-4 py-3 text-nb-navy/70">{row.waist}</td>
              <td className="px-4 py-3 text-nb-navy/70">{row.hip}</td>
              <td className="px-4 py-3 text-nb-navy/70">{row.dress}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
