import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Callback from "./pages/Callback";
import Discover from "./pages/Discover";
import History from "./pages/History";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Toaster
        position="bottom-right"
        toastOptions={{ style: { background: "#18181b", color: "#fff", border: "1px solid #3f3f46" } }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <Layout>
                  <Discover />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <History />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
