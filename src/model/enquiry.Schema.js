const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const enquirySchema = mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message:{
    type: String,
    required: true,
  },
  isResponded:{
    type:Boolean,
    default:false,
  },
  note:{
    type:String
  },  
});

enquirySchema.plugin(timestamps);
module.exports = mongoose.model("Enquiry", enquirySchema);
