const { supabaseAdmin } = require("../services/supabaseService");

async function getShows(req, res) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  try {
    const { data, error } = await supabaseAdmin
      .from("shows")
      .select("*")
      .eq("user_id", userId)
      .order("show_date", { ascending: false });

    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getShowById(req, res) {
  const { id } = req.params;
  const { userId } = req.query;

  try {
    const { data, error } = await supabaseAdmin
      .from("shows")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !data) return res.status(404).json({ error: "Show not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createShow(req, res) {
  const {
    userId,
    artistName,
    venueName,
    city,
    showDate,
    rating,
    notes,
    imageUrl,
    ticketmasterEventId,
  } = req.body;

  if (!userId || !artistName || !showDate) {
    return res.status(400).json({ error: "userId, artistName, and showDate are required" });
  }

  if (rating != null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return res.status(400).json({ error: "rating must be an integer between 1 and 5" });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("shows")
      .insert({
        user_id: userId,
        artist_name: artistName,
        venue_name: venueName ?? null,
        city: city ?? null,
        show_date: showDate,
        rating: rating ?? null,
        notes: notes ?? null,
        image_url: imageUrl ?? null,
        ticketmaster_event_id: ticketmasterEventId ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateShow(req, res) {
  const { id } = req.params;
  const { artistName, venueName, city, showDate, rating, notes } = req.body;

  const updates = { updated_at: new Date().toISOString() };
  if (artistName !== undefined) updates.artist_name = artistName;
  if (venueName !== undefined) updates.venue_name = venueName;
  if (city !== undefined) updates.city = city;
  if (showDate !== undefined) updates.show_date = showDate;
  if (rating !== undefined) updates.rating = rating;
  if (notes !== undefined) updates.notes = notes;

  try {
    const { data, error } = await supabaseAdmin
      .from("shows")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteShow(req, res) {
  const { id } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from("shows")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getShows, getShowById, createShow, updateShow, deleteShow };
