import { useState } from "react";
import { Music, Headphones, Calendar } from "lucide-react";

function formatDate(date) {
  if (!date) return "Date TBD";

  if (date.includes("T")) {
    const d = new Date(date);
    const dayStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${dayStr} · ${timeStr}`;
  }

  const [year, month, day] = date.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const dayStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return `${dayStr} · Time TBD`;
}

function ListenScoreBadge({ listenScore }) {
  const colorClass =
    listenScore >= 80
      ? "text-emerald-400"
      : listenScore >= 50
      ? "text-yellow-400"
      : "text-zinc-400";

  return (
    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm border border-white/10 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
      <Headphones className={`w-3 h-3 ${colorClass}`} />
      <span className={colorClass}>{listenScore} match</span>
    </div>
  );
}

export default function ConcertCard({
  name,
  artistName,
  artistRank,
  listenScore,
  date,
  venue,
  city,
  state,
  url,
  imageUrl,
  minPrice,
  maxPrice,
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer group">
      <div className="h-48 w-full relative overflow-hidden">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={artistName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
            <Music className="w-8 h-8 text-zinc-600" />
          </div>
        )}
        <ListenScoreBadge listenScore={listenScore} />
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-white font-bold text-lg leading-tight">{artistName}</p>
          <p className="text-zinc-500 text-xs">Your #{artistRank} most listened artist</p>
        </div>

        <div>
          <p className="text-zinc-300 text-sm font-medium">{venue}</p>
          <p className="text-zinc-500 text-xs">
            {city}{state ? `, ${state}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
          <Calendar className="w-3 h-3 shrink-0" />
          <span>{formatDate(date)}</span>
        </div>

        <div className="flex items-center justify-between">
          {minPrice != null ? (
            <span className="text-zinc-400 text-sm">From ${minPrice}</span>
          ) : (
            <span className="text-zinc-600 text-sm">Price TBD</span>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Get Tickets
          </a>
        </div>
      </div>
    </div>
  );
}
