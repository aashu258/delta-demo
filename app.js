const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");
if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();//ye line likhne se apn .env file me jo bhi variables define karenge wo process.env ke through access kar sakte hai, isse apn sensitive information ko code me hardcode nahi karenge aur security badhegi
}

const express= require("express");
const app= express();
const mongoose= require("mongoose");
// const Listing= require("./models/listing.js");
const path= require("path");
const methodOverride = require("method-override");
const ejsMate= require("ejs-mate");
// const wrapAsync= require("./utils/wrapAsync.js");
const ExpressError= require("./utils/ExpressError.js");
// const { listingSchema , reviewSchema } = require("./schema.js");
// const Review= require("./models/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash"); 
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");//ye router ko import karenge taaki usko app.js me use kar sake
const reviewRouter = require("./routes/review.js");//ye router ko import karenge taaki usko app.js me use kar sake
const userRouter = require("./routes/user.js");//ye router ko import karenge taaki usko app.js me use kar sake


//Database create karenge ab
const dbUrl = process.env.ATLASDB_URL; 
console.log("DB URL:", process.env.ATLASDB_URL);
//Call karenge
main().then((res)=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err);
})
//Ye function Mongoose ka hai, jo tumhari app ko MongoDB database se connect karta hai.
async function main(){
    await mongoose.connect(dbUrl);
}
//Baad me jake humko bahut sare models banane padenge to hum alag se ek folder bana lenge
//Models banate hain taaki database ka kaam easy, safe aur organized ho jaye
app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
//ye isliye likha taki id wgera jo apn extract karna chate hai wo extract ho ske
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
//iska matlab public folder ko sabke liye open kar do (static files ke liye)

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
})

store.on("error", ()=>{
    console.log("ERROR IN SESSION STORE", err);
})
const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7*24*60*60*1000, //ye cookie 7 din ke baad expire ho jayegi
        maxAge : 7*24*60*60*1000, //ye cookie 7 din ke baad expire ho jayegi
        httpOnly : true, //ye cookie ko client side se access nahi karne dega, security ke liye
    }
}

/*Root route*/ 
// app.get("/",(req,res)=>{
//     res.send("Working");
// }); 

app.use(session(sessionOptions));
app.use(flash());

//Passport Configuration
//Passport ko initialize karenge aur session ke sath use karenge
app.use(passport.initialize());
//passport ko session ke sath use karenge taaki wo user ko login state me rakh sake
app.use(passport.session());
passport.use(new  LocalStrategy(User.authenticate()));//ye authenticate method user model ke through aata hai, jo ki passport-local-mongoose plugin ke through add hota hai

passport.serializeUser(User.serializeUser());//ye serializeUser method user model ke through aata hai, jo ki passport-local-mongoose plugin ke through add hota hai
passport.deserializeUser(User.deserializeUser());//ye deserializeUser method user model ke through aata hai, jo ki passport-local-mongoose plugin ke through add hota hai


//we create a middleware to set flash messages in res.locals, so that we can access it in all our views
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    console.log(res.locals.success);
    res.locals.currentUser = req.user;//ye currentUser ko res.locals me set karenge taaki hum usko apne views me access kar sake, isse hume pata chalega ki kaun sa user currently logged in hai
    next();
})


app.get("/demouser", async(req,res)=>{
    let fakeUser = new User({
        username : "delta-student",
        email : "student@gmail.com",
    });
    let registeredUser = await User.register(fakeUser, "helloworld");
    res.send(registeredUser);
})

app.use("/listings", listingRouter);//ye exprees router se structure ko chota kar diya ab kuch bhi karna ho to bas 
//bas listings kyuki usme sabme common hai wo to app.js me likh denge aur baaki sab listing.js me likhenge
//main code listing.js me likhenge aur app.js me sirf usko call karenge, taaki code organized rahe aur readability badhe
app.use("/listings/:id/reviews", reviewRouter);//ye exprees router se structure ko chota kar diya ab kuch bhi karna ho to bas
app.use("/", userRouter);//ye exprees router se structure ko chota kar diya ab kuch bhi karna ho to bas

