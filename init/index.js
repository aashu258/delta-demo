require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const axios = require("axios");


const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main()
    .then(() => {
        console.log("Connected to DB");
    }).catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {

    await Listing.deleteMany({});

    const updatedData = [];

    for (let obj of initData.data) {

        const location = obj.location;

        const geoResponse = await axios.get(
            `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${process.env.GEOCODING_API_KEY}`
        );

        if (!geoResponse.data.results.length) {
            console.log(`Skipping ${location}`);
            continue;
        }

        const data = geoResponse.data.results[0].geometry;

        obj.geometry = {
            type: "Point",
            coordinates: [data.lng, data.lat]
        };

        obj.owner = '6a0d6ee270ac30b9e8d2f363';

        updatedData.push(obj);
    }

    await Listing.insertMany(updatedData);

    console.log("Data was initialized");
};

initDB();