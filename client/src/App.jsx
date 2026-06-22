import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Callback from "./pages/Callback";
import Discover from "./pages/Discover";
import History from "./pages/History";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/discover"
            element={
              <Layout>
                <Discover />
              </Layout>
            }
          />
          <Route
            path="/history"
            element={
              <Layout>
                <History />
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout>
                <Profile />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
