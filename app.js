if (process.env.NODE_ENV !== "production") {
require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing");
const Path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError");
const Review = require("./models/review");
const listingsrouter = require("./routes/listing");
const  reviewsrouter = require("./routes/review");
const userrouter= require("./routes/user");
const session = require('express-session');
const MongoStore = require('connect-mongo'); // For session storage in MongoDB
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require("./models/user");

const dbUrl = process.env.ATLASDB_URL; //  "mongodb://

// Connect to MongoDB
main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(err => console.error(err));

async function main() {
  await mongoose.connect(dbUrl);
}

// View engine and static files
app.set('view engine', 'ejs');
app.set("views", Path.join(__dirname, "views"));
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(Path.join(__dirname, 'public')));


const store = MongoStore.create({
  mongoUrl: dbUrl,
  
  crypto: {
    secret:process.env.SECRET,
  },
  touchAfter: 24 * 3600, // time period in seconds
});

store.on("error", function(e) {
  console.log("Session store error", e);
});

const sessionOptions = {
  store: store,
  secret:process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
   httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
   
  },
};



// Routes




app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user;
  next();
});


// app.get("/demouser", async(req, res) => {
//   let fakeUser = new User({ 
//     email: "test@example.com",
//     username: "testuser",
//   });
//   let registeredUser = await User.register(fakeUser, "password123");
//   res.send(registeredUser);
// });



app.use('/listings', listingsrouter);
app.use('/listings/:id/reviews', reviewsrouter);
app.use("/", userrouter)


// Error handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error", { message });
});

// Start server
app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
