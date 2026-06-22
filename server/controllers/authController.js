const crypto = require("crypto");
const axios = require("axios");
const { supabaseAdmin } = require("../services/supabaseService");

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_ME_URL = "https://api.spotify.com/v1/me";

const SCOPES = [
  "user-top-read",
  "user-read-recently-played",
  "user-follow-read",
  "user-library-read",
].join(" ");

function getBasicAuthHeader() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  return "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

async function login(req, res) {
  const state = crypto.randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    state,
  });

  const authUrl = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
  res.json({ authUrl });
}

async function callback(req, res) {
  const { code, state } = req.query;
  const frontendUrl = process.env.FRONTEND_URL;

  if (!code) {
    return res.redirect(`${frontendUrl}/callback?error=missing_code`);
  }

  try {
    const tokenResponse = await axios.post(
      SPOTIFY_TOKEN_URL,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      }),
      {
        headers: {
          Authorization: getBasicAuthHeader(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    const token_expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

    const profileResponse = await axios.get(SPOTIFY_ME_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile = profileResponse.data;

    const { error: upsertError } = await supabaseAdmin.from("users").upsert(
      {
        spotify_id: profile.id,
        display_name: profile.display_name,
        email: profile.email,
        avatar_url: profile.images?.[0]?.url ?? null,
        spotify_access_token: access_token,
        spotify_refresh_token: refresh_token,
        token_expires_at,
        created_at: new Date().toISOString(),
      },
      { onConflict: "spotify_id" }
    );

    if (upsertError) {
      console.error("Supabase upsert error:", upsertError.message);
      return res.redirect(`${frontendUrl}/callback?error=db_error`);
    }

    res.redirect(`${frontendUrl}/callback?spotify_id=${profile.id}`);
  } catch (err) {
    console.error("Auth callback error:", err.message);
    res.redirect(`${frontendUrl}/callback?error=auth_failed`);
  }
}

async function refreshToken(req, res) {
  const { refresh_token } = req.body;

  try {
    const response = await axios.post(
      SPOTIFY_TOKEN_URL,
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
      }),
      {
        headers: {
          Authorization: getBasicAuthHeader(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, expires_in } = response.data;
    res.json({ access_token, expires_in });
  } catch (err) {
    console.error("Token refresh error:", err.message);
    res.status(500).json({ error: "Failed to refresh token" });
  }
}

module.exports = { login, callback, refreshToken };
