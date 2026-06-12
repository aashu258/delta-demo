const express = require("express");
const router = express.Router({mergeParams: true});//ye mergeParams isliye likha taki listing ke id ko review ke routes me access kar sake
const wrapAsync= require("../utils/wrapAsync.js");
const ExpressError= require("../utils/ExpressError.js");
const Review= require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview , isLoggedIn,isReviewAuthor} = require("../middleware.js");


const reviewController = require("../controllers/reviews.js");

//Reviews ke liye routes banayenge(post)
router.post("/",isLoggedIn,validateReview, wrapAsync(reviewController.createReview));


//Delete Review Route
router.delete("/:reviewId", isLoggedIn , isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;