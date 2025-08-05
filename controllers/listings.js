const Listing = require("../models/listing");
const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// Show all listings
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

// Render new listing form
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

// Show individual listing
module.exports.showListing = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ExpressError(400, "Invalid listing ID"));
  }

  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};

// Create new listing
module.exports.createListing = async (req, res, next) => {

  console.log("Creating a listing = ", req.body.listing);
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1
    })
    .send();

  if (!response.body.features.length) {
    req.flash("error", "Location not found");
    return res.redirect("/listings/new");
  }

  const url = req.file?.path;
  const filename = req.file?.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = response.body.features[0].geometry;

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

// Render edit form
module.exports.renderEditForm = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ExpressError(400, "Invalid listing ID"));
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  const originalImage = listing.image.url;
  const originalImageUrl = originalImage.replace("/upload", "/upload/w_250");

  res.render("listings/edit", { listing, originalImageUrl });
};

// Update listing
module.exports.updateListing = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ExpressError(400, "Invalid listing ID"));
  }

  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // Check if location was updated
  if (req.body.listing.location !== listing.location) {
    let geoResponse = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
      .send();
    listing.geometry = geoResponse.body.features[0].geometry;
  }

  // Update other fields
  listing.title = req.body.listing.title;
  listing.description = req.body.listing.description;
  listing.location = req.body.listing.location;
  listing.country = req.body.listing.country;
  listing.price = req.body.listing.price;

  // Update image if new file is uploaded
  if (req.file) {
    const url = req.file.path;
    const filename = req.file.filename;
    listing.image = { url, filename };
  }

  await listing.save();
  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};

// Delete listing
module.exports.deleteListing = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ExpressError(400, "Invalid listing ID"));
  }

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};
