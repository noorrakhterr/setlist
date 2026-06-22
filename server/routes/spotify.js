const express = require("express");
const router = express.Router();
const { getTopArtistsController, getRecentlyPlayedController } = require("../controllers/spotifyController");

router.get("/top-artists", getTopArtistsController);
router.get("/recently-played", getRecentlyPlayedController);

module.exports = router;
