// scripts/backfillGeometry.js
require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('../models/listing');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
  console.log("Connected to DB");

  const listings = await Listing.find({ geometry: { $exists: false } });

  console.log(`Found ${listings.length} listings without geometry.`);

  for (let listing of listings) {
    try {
      const geoData = await geocodingClient.forwardGeocode({
        query: listing.location,
        limit: 1
      }).send();

      if (geoData.body.features.length === 0) {
        console.log(`No result for listing: ${listing.title}`);
        continue;
      }

      listing.geometry = geoData.body.features[0].geometry;
      await listing.save();
      console.log(`Updated: ${listing.title}`);
    } catch (err) {
      console.error(`Failed to update listing: ${listing.title}`, err.message);
    }
  }

  console.log("✅ Geometry backfill complete.");
  mongoose.connection.close();
}

main();
