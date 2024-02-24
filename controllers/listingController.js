const Listing = require("../models/listingModel.js");

// For converting location into coordinates
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

//===========================================INDEX ROUTE
module.exports.showAllListings = async (req, res) => {
	const allListings = await Listing.find();
	res.render("listings/index.ejs", { allListings });
};

//===========================================CREATE NEW LISTING ROUTE
module.exports.getCreateListing = async (req, res) => {
	res.render("listings/new.ejs");
};

//===========================================SHOW LISTING DETAILS ROUTE
module.exports.showDetailListing = async (req, res) => {
	let { id } = req.params;
	const listing = await Listing.findById(id)
		.populate({
			path: "reviews",
			populate: {
				path: "author",
			},
		})
		.populate("owner");
	if (!listing) {
		req.flash("error", "Listing you requested does not exist!");
		res.redirect("/listings");
	}
	res.render("listings/show.ejs", { listing });
};

//===========================================CREATED NEW LISTING POST ROUTE
module.exports.postCreateListing = async (req, res, next) => {
	let response = await geocodingClient
		.forwardGeocode({
			query: req.body.listing.location,
			limit: 1,
		})
		.send();

	let url = req.file.path;
	let filename = req.file.filename;

	const newListing = new Listing(req.body.listing);
	newListing.owner = req.user._id;
	newListing.image = { url, filename };

	newListing.geometry = response.body.features[0].geometry;

	let savedListing = await newListing.save();

	req.flash("Success", "New listing created!");
	res.redirect("/listings");
};

//===========================================EDIT LISTING DETAILS ROUTE
module.exports.editListing = async (req, res) => {
	let { id } = req.params;
	const listing = await Listing.findById(id);
	if (!listing) {
		req.flash("error", "Listing you requested does not exist!");
		res.redirect("/listings");
	}

	// Here you not need high quality image so To change the image quality for only preview of old image
	let originalImageUrl = listing.image.url;
	originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");

	res.render("listings/edit.ejs", { listing, originalImageUrl });
};

//===========================================UPDATE LISTING DETAILS ROUTE
module.exports.updateListing = async (req, res) => {
	let { id } = req.params;

	let response = await geocodingClient
		.forwardGeocode({
			query: req.body.listing.location,
			limit: 1,
		})
		.send();

	let updatedListing = await Listing.findByIdAndUpdate(id, {
		...req.body.listing,
	});

	if (typeof req.file !== "undefined") {
		let url = req.file.path;
		let filename = req.file.filename;
		updatedListing.image = { url, filename };
	}

	updatedListing.geometry = response.body.features[0].geometry;
	await updatedListing.save();

	req.flash("Success", " Listing Updated!");
	res.redirect(`/listings/${id}`);
};

//===========================================DELETE LISTING ROUTE
module.exports.deleteListing = async (req, res) => {
	let { id } = req.params;
	await Listing.findByIdAndDelete(id);
	req.flash("Success", "Listing Deleted!");
	res.redirect(`/listings`);
};

//===========================================GET LISTING BY CATEGORY ROUTE
module.exports.getListingByCategory = async (req, res) => {
	let { category } = req.params;
	let catListing = await Listing.find({ category });

	res.render("listings/categoryListing.ejs", { catListing });
};
