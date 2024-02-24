const express = require("express");
const router = express.Router({ mergeParams: true }); // If parent URL has some value from DB & we have to use then use mergeParams here have "id"
const wrapAsync = require("../utils/wrapAsync.js");
const {
	validateReview,
	isLoggedIn,
	isReviewAuthor,
} = require("../middleware.js");

const reviewController = require("../controllers/reviewController.js");

router.post(
	"",
	isLoggedIn,
	validateReview,
	wrapAsync(reviewController.newReview)
);
router.delete(
	"/:reviewId",
	isLoggedIn,
	isReviewAuthor,
	wrapAsync(reviewController.deleteReview)
);

module.exports = router;
