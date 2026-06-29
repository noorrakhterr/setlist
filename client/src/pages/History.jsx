import { useState, useEffect } from "react";
import { Plus, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import ShowCard from "../components/ShowCard";
import AddShowModal from "../components/AddShowModal";

export default function History() {
  const { user } = useAuth();
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState(new Set());

  useEffect(() => {
    async function fetchShows() {
      try {
        const response = await api.get("/shows", {
          params: { userId: user.id },
        });
        setShows(response.data);
      } catch (err) {
        setError(err.response?.data?.error ?? err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchShows();
  }, [user.id]);

  async function handleAddShow(showData) {
    const response = await api.post("/shows", { userId: user.id, ...showData });
    setShows((prev) => [response.data, ...prev]);
    toast.success("Show logged! 🎟️");
    setIsModalOpen(false);
  }

  async function handleUpdateShow(id, showData) {
    const response = await api.put(`/shows/${id}`, showData);
    setShows((prev) => prev.map((s) => (s.id === id ? response.data : s)));
    toast.success("Show updated");
    setIsModalOpen(false);
  }

  async function handleDeleteShow(id) {
    setShows((prev) => prev.filter((s) => s.id !== id));
    try {
      await api.delete(`/shows/${id}`);
      toast.success("Show removed");
    } catch {
      toast.error("Could not delete show");
    }
  }

  function handleEditClick(show) {
    setEditingShow(show);
    setIsModalOpen(true);
  }

  function toggleNotes(id) {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleModalSubmit(showData) {
    if (editingShow) {
      await handleUpdateShow(editingShow.id, showData);
    } else {
      await handleAddShow(showData);
    }
  }

  // Group shows by year, sorted descending
  const yearGroups = shows.reduce((acc, show) => {
    const year = show.show_date.split("-")[0];
    if (!acc[year]) acc[year] = [];
    acc[year].push(show);
    return acc;
  }, {});
  const sortedYears = Object.keys(yearGroups).sort((a, b) => Number(b) - Number(a));

  function LogButton({ label = "Log a Show", className = "" }) {
    return (
      <button
        onClick={() => {
          setEditingShow(null);
          setIsModalOpen(true);
        }}
        className={`bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${className}`}
      >
        <Plus className="w-4 h-4" />
        {label}
      </button>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Shows</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {shows.length > 0
                ? `${shows.length} show${shows.length !== 1 ? "s" : ""} logged`
                : "No shows logged yet"}
            </p>
          </div>
          <LogButton />
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 rounded-2xl p-5 animate-pulse">
                <div className="h-5 bg-zinc-800 rounded w-1/3 mb-3" />
                <div className="h-3 bg-zinc-800 rounded w-2/3 mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {/* Empty state */}
        {!isLoading && !error && shows.length === 0 && (
          <div className="py-20 flex flex-col items-center text-center">
            <Ticket className="w-12 h-12 text-zinc-700 mb-4" />
            <p className="text-white text-xl font-medium">No shows logged yet</p>
            <p className="text-zinc-500 text-sm mt-1">Start building your concert history</p>
            <LogButton label="Log your first show" className="mt-6" />
          </div>
        )}

        {/* Timeline */}
        {!isLoading && !error && shows.length > 0 && (
          <div>
            {sortedYears.map((year, idx) => (
              <div key={year}>
                <p className="text-zinc-600 text-sm font-medium uppercase tracking-widest mb-4">
                  {year}
                </p>
                <div className="space-y-3">
                  {yearGroups[year].map((show) => (
                    <ShowCard
                      key={show.id}
                      show={show}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteShow}
                      isNotesExpanded={expandedNotes.has(show.id)}
                      onToggleNotes={toggleNotes}
                    />
                  ))}
                </div>
                {idx < sortedYears.length - 1 && (
                  <div className="border-t border-zinc-800 my-8" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AddShowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingShow={editingShow}
      />
    </div>
  );
}
