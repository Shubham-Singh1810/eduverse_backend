const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const topicSchema = mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  attendence: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  srNo: {
    type: Number,
    required: true,
  },
  assignment: {
    type: String,
  },
  topicName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "upcoming",
    enum: ["upcoming", "completed"],
  },
});

topicSchema.plugin(timestamps);
module.exports = mongoose.model("Topic", topicSchema);
