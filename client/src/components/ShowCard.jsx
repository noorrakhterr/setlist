import { Pencil, Trash2, Calendar, Star } from "lucide-react";

export default function ShowCard({ show, onEdit, onDelete, isNotesExpanded, onToggleNotes }) {
  const { year, month, day } = (() => {
    const [y, m, d] = show.show_date.split("-").map(Number);
    return { year: y, month: m, day: d };
  })();
  const date = new Date(year, month - 1, day);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const venueCity =
    show.venue_name && show.city
      ? `${show.venue_name} · ${show.city}`
      : show.venue_name || show.city || null;

  const hasNotes = show.notes && show.notes.trim().length > 0;
  const notesTooLong = hasNotes && show.notes.length > 100;
  const displayedNotes =
    hasNotes && !isNotesExpanded && notesTooLong
      ? show.notes.slice(0, 100) + "..."
      : show.notes;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
      {/* Row 1 */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white font-bold text-lg leading-tight">{show.artist_name}</p>
          <p className={`text-sm mt-0.5 ${venueCity ? "text-zinc-500" : "text-zinc-600"}`}>
            {venueCity ?? "No venue logged"}
          </p>
        </div>
        <div className="flex gap-2 ml-3 shrink-0">
          <button onClick={() => onEdit(show)} aria-label="Edit show">
            <Pencil className="w-4 h-4 text-zinc-500 hover:text-zinc-300 transition-colors" />
          </button>
          <button onClick={() => onDelete(show.id)} aria-label="Delete show">
            <Trash2 className="w-4 h-4 text-zinc-500 hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* Row 2 — date */}
      <div className="flex items-center gap-1.5 mt-2">
        <Calendar className="w-3 h-3 text-zinc-500" />
        <span className="text-zinc-500 text-sm">{formattedDate}</span>
      </div>

      {/* Row 3 — rating */}
      <div className="flex items-center gap-0.5 mt-1">
        {show.rating ? (
          Array.from({ length: 5 }, (_, i) => i + 1).map((i) =>
            i <= show.rating ? (
              <Star key={i} fill="currentColor" className="w-4 h-4 text-amber-400" />
            ) : (
              <Star key={i} fill="none" className="w-4 h-4 text-zinc-700" />
            )
          )
        ) : (
          <span className="text-zinc-600 text-xs">No rating</span>
        )}
      </div>

      {/* Row 4 — notes */}
      {hasNotes && (
        <div className="mt-2">
          <p className="text-zinc-400 text-sm italic">{displayedNotes}</p>
          {notesTooLong && (
            <button
              onClick={() => onToggleNotes(show.id)}
              className="text-zinc-500 hover:text-zinc-300 text-xs mt-1 transition-colors"
            >
              {isNotesExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