//iska matlab pahle error handing hogi or bina error ke sab sahi hua to next() ke through aage badh jayega
// // //Joi middleware Function
// const validateListing = (req,res,next)=>{
//     let { error } = listingSchema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el)=> el.message ).join(",");
//         throw new ExpressError(400, errMsg);
//     }else{
//         next();
//     }
// }
// //for review validation
// const validateReview = (req,res,next)=>{
//     let { error } = reviewSchema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el)=> el.message ).join(",");
//         throw new ExpressError(400, errMsg);
//     }else{
//         next();
//     }
// }

//Index Route
// app.get("/listings", wrapAsync( async(req,res)=>{
//     const allListings= await Listing.find({});
//     res.render("listings/index.ejs",{ allListings });
// }));

// //New Route
// app.get("/listings/new",(req,res)=>{
//     res.render("listings/new.ejs");
// });

// //Create Route
// app.post("/listings",validateListing ,wrapAsync(async(req,res,next)=>{
//     // let {title,description,image,price,country,location}= req.body; 1st tariaka
//     const newListing= new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");
// }));

//Edit Route
// app.get("/listings/:id/edit", wrapAsync(async(req,res)=>{
//     let {id}= req.params;
//     const listing= await Listing.findById(id);
//     res.render("listings/edit.ejs",{listing});
// }));

// //Update Route
// app.put("/listings/:id",validateListing,wrapAsync(async(req,res)=>{
//     let {id}= req.params;
//     await Listing.findByIdAndUpdate(id, {...req.body.listing});
//     res.redirect(`/listings/${id}`);
// }));

//Delete Route
// app.delete("/listings/:id",wrapAsync(async(req,res)=>{
//     let {id}= req.params;
//     let deletedListing= await Listing.findByIdAndDelete(id);
//     res.redirect("/listings");
// }));

//Show Route(read)
// app.get("/listings/:id",wrapAsync(async(req,res)=>{
//     //first id extract
//     let {id}= req.params;
//     //ab id ke basis pe jo hai usko dhundenge kese findById se
//     const listing= await Listing.findById(id).populate("reviews");
//     res.render("listings/show.ejs",{listing});
//     // console.log(listing);
// }));

// //Reviews ke liye routes banayenge
// app.post("/listings/:id/reviews",validateReview, wrapAsync(async(req,res)=>{
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);
//     //ye review jo apn form me submit karenge usko save karega database me
//     listing.reviews.push(newReview);

//     await newReview.save();
//     await listing.save();
//     // console.log("New Review Added");
//     // res.send("Review Added");
//     res.redirect(`/listings/${listing._id}`);
// }))


// //Delete Review Route
// app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res)=>{
//     let {id, reviewId}= req.params;
//     //listing se review ko pull karenge
//     await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
//     await Review.findByIdAndDelete(reviewId);

//     res.redirect(`/listings/${id}`);
// }))

// app.get("/testListing",(req,res)=>{
//     //Variable sample
//     let sampleListing= new Listing({
//         title:"My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location:"Calanguate, Goa",
//         country: "India",
//     })

//     sampleListing.save();
//     console.log("Sample Was saved");
//     res.send("Successful testing");
// })

//Agr koi route nahi milta to iska matlab hai ki user ne galat url type kiya hai, to hum uske liye ek error throw karenge jo ki alag ho bilkul 
// app.all("/*",(req,res,next)=>{
//     next(new ExpressError(404,"Page Not Found"));
// });
app.all("/{*any}", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

//middleware define kar lete hain taaki error handling kar sake
app.use((err,req,res,next)=>{
    let {statusCode=500, message="Something went wrong!"}= err;
    res.status(statusCode).render("error.ejs",{message});
});

app.listen(8080,()=>{
    console.log("Server is running on port 8080");
})




