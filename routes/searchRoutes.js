const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const searchController = require("../controllers/searchController.js");

router.get("/search", wrapAsync(searchController.searchQuery));

module.exports = router;
