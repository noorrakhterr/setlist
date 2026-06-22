import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-white font-semibold text-lg">
        The Setlist
      </Link>
      <div className="flex items-center gap-6">
        <Link
          to="/discover"
          className="text-zinc-300 hover:text-white transition-colors text-sm"
        >
          Discover
        </Link>
        <Link
          to="/history"
          className="text-zinc-300 hover:text-white transition-colors text-sm"
        >
          History
        </Link>
        <Link
          to="/profile"
          className="text-zinc-300 hover:text-white transition-colors text-sm"
        >
          Profile
        </Link>
        <button
          onClick={handleLogout}
          className="text-zinc-300 hover:text-white transition-colors text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
