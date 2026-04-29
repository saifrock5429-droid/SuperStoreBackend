const mongoose = require("mongoose");
require("dotenv").config();

// We are attaching 'connect' to the exports object
exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("DB Connected Successfully"))
    .catch((err) => {
        console.log("DB Connection Failed");
        console.error(err);
        process.exit(1);
    });
};