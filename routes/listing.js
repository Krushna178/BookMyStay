const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require("../models/listing.js");

const  {isLoggedIn, isOwner,validateListing} = require("../middleware.js");
const listingsController = require("../controllers/listings.js");
const multer = require("multer");

const { storage } = require("../cloudConfig.js");

const upload = multer({ storage});



// Index route — show all listings
router.get('/', wrapAsync(listingsController.index));

// New listing form
router.get('/new', isLoggedIn ,listingsController.renderNewForm);

// Create listing
 router.post('/create-listing',isLoggedIn,  upload.single('listing[image]'), validateListing,
 wrapAsync(listingsController.createListing));




// Show a specific listing
router.get('/:id', wrapAsync(listingsController.showListing));

// Edit form
router.get('/:id/edit',isLoggedIn,isOwner, wrapAsync(listingsController.renderEditForm));

// Update listing
router.put('/:id',isLoggedIn,isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingsController.updateListing));

// Delete listing
router.delete('/:id',isLoggedIn,isOwner,wrapAsync(listingsController.deleteListing));

// Export the router
module.exports = router;
