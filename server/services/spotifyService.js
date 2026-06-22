const axios = require("axios");

async function getTopArtists(accessToken, timeRange) {
  try {
    const response = await axios.get("https://api.spotify.com/v1/me/top/artists", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 50, time_range: timeRange },
    });
    return response.data.items;
  } catch (err) {
    throw new Error(`Failed to fetch top artists: ${err.response?.data?.error?.message ?? err.message}`);
  }
}

async function getRecentlyPlayed(accessToken) {
  try {
    const response = await axios.get("https://api.spotify.com/v1/me/player/recently-played", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 50 },
    });
    return response.data.items;
  } catch (err) {
    throw new Error(`Failed to fetch recently played: ${err.response?.data?.error?.message ?? err.message}`);
  }
}

module.exports = { getTopArtists, getRecentlyPlayed };
