const Review = require("../models/review");
const Listing = require("../models/listing");

//Post Route for Reviews
module.exports.createReview = async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    //ye review jo apn form me submit karenge usko save karega database me
    newReview.author = req.user._id;//ye review ke author ko set karega current logged in user ke id se
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    // console.log("New Review Added");
    // res.send("Review Added");
    req.flash("success", "Review created successfully!");
    res.redirect(`/listings/${listing._id}`);
};

//Delete Route for Reviews
module.exports.destroyReview = async(req,res)=>{
    let {id, reviewId}= req.params;
    //listing se review ko pull karenge
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
};