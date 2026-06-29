import { useState, useEffect } from "react";
import { X, Star } from "lucide-react";

export default function AddShowModal({ isOpen, onClose, onSubmit, editingShow }) {
  const [artistName, setArtistName] = useState("");
  const [venueName, setVenueName] = useState("");
  const [city, setCity] = useState("");
  const [showDate, setShowDate] = useState("");
  const [rating, setRating] = useState(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editingShow) {
        setArtistName(editingShow.artist_name ?? "");
        setVenueName(editingShow.venue_name ?? "");
        setCity(editingShow.city ?? "");
        setShowDate(editingShow.show_date ?? "");
        setRating(editingShow.rating ?? null);
        setNotes(editingShow.notes ?? "");
      } else {
        setArtistName("");
        setVenueName("");
        setCity("");
        setShowDate("");
        setRating(null);
        setNotes("");
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, editingShow]);

  if (!isOpen) return null;

  const isEditMode = editingShow !== null;

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (!artistName.trim()) newErrors.artistName = "Artist name is required";
    if (!showDate) newErrors.showDate = "Date is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsSubmitting(true);
    await onSubmit({ artistName, venueName, city, showDate, rating, notes });
    setIsSubmitting(false);
  }

  const inputClass =
    "w-full bg-zinc-800 border border-zinc-700 focus:border-emerald-500 text-white placeholder-zinc-500 rounded-xl px-4 py-3 focus:outline-none transition-colors text-sm";

  const ratingLabels = ["1 star", "2 stars", "3 stars", "4 stars", "5 stars"];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <h2 className="text-white font-bold text-xl">
          {isEditMode ? "Edit Show" : "Log a Show"}
        </h2>
        <p className="text-zinc-500 text-sm mt-1">Add it to your concert history</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Artist */}
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-1">Artist</label>
            <input
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="Artist name"
              className={inputClass}
            />
            {errors.artistName && (
              <p className="text-red-400 text-xs mt-1">{errors.artistName}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={showDate}
              onChange={(e) => setShowDate(e.target.value)}
              className={inputClass}
            />
            {errors.showDate && (
              <p className="text-red-400 text-xs mt-1">{errors.showDate}</p>
            )}
          </div>

          {/* Venue */}
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-1">Venue</label>
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="Venue name"
              className={inputClass}
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className={inputClass}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-1">Rating</label>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 5 }, (_, i) => i + 1).map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(rating === i ? null : i)}
                  aria-label={ratingLabels[i - 1]}
                >
                  {i <= (rating ?? 0) ? (
                    <Star
                      fill="currentColor"
                      className="w-6 h-6 text-amber-400 cursor-pointer hover:scale-110 transition-transform"
                    />
                  ) : (
                    <Star
                      fill="none"
                      className="w-6 h-6 text-zinc-600 cursor-pointer hover:text-amber-400 hover:scale-110 transition-transform"
                    />
                  )}
                </button>
              ))}
            </div>
            <p className="text-zinc-500 text-xs mt-1">
              {rating ? `${rating} star${rating > 1 ? "s" : ""}` : "No rating"}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="How was it? Any memories worth keeping?"
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-xl transition-colors mt-6"
          >
            {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Log Show"}
          </button>

          {/* Cancel */}
          <p
            onClick={onClose}
            className="text-center text-zinc-500 hover:text-zinc-300 text-sm mt-3 cursor-pointer transition-colors"
          >
            Cancel
          </p>
        </form>
      </div>
    </div>
  );
}
