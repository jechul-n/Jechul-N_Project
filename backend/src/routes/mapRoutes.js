const express = require("express");

const { getMapPlaces } = require("../controllers/mapController");

const router = express.Router();

router.get("/map/places", getMapPlaces);

module.exports = router;
