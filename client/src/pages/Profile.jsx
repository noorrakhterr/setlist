import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Music, Copy, Check, Download, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingArtists, setIsLoadingArtists] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    async function load() {
      const [statsResult, artistsResult] = await Promise.allSettled([
        api.get("/profile/stats", { params: { userId: user.id } }),
        api.get("/spotify/top-artists", {
          params: { userId: user.spotify_id, timeRange: "medium_term" },
        }),
      ]);

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value.data);
      } else {
        setError(statsResult.reason?.response?.data?.error ?? statsResult.reason.message);
      }
      setIsLoadingStats(false);

      if (artistsResult.status === "fulfilled") {
        setTopArtists((artistsResult.value.data ?? []).slice(0, 5));
      }
      setIsLoadingArtists(false);
    }
    load();
  }, [user.id, user.spotify_id]);

  async function handleCopyStats() {
    const text = [
      "🎟️ My concert stats on The Setlist:",
      `${stats?.totalShows ?? 0} shows · ${stats?.uniqueArtists ?? 0} artists · ${stats?.uniqueCities ?? 0} cities`,
      `Most seen: ${stats?.topArtist ?? "still building my history"}`,
      "thesetlist.app",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.error("Could not copy. Try again.");
    }
  }

  async function handleSaveCard() {
    setIsCapturing(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `my-setlist-${user.display_name ?? "card"}.png`;
      a.click();
    } catch {
      toast.error("Could not save card. Try again.");
    } finally {
      setIsCapturing(false);
    }
  }

  const displayName = user.display_name || user.spotify_id || "You";
  const showAvatar = user.avatar_url && !avatarError;

  const lastSeen = stats?.mostRecentShow
    ? stats.mostRecentShow.venue_name
      ? `Last seen: ${stats.mostRecentShow.artist_name} at ${stats.mostRecentShow.venue_name}`
      : `Last seen: ${stats.mostRecentShow.artist_name}`
    : null;

  return (
    <div className="bg-zinc-950 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-16">

        {/* ── Section 1: User Header ── */}
        <div className="flex items-start gap-4 mb-10">
          {showAvatar ? (
            <img
              src={user.avatar_url}
              alt={displayName}
              onError={() => setAvatarError(true)}
              className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-2xl">
                {displayName[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-2xl leading-tight truncate">{displayName}</p>
            {lastSeen && (
              <p className="text-zinc-600 text-xs mt-2 truncate">{lastSeen}</p>
            )}
          </div>
        </div>

        {/* ── Section 2: Stats Grid ── */}
        <section className="mb-10">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mb-4">
            Your Concert Stats
          </p>

          {isLoadingStats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-zinc-900 rounded-2xl p-5 animate-pulse">
                  <div className="h-8 bg-zinc-800 rounded w-1/2 mx-auto mb-2" />
                  <div className="h-3 bg-zinc-800 rounded w-1/3 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: stats?.totalShows ?? 0, label: "Shows" },
                { value: stats?.uniqueArtists ?? 0, label: "Artists" },
                { value: stats?.uniqueCities ?? 0, label: "Cities" },
                { value: stats?.uniqueVenues ?? 0, label: "Venues" },
                {
                  value: stats?.averageRating != null
                    ? <span>{stats.averageRating} <span className="text-amber-400">★</span></span>
                    : "—",
                  label: "Avg Rating",
                },
                {
                  value: null,
                  label: "Most Seen",
                  custom: (
                    <>
                      <p className="text-lg font-bold text-white leading-tight">
                        {stats?.topArtist ?? "—"}
                      </p>
                      {stats?.topArtistCount > 1 && (
                        <p className="text-zinc-600 text-xs mt-0.5">
                          {stats.topArtistCount} shows
                        </p>
                      )}
                      <p className="text-zinc-500 text-sm mt-1">Most Seen</p>
                    </>
                  ),
                },
              ].map(({ value, label, custom }, i) => (
                <div
                  key={i}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center"
                >
                  {custom ?? (
                    <>
                      <p className="text-4xl font-bold text-white tabular-nums">{value}</p>
                      <p className="text-zinc-500 text-sm mt-1">{label}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </section>

        {/* ── Section 3: Top Spotify Artists ── */}
        {!isLoadingArtists && topArtists.length > 0 && (
          <section className="mb-10">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mb-4">
              Your Top Spotify Artists
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {topArtists.map((artist, idx) => (
                <div
                  key={artist.artist_name}
                  className="flex-shrink-0 flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3"
                >
                  {artist.image_url ? (
                    <img
                      src={artist.image_url}
                      alt={artist.artist_name}
                      className="w-10 h-10 rounded-full object-cover bg-zinc-800"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                      <Music className="w-4 h-4 text-zinc-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">{artist.artist_name}</p>
                    <p className="text-zinc-500 text-xs">#{idx + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Section 4: Shareable Concert Card ── */}
        <section>
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mb-4">
            Your Card
          </p>

          {stats?.totalShows === 0 ? (
            // Zero state
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950 border border-zinc-700 rounded-2xl p-6 flex flex-col items-center text-center">
              <Ticket className="w-8 h-8 text-zinc-600 mb-3" />
              <p className="text-zinc-400 text-base">Log some shows to generate your card</p>
              <p className="text-zinc-600 text-sm mt-1">
                Head to History to add concerts you've attended
              </p>
              <Link
                to="/history"
                className="text-emerald-500 hover:text-emerald-400 text-sm mt-4 transition-colors"
              >
                Go to History →
              </Link>
            </div>
          ) : (
            // Full card
            <div
              ref={cardRef}
              className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950 border border-zinc-700 rounded-2xl p-6 relative overflow-hidden"
            >
              {/* Texture */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)",
                }}
              />

              <div className="relative z-10">
                {/* Top row */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-emerald-400 text-xs font-bold tracking-widest">
                      THE SETLIST
                    </p>
                    <p className="text-white font-bold text-2xl mt-1 leading-tight">
                      {displayName}
                    </p>
                  </div>
                  <div className="border-l-2 border-dashed border-zinc-600 pl-4 text-right">
                    <p className="text-white font-bold text-3xl tabular-nums">
                      {stats?.totalShows ?? 0}
                    </p>
                    <p className="text-zinc-500 text-xs">shows</p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center mb-6">
                  <span className="text-zinc-300 text-sm">{stats?.uniqueArtists ?? 0} artists</span>
                  <span className="text-zinc-600 mx-2">·</span>
                  <span className="text-zinc-300 text-sm">{stats?.uniqueCities ?? 0} cities</span>
                  <span className="text-zinc-600 mx-2">·</span>
                  <span className="text-zinc-300 text-sm">{stats?.uniqueVenues ?? 0} venues</span>
                </div>

                {/* Most seen */}
                {stats?.topArtistCount > 0 && (
                  <div className="mb-6">
                    <p className="text-zinc-600 text-xs tracking-widest mb-2">MOST SEEN</p>
                    <p className="text-white font-medium text-sm">{stats.topArtist}</p>
                    <p className="text-zinc-500 text-xs">
                      seen {stats.topArtistCount} time{stats.topArtistCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}

                {/* Top rated */}
                {stats?.topRatedShows?.length > 0 && (
                  <div>
                    <p className="text-zinc-600 text-xs tracking-widest mb-2">TOP RATED</p>
                    <div className="space-y-1">
                      {stats.topRatedShows.map((show) => (
                        <p key={show.id} className="text-zinc-400 text-xs">
                          ★ {show.artist_name}
                          {(show.venue_name || show.city) && (
                            <> · {show.venue_name || show.city}</>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom row */}
                <div className="flex justify-between items-end mt-6">
                  <p className="text-zinc-600 text-xs">thesetlist.app</p>
                  <p className="text-zinc-600 text-xs">
                    {new Date().toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mt-4 justify-end">
            <button
              onClick={handleCopyStats}
              className={`text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                isCopied
                  ? "bg-emerald-500 text-black"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white"
              }`}
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {isCopied ? "Copied! ✓" : "Copy Stats"}
            </button>

            {stats?.totalShows > 0 && (
              <button
                onClick={handleSaveCard}
                disabled={isCapturing}
                className="bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isCapturing ? "Saving..." : "Save Card"}
              </button>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
