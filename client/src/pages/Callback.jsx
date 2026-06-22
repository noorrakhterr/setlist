import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="w-10 h-10 border-4 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 gap-4">
      <p className="text-white text-lg">{message}</p>
      <a
        href="/"
        className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-full transition-colors"
      >
        Go Home
      </a>
    </div>
  );
}

export default function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [callbackError, setCallbackError] = useState(null);

  const urlError = searchParams.get("error");
  const spotifyId = searchParams.get("spotify_id");

  useEffect(() => {
    if (urlError || !spotifyId) return;

    async function handleCallback() {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("spotify_id", spotifyId)
        .limit(1)
        .single();

      if (error || !data) {
        console.error("Supabase fetch error:", error?.code, error?.message, error?.details);
        setCallbackError(
          "We couldn't load your account. Check the server logs and make sure the users table exists in Supabase."
        );
        return;
      }

      localStorage.setItem("spotify_id", data.spotify_id);
      localStorage.setItem("access_token", data.spotify_access_token);
      setUser(data, data.spotify_access_token);
      navigate("/discover", { replace: true });
    }

    handleCallback();
  }, [spotifyId, urlError]);

  if (urlError) {
    const messages = {
      missing_code: "Spotify did not return an authorization code.",
      db_error: "Failed to save your account. Check the server logs.",
      auth_failed: "Authentication failed. Please try again.",
    };
    return <ErrorScreen message={messages[urlError] ?? "Something went wrong."} />;
  }

  if (!spotifyId) {
    return <ErrorScreen message="No Spotify ID received. Please try again." />;
  }

  if (callbackError) {
    return <ErrorScreen message={callbackError} />;
  }

  return <Spinner />;
}
