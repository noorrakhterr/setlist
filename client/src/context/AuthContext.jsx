import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      const storedSpotifyId = localStorage.getItem("spotify_id");
      const storedAccessToken = localStorage.getItem("access_token");

      if (storedSpotifyId && storedAccessToken) {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("spotify_id", storedSpotifyId)
          .limit(1)
          .single();

        if (data) {
          setUserState(data);
          setAccessToken(storedAccessToken);
          setIsAuthenticated(true);
        }
      }

      setIsLoading(false);
    }

    restoreSession();
  }, []);

  function setUser(userData, token) {
    setUserState(userData);
    setAccessToken(token);
    setIsAuthenticated(true);
  }

  async function login() {
    try {
      const response = await api.get("/auth/login");
      const authUrl = response.data?.authUrl;
      if (!authUrl) throw new Error("No authUrl returned from server");
      window.location.href = authUrl;
    } catch (err) {
      console.error("Login failed:", err.message);
      alert("Could not connect to the server. Make sure the backend is running.");
    }
  }

  function logout() {
    setUserState(null);
    setAccessToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("spotify_id");
    localStorage.removeItem("access_token");
  }

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLoading, isAuthenticated, login, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
