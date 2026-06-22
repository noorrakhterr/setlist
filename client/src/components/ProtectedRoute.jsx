import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="w-10 h-10 border-4 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}
