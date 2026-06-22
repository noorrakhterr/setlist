require("dotenv").config();

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
