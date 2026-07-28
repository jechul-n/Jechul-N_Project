const express = require("express");

const {
  getCurrentItems,
  getItems,
} = require("../controllers/seasonalController");

const router = express.Router();

router.get("/seasonal/current", getCurrentItems);
router.get("/seasonal", getItems);

module.exports = router;
