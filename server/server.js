require("dotenv").config();

// Trust the network's TLS inspection proxy in local dev.
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const spotifyRoutes = require("./routes/spotify");
const concertsRoutes = require("./routes/concerts");
const showsRoutes = require("./routes/shows");
const profileRoutes = require("./routes/profile");

const app = express();

app.use(cors({ origin: 'http://127.0.0.1:5173', credentials: true }))
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/spotify", spotifyRoutes);
app.use("/concerts", concertsRoutes);
app.use("/shows", showsRoutes);
app.use("/profile", profileRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL?.slice(0, 40)}...`);
  try {
    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: process.env.SUPABASE_SERVICE_KEY },
    });
    console.log(`Supabase reachable — status ${res.status}`);
  } catch (err) {
    console.error(`Supabase unreachable: ${err.message}`);
  }
});
