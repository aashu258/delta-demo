const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync= require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));

// router.get("/signup", userController.renderSignupForm);

// router.post("/signup", wrapAsync(userController.signup));

router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl, passport.authenticate('local', { failureRedirect : '/login' , failureFlash : true}), userController.login);



// router.post("/login", passport.authenticate("local", {failureRedirect: "/login", failureflash: true}), async(req,res)=>{
//     req.flash("success", "Welcome Back! You are successfully logged in.");
//     res.redirect("/listings");
// });

//login se pahle passport ki help se authentication karenge, agar authentication fail hota hai to usko wapas login page pe bhej denge aur agar authentication successful hota hai to usko listings page pe bhej denge
// router.post("/login", saveRedirectUrl, passport.authenticate('local', { failureRedirect : '/login' , failureFlash : true}), userController.login);

router.get("/logout", userController.logout);

module.exports = router;
