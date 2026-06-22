const express = require("express");
const router = express.Router();
const { login, callback, refreshToken } = require("../controllers/authController");

router.get("/login", login);
router.get("/callback", callback);
router.post("/refresh", refreshToken);

module.exports = router;
