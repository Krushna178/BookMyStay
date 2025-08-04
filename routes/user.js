const express = require("express");
const router = express.Router();
const User =require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl} = require ("../middleware")
const userController = require("../controllers/users");



router.get("/signup",(req,res)=>{
   res.render("users/signup.ejs");
});

router.post("/signup",  wrapAsync(userController.signUp));

   router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
   });

   router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }),
    async(req, res) => {
        req.flash("success", "Welcome back!");
       let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
   
        }
        );


        router.get("/logout" , (req,res,next) => {
            req.logout((err) =>{
                if(err){
                    return next(err);
                    }
                    req.flash("success","Logged out");
                    res.redirect("/listings");
            });
        });









module.exports= router;