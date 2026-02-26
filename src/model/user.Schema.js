const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const userSchema = mongoose.Schema({
  code: {
    type: String,
  },
  token: {
    type: String,
  },
  profilePic: {
    type: String,
  },
  deviceId: {
    type: String,
  },
  password: {
    type: String,
  },
  emailOtp: {
    type: String,
  },
  phoneOtp: {
    type: String,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  countryCode: {
    type: String,
    default: "91",
  },
  
  myBatch: [
    {
      batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
    },
  ],
  lastLogin: {
    type: String,
  },
  // -------------
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    sparse: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  dob: {
    type: String,
  },
  gender: {
    type: String,
  },
  profileStatus: {
    type: String,
    default: "registered",
    enum: ["registered", "verified", "profileUpdated", "active", "blocked"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  isUserApproved:{
    type: Boolean,
    default: true,
  },

  // ----------------
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  pincode: {
    type: String,
  },
  landmark: {
    type: String,
  },
  address: {
    type: String,
  },
  lat: {
    type: String,
  },
  long: {
    type: String,
  },
});

userSchema.plugin(timestamps);
module.exports = mongoose.model("User", userSchema);
