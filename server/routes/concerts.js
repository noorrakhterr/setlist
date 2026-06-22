const express = require("express");
const router = express.Router();
const { discoverConcerts } = require("../controllers/concertsController");

router.get("/discover", discoverConcerts);

module.exports = router;
