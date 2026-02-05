const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const instructorSchema = mongoose.Schema({
  profilePic: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
  },
  token: {
    type: String,
  },
  deviceId: {
    type: String,
  },
  code: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

instructorSchema.plugin(timestamps);
module.exports = mongoose.model("Instructor", instructorSchema);
