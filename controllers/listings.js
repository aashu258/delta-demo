const Listing = require("../models/listing");
const axios = require("axios");

//Index ROute
module.exports.index = async(req,res)=>{
    const allListings= await Listing.find({});
    res.render("listings/index.ejs",{ allListings });
}

//New Route
module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

//Show ROute(read)
module.exports.showListing = async(req,res)=>{
    //first id extract
    let {id}= req.params;
    //ab id ke basis pe jo hai usko dhundenge kese findById se
    const listing= await Listing.findById(id).populate({path : "reviews", populate: {path: "author"}}).populate("owner");
    if(!listing){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
    // console.log(listing);
};

//Create Route
module.exports.createListing = async(req,res,next)=>{
    // let {title,description,image,price,country,location}= req.body; 1st tariaka
    const newListing= new Listing(req.body.listing);
    let url = req.file.path;
    let filename = req.file.filename;//iska matlab hai ki multer ke help se jo file upload hui hai uska url aur filename ko extract kar rahe hain, taki usko listing ke image field me store kar sake
    newListing.owner = req.user._id;//ye line isliye add karenge taki jab bhi koi listing create kare to usme owner field me uska user id store ho jaye, taki jab apn listing ko delete kare to uske sath uske reviews bhi delete ho jaye
    newListing.image = {url, filename};//ye line isliye add karenge taki jab bhi koi listing create kare to usme image field me uska url aur filename store ho jaye, taki jab apn listing ko show kare to uska image bhi show ho jaye
    // Geocoding started
    const location = req.body.listing.location;

    const geoResponse = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${process.env.GEOCODING_API_KEY}`
    );
    if (!geoResponse.data.results.length) {
        req.flash("error", "Invalid location");
        return res.redirect("/listings/new");
    }

    const data = geoResponse.data.results[0].geometry;

    newListing.geometry = {
        type: "Point",
        coordinates: [data.lng, data.lat]
    };
    console.log(geoResponse.data);
    //gecoding ended!

    await newListing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect("/listings");
};

//Edit Route
module.exports.renderEditForm  = async(req,res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");//ye line isliye add karenge taki jab bhi koi listing edit kare to usme uska original image ka url me w_300 add ho jaye, taki jab apn listing ko edit kare to uska image thoda chhota dikhai de, taki edit form me wo accha lage
    
    res.render("listings/edit.ejs",{listing , originalImageUrl});
};

//Update Route
module.exports.updateListing = async(req,res)=>{
    let {id}= req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if(typeof req.file !== "undefined"){//iska matlab hai ki agar user ne image upload ki hai to hi usko update karna hai, agar user ne image upload nahi ki hai to uska matlab hai ki wo apni purani image ko hi rakhna chahta hai to us case me apn usko update nahi karenge
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};//ye line isliye add karenge taki jab bhi koi listing update kare to usme image field me uska url aur filename store ho jaye, taki jab apn listing ko show kare to uska image bhi show ho jaye
    }
    await listing.save();
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

//Delete Route
module.exports.destroyListing = async(req,res)=>{
    let {id}= req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};