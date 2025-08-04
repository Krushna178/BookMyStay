const mongoose = require('mongoose');
const { data } = require('./data'); 
const Listing = require("../models/listing");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Connection error:", err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    const listings = data.map(obj => ({ ...obj, owner: "687e2c977b05216a2d93812a" }));
    await Listing.insertMany(listings);
    console.log("Database initialized with sample data");
  } catch (err) {
    console.error("Error initializing DB:", err);
  } finally {
    mongoose.connection.close(); // Optional: closes the connection after running
  }
};

initDB();
