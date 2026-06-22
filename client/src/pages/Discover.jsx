import { useState, useEffect, useRef } from "react";
import { Music, MapPin, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import ConcertCard from "../components/ConcertCard";
import SkeletonCard from "../components/SkeletonCard";

export default function Discover() {
  const { user } = useAuth();
  const [concerts, setConcerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const cityInputRef = useRef(null);
  const syncTimerRef = useRef(null);

  useEffect(() => {
    const savedCity = localStorage.getItem("setlist_city");
    if (savedCity) setCity(savedCity);
    return () => clearTimeout(syncTimerRef.current);
  }, []);

  async function syncArtists() {
    setIsSyncing(true);
    try {
      await api.get("/spotify/top-artists", {
        params: { userId: user.spotify_id, timeRange: "medium_term" },
      });
      setSyncMessage("Artist data synced");
      syncTimerRef.current = setTimeout(() => setSyncMessage(""), 3000);
    } catch {
      setSyncMessage("Sync failed. Try again.");
    } finally {
      setIsSyncing(false);
    }
  }

  async function search() {
    if (!city.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(false);

    localStorage.setItem("setlist_city", city.trim());

    try {
      await api.get("/spotify/top-artists", {
        params: { userId: user.spotify_id, timeRange: "medium_term" },
      });

      const response = await api.get("/concerts/discover", {
        params: { userId: user.spotify_id, city: city.trim() },
      });
      setConcerts(response.data.concerts);
      setHasSearched(true);
    } catch (err) {
      setError(
        err.response?.data?.error ?? "Something went wrong. Try a different city."
      );
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && city.trim()) search();
  }

  function clearAndFocusCity() {
    setCity("");
    setHasSearched(false);
    setConcerts([]);
    setTimeout(() => cityInputRef.current?.focus(), 0);
  }

  const syncIsSuccess = syncMessage === "Artist data synced";

  return (
    <div className="bg-zinc-950 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-6 space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Discover</h1>
            <button
              onClick={syncArtists}
              disabled={isSyncing}
              className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors text-xs"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync artists"}
            </button>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Shows ranked by how much you actually listen
          </p>
          {syncMessage && (
            <span
              className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                syncIsSuccess
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {syncMessage}
            </span>
          )}
        </div>

        {/* Search bar */}
        <div>
          <div className="flex gap-3">
            <input
              ref={cityInputRef}
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your city — New York, Los Angeles, Chicago..."
              className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-3 flex-1 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              onClick={search}
              disabled={isLoading || !city.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-black font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
            >
              {isLoading ? "Searching..." : "Find Shows"}
            </button>
          </div>
          <p className="text-zinc-500 text-xs mt-2">We'll find shows within 50 miles</p>
        </div>

        {/* Results area */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : !hasSearched ? (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <Music className="w-10 h-10 text-zinc-600" />
            <p className="text-zinc-400">Enter your city to find shows</p>
            <p className="text-zinc-600 text-sm">
              We'll match upcoming concerts to your top Spotify artists
            </p>
          </div>
        ) : error ? (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <MapPin className="w-10 h-10 text-zinc-600" />
            <p className="text-white text-lg font-medium">Something went wrong</p>
            <p className="text-zinc-400 text-sm">{error}</p>
            <button
              onClick={clearAndFocusCity}
              className="mt-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Try Another City
            </button>
          </div>
        ) : concerts.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <MapPin className="w-10 h-10 text-zinc-600" />
            <p className="text-white text-lg font-medium">No shows found near {city}</p>
            <p className="text-zinc-400 text-sm">
              Try a nearby major city or check back closer to show season
            </p>
            <button
              onClick={clearAndFocusCity}
              className="mt-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Try Another City
            </button>
          </div>
        ) : (
          <div>
            <p className="text-zinc-400 text-sm mb-6">
              Found {concerts.length} shows near {city}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {concerts.map((concert) => (
                <ConcertCard key={concert.eventId} {...concert} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
