export default function OrderTimeline({ timeline }) {
  if (!timeline?.length) return null

  return (
    <div className="space-y-3">
      {timeline.map((event, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-nb-blue mt-1 flex-shrink-0" />
            {i < timeline.length - 1 && (
              <div className="w-px flex-1 bg-nb-sky/40 mt-1" />
            )}
          </div>
          <div className="pb-4">
            <p className="text-sm text-nb-navy">{event.message}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(event.at).toLocaleString('en-CA', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
