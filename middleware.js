const Listing = require("./models/listing");//isme double dot nahi likha kyuki middleware.js aur listing.js dono same folder me hai to direct ./models/listing se hi import kar sakte hai, agar listing.js models folder ke andar nahi hota to uske hisab se path dena padta
const Review = require("./models/review.js");
const ExpressError= require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");


module.exports.isLoggedIn= (req,res,next)=>{
    // console.log(req.user);
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;//ye line isliye add karenge taaki jab user login kare to usko wapas usi page pe bhej denge jaha se wo login karne ke liye aaya tha, isse user experience better hoga
        req.flash("error", "You must be logged in to create a listing!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req,res,next)=>{
    let {id}= req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currentUser._id)){
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req,res,next)=>{
        let { error } = listingSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el)=> el.message ).join(",");
            throw new ExpressError(400, errMsg);
        }else{
            next();
        }
};

module.exports.validateReview = (req,res,next)=>{
        let { error } = reviewSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el)=> el.message ).join(",");
            throw new ExpressError(400, errMsg);
        }else{
            next();
        }
};

module.exports.isReviewAuthor = async (req,res,next)=>{
    let {id,reviewId}= req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currentUser._id)){
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}