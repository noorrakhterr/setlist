const { supabaseAdmin } = require("../services/supabaseService");

async function getStats(req, res) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  const { data: shows, error } = await supabaseAdmin
    .from("shows")
    .select("*")
    .eq("user_id", userId);

  if (error) return res.status(500).json({ error: error.message });

  if (shows.length === 0) {
    return res.json({
      totalShows: 0,
      uniqueArtists: 0,
      uniqueVenues: 0,
      uniqueCities: 0,
      topArtist: null,
      topArtistCount: 0,
      topArtistShows: [],
      favoriteVenue: null,
      averageRating: null,
      showsByYear: [],
      topRatedShows: [],
      mostRecentShow: null,
    });
  }

  // totalShows
  const totalShows = shows.length;

  // uniqueArtists (case-insensitive)
  const uniqueArtists = new Set(shows.map((s) => s.artist_name.toLowerCase())).size;

  // uniqueVenues / uniqueCities
  const uniqueVenues = new Set(
    shows.map((s) => s.venue_name).filter((v) => v && v.trim() !== "")
  ).size;
  const uniqueCities = new Set(
    shows.map((s) => s.city).filter((c) => c && c.trim() !== "")
  ).size;

  // topArtist — most frequent, tiebreak by most recent show_date
  const artistMap = {};
  for (const s of shows) {
    const key = s.artist_name.toLowerCase();
    if (!artistMap[key]) artistMap[key] = { name: s.artist_name, count: 0, latestDate: "" };
    artistMap[key].count += 1;
    if (s.show_date > artistMap[key].latestDate) {
      artistMap[key].latestDate = s.show_date;
      artistMap[key].name = s.artist_name;
    }
  }
  const topArtistEntry = Object.values(artistMap).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.latestDate.localeCompare(a.latestDate);
  })[0];
  const topArtist = topArtistEntry.name;
  const topArtistCount = topArtistEntry.count;

  const topArtistShows = shows
    .filter((s) => s.artist_name.toLowerCase() === topArtist.toLowerCase())
    .sort((a, b) => b.show_date.localeCompare(a.show_date))
    .slice(0, 3)
    .map(({ id, artist_name, venue_name, city, show_date, rating }) => ({
      id, artist_name, venue_name, city, show_date, rating,
    }));

  // favoriteVenue
  const venueMap = {};
  for (const s of shows) {
    if (!s.venue_name || s.venue_name.trim() === "") continue;
    venueMap[s.venue_name] = (venueMap[s.venue_name] ?? 0) + 1;
  }
  const favoriteVenue =
    Object.keys(venueMap).length > 0
      ? Object.entries(venueMap).sort((a, b) => b[1] - a[1])[0][0]
      : null;

  // averageRating
  const ratedShows = shows.filter((s) => s.rating != null);
  const averageRating =
    ratedShows.length > 0
      ? Math.round((ratedShows.reduce((sum, s) => sum + s.rating, 0) / ratedShows.length) * 10) / 10
      : null;

  // showsByYear
  const yearMap = {};
  for (const s of shows) {
    const year = s.show_date.split("-")[0];
    yearMap[year] = (yearMap[year] ?? 0) + 1;
  }
  const showsByYear = Object.entries(yearMap)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, count]) => ({ year, count }));

  // topRatedShows
  const topRatedShows = shows
    .filter((s) => s.rating != null)
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.show_date.localeCompare(a.show_date);
    })
    .slice(0, 3)
    .map(({ id, artist_name, venue_name, city, show_date, rating }) => ({
      id, artist_name, venue_name, city, show_date, rating,
    }));

  // mostRecentShow
  const mostRecentShow = shows
    .slice()
    .sort((a, b) => b.show_date.localeCompare(a.show_date))
    .map(({ artist_name, venue_name, city, show_date }) => ({
      artist_name, venue_name, city, show_date,
    }))[0];

  return res.json({
    totalShows,
    uniqueArtists,
    uniqueVenues,
    uniqueCities,
    topArtist,
    topArtistCount,
    topArtistShows,
    favoriteVenue,
    averageRating,
    showsByYear,
    topRatedShows,
    mostRecentShow,
  });
}

module.exports = { getStats };
