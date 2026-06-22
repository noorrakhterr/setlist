const { supabaseAdmin } = require("../services/supabaseService");
const { getUpcomingConcertsForArtists } = require("../services/ticketmasterService");

async function discoverConcerts(req, res) {
  const { userId, city, radius = 50 } = req.query;

  if (!userId || !city) {
    return res.status(400).json({ error: "userId and city are required" });
  }

  try {
    const { data: artistRows, error: artistError } = await supabaseAdmin
      .from("user_top_artists")
      .select("*")
      .eq("user_id", userId)
      .eq("time_range", "medium_term")
      .order("rank", { ascending: true })
      .limit(20);

    if (artistError) throw new Error(artistError.message);

    if (!artistRows || artistRows.length === 0) {
      return res.status(404).json({
        error: "No top artists found. Please make sure your Spotify data has been synced.",
      });
    }

    const artists = artistRows.map((row) => ({
      artistName: row.artist_name,
      rank: row.rank,
    }));

    const concerts = await getUpcomingConcertsForArtists(artists, city, radius);

    res.json({ concerts, total: concerts.length, city });
  } catch (err) {
    console.error("discoverConcerts error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { discoverConcerts };
