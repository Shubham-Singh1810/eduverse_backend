const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const bookingSchema = mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  isCreatedByAdmin : {
    type:Boolean,
    default:false
  },
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
  },
  modeOfPayment: {
    type: String,
    enum: ["offline", "online"],
  },
  paymentId: {
    type: String,
  },
  couponDiscountValue: {
    type: Number,
  },
  price: {
    type: Number,
    required: true,
  },
  finalAmount: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
});

bookingSchema.plugin(timestamps);
module.exports = mongoose.model("Booking", bookingSchema);
