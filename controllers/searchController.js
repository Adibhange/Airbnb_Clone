const Listing = require("../models/listingModel.js");

module.exports.searchQuery = async (req, res, next) => {
	const searchTerm = req.query.q;

	if (!searchTerm) {
		res.redirect("/listings");
	}

	const searchResult = await Listing.find({
		$or: [
			{ location: { $regex: searchTerm, $options: "i" } }, // for Case-insensitive search use $options: "i"
			{ country: { $regex: searchTerm, $options: "i" } },
		],
	});

	res.render("listings/searchedListing.ejs", { searchResult });
};
