const { supabaseAdmin } = require("../services/supabaseService");
const { getTopArtists, getRecentlyPlayed } = require("../services/spotifyService");

async function getTopArtistsController(req, res) {
  const { userId, timeRange = "medium_term" } = req.query;

  try {
    const { data: cached } = await supabaseAdmin
      .from("user_top_artists")
      .select("*")
      .eq("user_id", userId)
      .eq("time_range", timeRange)
      .gt("fetched_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (cached && cached.length > 0) {
      return res.json(cached);
    }

    const { data: userRow, error: userError } = await supabaseAdmin
      .from("users")
      .select("spotify_access_token")
      .eq("spotify_id", userId)
      .single();

    if (userError || !userRow) {
      return res.status(404).json({ error: "User not found" });
    }

    const artists = await getTopArtists(userRow.spotify_access_token, timeRange);

    await supabaseAdmin
      .from("user_top_artists")
      .delete()
      .eq("user_id", userId)
      .eq("time_range", timeRange);

    const rows = artists.map((artist, index) => ({
      user_id: userId,
      spotify_artist_id: artist.id,
      artist_name: artist.name,
      genres: artist.genres,
      image_url: artist.images[0]?.url ?? null,
      popularity: artist.popularity,
      rank: index + 1,
      time_range: timeRange,
      fetched_at: new Date().toISOString(),
    }));

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("user_top_artists")
      .insert(rows)
      .select();

    if (insertError) {
      throw new Error(`Failed to cache top artists: ${insertError.message}`);
    }

    res.json(inserted);
  } catch (err) {
    console.error("getTopArtistsController error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

async function getRecentlyPlayedController(req, res) {
  const { userId } = req.query;

  try {
    const { data: userRow, error: userError } = await supabaseAdmin
      .from("users")
      .select("spotify_access_token")
      .eq("spotify_id", userId)
      .single();

    if (userError || !userRow) {
      return res.status(404).json({ error: "User not found" });
    }

    const items = await getRecentlyPlayed(userRow.spotify_access_token);
    res.json(items);
  } catch (err) {
    console.error("getRecentlyPlayedController error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getTopArtistsController, getRecentlyPlayedController };
