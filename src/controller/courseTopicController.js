const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const CourseTopic = require("../model/courseTopic.Schema");
const courseTopicController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

courseTopicController.post(
  "/create",
  upload.fields([
    { name: "assignment", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 } // Naya field add kiya
  ]),
  async (req, res) => {
    try {
      let assignmentUrl = "";
      let thumbnailUrl = "";

      // 1. Assignment upload logic
      if (req.files?.assignment?.length) {
        const uploadedAssignment = await cloudinary.uploader.upload(
          req.files.assignment[0].path
        );
        assignmentUrl = uploadedAssignment.secure_url;
      }

      // 2. Thumbnail upload logic
      if (req.files?.thumbnail?.length) {
        const uploadedThumbnail = await cloudinary.uploader.upload(
          req.files.thumbnail[0].path
        );
        thumbnailUrl = uploadedThumbnail.secure_url;
      }

      const obj = {
        ...req.body,
        assignment: assignmentUrl,
        thumbnail: thumbnailUrl, // Database mein thumbnail ka URL save karein
      };

      const TopicCreated = await CourseTopic.create(obj);

      sendResponse(res, 200, "Success", {
        message: "Topic created successfully!",
        data: TopicCreated,
        statusCode: 200,
      });
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
        statusCode: 500,
      });
    }
  }
);

courseTopicController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "",
      status,
      pageNo = 1,
      pageCount = 10,
      sortByField,
      sortByOrder,
      courseId
    } = req.body;
    const query = {};
    if (status) query.status = status;
    if (courseId) query.courseId = courseId;
    if (searchKey) query.topicName = { $regex: searchKey, $options: "i" };
    const sortField = sortByField || "srNo";
    const sortOrder = sortByOrder === "asc" ? -1 : 1;
    const sortOption = { [sortField]: sortOrder };
    const topicList = await CourseTopic.find(query).populate("courseId")
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo - 1) * parseInt(pageCount));
    const totalCount = await CourseTopic.countDocuments({});
    const completedCount = await CourseTopic.countDocuments({ status: "completed" });
    const upcomingCount = await CourseTopic.countDocuments({ status: "upcoming" });
    sendResponse(res, 200, "Success", {
      message: "Topic list retrieved successfully!",
      data: topicList,
      documentCount: {
        totalCount,
        completedCount,
        upcomingCount
      },
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});

courseTopicController.put(
  "/update",
  upload.fields([
    { name: "assignment", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const id = req.body._id;
      const topic = await CourseTopic.findById(id);

      if (!topic) {
        return sendResponse(res, 404, "Failed", {
          message: "Topic not found",
          statusCode: 404, // Corrected to 404
        });
      }

      // Initial updatedData mein text fields (topicName, srNo, videoUrl) aa jayenge
      let updatedData = { ...req.body };

      // 1. Check if new Assignment file is uploaded
      if (req.files?.assignment?.length) {
        const uploadedAssignment = await cloudinary.uploader.upload(
          req.files.assignment[0].path
        );
        updatedData.assignment = uploadedAssignment.secure_url;
      }

      // 2. Check if new Thumbnail file is uploaded
      if (req.files?.thumbnail?.length) {
        const uploadedThumbnail = await cloudinary.uploader.upload(
          req.files.thumbnail[0].path
        );
        updatedData.thumbnail = uploadedThumbnail.secure_url;
      }

      // Find and update the topic
      const updatedTopic = await CourseTopic.findByIdAndUpdate(
        id, 
        { $set: updatedData }, 
        { new: true }
      );

      sendResponse(res, 200, "Success", {
        message: "Topic updated successfully!",
        data: updatedTopic,
        statusCode: 200,
      });
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
        statusCode: 500,
      });
    }
  }
);

courseTopicController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await CourseTopic.findById(id);
    if (!topic) {
      return sendResponse(res, 404, "Failed", {
        message: "Topic not found",
      });
    }
    await Topic.findByIdAndDelete(id);
    sendResponse(res, 200, "Success", {
      message: "Topic  deleted successfully!",
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

courseTopicController.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const topicDetails = await CourseTopic.findOne({ _id: id })
      .populate("courseId")
     

    if (!topicDetails) {
      return sendResponse(res, 404, "Failed", {
        message: "Topic not found",
        statusCode: 404,
      });
    }

    sendResponse(res, 200, "Success", {
      message: "Topic details retrieved successfully!",
      data: topicDetails,
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});

module.exports = courseTopicController;
