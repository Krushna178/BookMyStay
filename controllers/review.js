const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError");
const Review = require("../models/review");
const Listing = require("../models/listing");




module.exports.createReview = async (req, res, next) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ExpressError(400, "Invalid listing ID"));
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    return next(new ExpressError(404, "Listing not found"));
  }

  // Extra safety: Ensure review data is provided
  if (!req.body.review) {
    return next(new ExpressError(400, "Review data is required."));
  }

  const { rating, comment } = req.body.review;

  // Create review with author field
  const review = new Review({
    rating,
    comment,
    author: req.user._id
  });

  await review.save();

  listing.reviews.push(review);
  await listing.save();

  req.flash('success', 'Review added successfully!');
  res.redirect(`/listings/${id}`);
};



module.exports.deleteReview = async (req, res, next) => {
  const { id, reviewId } = req.params;

  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewId)) {
    return next(new ExpressError(400, "Invalid listing or review ID"));
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    return next(new ExpressError(404, "Listing not found"));
  }

  // Delete review and remove from listing
  await Review.findByIdAndDelete(reviewId);
  listing.reviews.pull(reviewId);
  await listing.save();

  req.flash('success', 'Review deleted successfully!');
  res.redirect(`/listings/${id}`);
};