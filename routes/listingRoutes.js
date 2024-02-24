const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

//For Uploading Files using Cloud Storage
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listingController.js");

// Using following we can merge the same URL routes in one and avoid using repeat
router
	.route("/")
	.get(wrapAsync(listingController.showAllListings))
	.post(
		isLoggedIn,
		upload.single("listing[image]"),
		validateListing,
		wrapAsync(listingController.postCreateListing)
	);

router.get("/new", isLoggedIn, wrapAsync(listingController.getCreateListing));

router
	.route("/:id")
	.get(wrapAsync(listingController.showDetailListing))
	.put(
		isLoggedIn,
		isOwner,
		upload.single("listing[image]"),
		validateListing,
		wrapAsync(listingController.updateListing)
	)
	.delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

router.get(
	"/:id/edit",
	isLoggedIn,
	isOwner,
	wrapAsync(listingController.editListing)
);

router.get("/categories/:category", listingController.getListingByCategory);

module.exports = router;
