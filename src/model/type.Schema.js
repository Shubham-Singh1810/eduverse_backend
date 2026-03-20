const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const typeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
  },
  specialApperence: {
    type: String,
  },
});

typeSchema.plugin(timestamps);
module.exports = mongoose.model("Type", typeSchema);