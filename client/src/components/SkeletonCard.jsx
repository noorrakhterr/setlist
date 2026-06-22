export default function SkeletonCard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 animate-pulse">
      <div className="w-full h-48 bg-zinc-800 rounded-xl mb-4" />
      <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
      <div className="h-3 bg-zinc-800 rounded w-1/2 mb-2" />
      <div className="h-3 bg-zinc-800 rounded w-1/3" />
    </div>
  );
}
