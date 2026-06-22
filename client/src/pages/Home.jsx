import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="w-10 h-10 border-4 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );
}

export default function Home() {
  const { isLoading, isAuthenticated, login } = useAuth();

  if (isLoading) return <Spinner />;
  if (isAuthenticated) return <Navigate to="/discover" replace />;

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="flex flex-col items-center gap-6 text-center px-4">
        <h1 className="text-white text-5xl font-bold tracking-tight">The Setlist</h1>
        <p className="text-zinc-400 text-lg max-w-sm">
          Upcoming shows from artists you actually listen to
        </p>
        <button
          onClick={login}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 py-4 rounded-full transition-colors"
        >
          Connect Spotify
        </button>
        <p className="text-zinc-500 text-sm">
          Free. No credit card. Just your music taste.
        </p>
      </div>
    </div>
  );
}
