export default function StatsCard({ label, value, subtext, accent = false }) {
  return (
    <div className={`bg-zinc-900 border rounded-2xl p-6 transition-all
      ${accent ? 'border-red-500/30' : 'border-zinc-800'}`}>
      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">
        {label}
      </p>
      <p className={`text-3xl font-bold mb-2
        ${accent ? 'text-red-400' : 'text-white'}`}>
        {value}
      </p>
      {subtext && (
        <p className="text-zinc-600 text-xs leading-relaxed">{subtext}</p>
      )}
    </div>
  );
}