const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const Topic = require("../model/topic.Schema");
const topicController = express.Router();
require("dotenv").config();

topicController.post(
  "/create",
  async (req, res) => {
    try {
      const TopicCreated = await Topic.create(req.body);
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
  },
);

topicController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "",
      status,
      pageNo = 1,
      pageCount = 10,
      sortByField,
      sortByOrder,
      batchId
    } = req.body;
    const query = {};
    if (status) query.status = status;
    if (batchId) query.batchId = batchId;
    if (searchKey) query.topicName = { $regex: searchKey, $options: "i" };
    const sortField = sortByField || "srNo";
    const sortOrder = sortByOrder === "asc" ? -1 : 1;
    const sortOption = { [sortField]: sortOrder };
    const topicList = await Topic.find(query).populate("batchId")
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo - 1) * parseInt(pageCount));
    const totalCount = await Topic.countDocuments({});
    const completedCount = await Topic.countDocuments({ status: "completed" });
    const upcomingCount = await Topic.countDocuments({ status: "upcoming" });
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

topicController.put(
  "/update",
  async (req, res) => {
    try {
      const id = req.body._id;
      const topic = await Topic.findById(id);

      if (!topic) {
        return sendResponse(res, 404, "Failed", {
          message: "Topic not found",
          statusCode: 403,
        });
      }

      let updatedData = { ...req.body };

      const updatedTopic = await Topic.findByIdAndUpdate(id, updatedData, {
        new: true,
      });
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
  },
);

topicController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findById(id);
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

topicController.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const topicDetails = await Topic.findOne({ _id: id })
      .populate("batchId")
     

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

module.exports = topicController;
