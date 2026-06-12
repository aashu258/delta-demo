const mongoose= require("mongoose");
const Schema= mongoose.Schema;
const Review = require("./review.js");

//./ Current folder / current directory

const listingSchema= new Schema({
    title:{
        type:String,
        required:true,
    },
    description: String,
    image:{
        url : String,
        filename : String,
    },
    price: Number,
    location: String,
    country: String,
    reviews:[
        {
            type : Schema.Types.ObjectId,
            ref : "Review"
        }
    ],
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
    geometry: { //used GeoJSON format
    type: {
        type: String,
        enum: ["Point"],
        required: true
        },
    coordinates: {
        type: [Number],
        required: true
        }
    },
});

listingSchema.post("findOneAndDelete", async (listing)=>{
    if(listing){
        await Review.deleteMany({
            _id : {
                $in : listing.reviews
            }
        })
    }
})

const Listing= mongoose.model("Listing",listingSchema);
//ab isko app.js me export karenge
module.exports= Listing;//ye isliye likha taki isko is model ko access kar ske