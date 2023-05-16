const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const otpSchema = new Schema({
    email: String,
    otp: String,
    timestamp: Date,
    otpCount: Number,
    createdAt: { type: Date, expires: '5m', default: Date.now },
})
 
module.exports = mongoose.model("otp", otpSchema);
