const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const Batch = require("../model/batch.Schema");
const batchController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

batchController.post(
  "/create",
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      let imageUrl = "";
      if (req.files?.image?.length) {
        const uploadedImage = await cloudinary.uploader.upload(
          req.files.image[0].path,
        );
        imageUrl = uploadedImage.secure_url;
      }
      const obj = {
        ...req.body,
        image: imageUrl,
      };
      const BatchCreated = await Batch.create(obj);
      sendResponse(res, 200, "Success", {
        message: "Batch created successfully!",
        data: BatchCreated,
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

batchController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "",
      status,
      duration,
      pageNo = 1,
      pageCount = 10,
      sortByField,
      sortByOrder,
    } = req.body;
    const query = {};
    if (status) query.status = status;
    if (duration) query.duration = duration;
    if (searchKey) query.name = { $regex: searchKey, $options: "i" };
    const sortField = sortByField || "createdAt";
    const sortOrder = sortByOrder === "asc" ? 1 : -1;
    const sortOption = { [sortField]: sortOrder };
    const batchList = await Batch.find(query).populate("categoryId")
      .populate("subCategoryId")
      .populate("instructorId")
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo - 1) * parseInt(pageCount));
    const totalCount = await Batch.countDocuments({});
    const activeCount = await Batch.countDocuments({ status: "ongoing" });
    const upcomingCount = await Batch.countDocuments({ status: "upcoming" });
    sendResponse(res, 200, "Success", {
      message: "Batch list retrieved successfully!",
      data: batchList,
      documentCount: {
        totalCount,
        activeCount,
        upcomingCount,
        completedCount: totalCount - (activeCount + upcomingCount),
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

batchController.put(
  "/update",
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const id = req.body._id;
      const batch = await Batch.findById(id);

      if (!batch) {
        return sendResponse(res, 404, "Failed", {
          message: "Batch not found",
          statusCode: 403,
        });
      }

      let updatedData = { ...req.body };

      // Handle 'image'
      if (req.files?.image?.length) {
        if (batch.image) {
          const publicId = batch.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }
        const uploadedImage = await cloudinary.uploader.upload(
          req.files.image[0].path,
        );
        updatedData.image = uploadedImage.secure_url;
      }
      const updatedBatch = await Batch.findByIdAndUpdate(id, updatedData, {
        new: true,
      });

      sendResponse(res, 200, "Success", {
        message: "Batch updated successfully!",
        data: updatedBatch,
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

batchController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findById(id);
    if (!batch) {
      return sendResponse(res, 404, "Failed", {
        message: "Batch not found",
      });
    }
    const imageUrl = batch.image;
    if (imageUrl) {
      const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract public ID
      // Delete the image from Cloudinary
      await cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error("Error deleting image from Cloudinary:", error);
        } else {
          console.log("Cloudinary image deletion result:", result);
        }
      });
    }
    await Batch.findByIdAndDelete(id);
    sendResponse(res, 200, "Success", {
      message: "Batch and associated image deleted successfully!",
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

batchController.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const BatchDetails = await Batch.findOne({ _id: id })
      .populate("categoryId")
      .populate("subCategoryId")
      .populate("instructorId");

    if (!BatchDetails) {
      return sendResponse(res, 404, "Failed", {
        message: "Batch not found",
        statusCode: 404,
      });
    }

    sendResponse(res, 200, "Success", {
      message: "Batch details retrieved successfully!",
      data: BatchDetails,
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

module.exports = batchController;
