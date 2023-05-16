const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const blockedSchema = new Schema({
    email: String,

    createdAt: { type: Date, expires: '60m', default: Date.now }
  
})
 

module.exports = mongoose.model("blocked", blockedSchema);
