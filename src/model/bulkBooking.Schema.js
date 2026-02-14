const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const bulkBookingSchema = mongoose.Schema({
  organisation: {
    type: String,
    required: true,
  },
  UserIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  finalAmount: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  noOfStudent:{
    type: Number,
    required: true,
  },
});

bulkBookingSchema.plugin(timestamps);
module.exports = mongoose.model("BulkBooking", bulkBookingSchema);
