const Listing = require("./models/listingModel.js");
const Review = require("./models/reviewModel.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		// If we want to redirect back to the requestd url
		req.session.redirectUrl = req.originalUrl;

		req.flash("error", "You must be logged in to create new listing!");
		return res.redirect("/login");
	}
	next();
};

// If we want to redirect back to the requestd url
module.exports.saveRedirectUrl = (req, res, next) => {
	if (req.session.redirectUrl) {
		res.locals.redirectUrl = req.session.redirectUrl;
	}
	next();
};

// To check the the current user is owner or created this listing for edit or delete "Authorization"
module.exports.isOwner = async (req, res, next) => {
	let { id } = req.params;
	let listing = await Listing.findById(id);
	if (!listing.owner._id.equals(res.locals.currentUser._id)) {
		req.flash("error", "You are not the owner of this listing");
		return res.redirect(`/listings/${id}`);
	}
	next();
};

// To validate the listing
module.exports.validateListing = (req, res, next) => {
	let { error } = listingSchema.validate(req.body);
	if (error) {
		let errMsg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(400, errMsg);
	} else {
		next();
	}
};

// To validate the listing
module.exports.validateReview = (req, res, next) => {
	let { error } = reviewSchema.validate(req.body);
	if (error) {
		let errMsg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(400, errMsg);
	} else {
		next();
	}
};

// To check the the current user is  created this review for edit or delete "Authorization"
module.exports.isReviewAuthor = async (req, res, next) => {
	console.log(req.originalUrl);
	req.session.redirectUrl = req.originalUrl;

	let { id, reviewId } = req.params;
	let review = await Review.findById(reviewId);
	if (!review.author.equals(res.locals.currentUser._id)) {
		req.flash("error", "You are not the owner of this listing");
		return res.redirect(`/listings/${id}`);
	}
	next();
};
