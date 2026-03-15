const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const courseTopicSchema = mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
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
  thumbnail: {
    type: String,
  },
  videoUrl: {
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

courseTopicSchema.plugin(timestamps);
module.exports = mongoose.model("CourseTopic", courseTopicSchema);
