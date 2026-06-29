const express = require("express");
const router = express.Router();
const {
  getShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
} = require("../controllers/showsController");

router.get("/", getShows);
router.get("/:id", getShowById);
router.post("/", createShow);
router.put("/:id", updateShow);
router.delete("/:id", deleteShow);

module.exports = router;
